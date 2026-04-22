import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FileService } from '../../core/services/file.service';
import { ExecutionService } from '../../core/services/execution.service';
import { VersionService } from '../../core/services/version.service';
import { CommentService } from '../../core/services/comment.service';
import { ProjectService } from '../../core/services/project.service';
import { NotificationComponent } from '../notification/notification.component';
import { CollabService } from '../../core/services/collab.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NotificationComponent],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy {

  // Project & File
  projectId!: number;
  project: any = null;
  files: any[] = [];
  selectedFile: any = null;
  fileContent = '';
  user: any = null;

  // UI State
  activePanel = 'files';
  isRunning = false;
  isSaving = false;
  showCreateFileModal = false;
  showCreateFolderModal = false;
  showSnapshotModal = false;
  showCommentsPanel = false;
  showVersionPanel = false;

  // Execution
  jobId = '';
  output = '';
  outputError = '';
  jobStatus = '';
  pollingInterval: any = null;
  stdin = '';

  // Version
  snapshots: any[] = [];
  snapshotMsg = '';
  diffResult: any = null;
  selectedSnap1: number | null = null;
  selectedSnap2: number | null = null;

  // Comments
  comments: any[] = [];
  newComment = {
    content: '',
    lineNumber: 1,
    parentCommentId: null
  
  };
  // Comment replies
  replyingTo: number | null = null;
  replyContent = '';
  commentReplies: { [commentId: number]: any[] } = {};

  // Branches & Tags
  branches: string[] = ['main'];
  currentBranch = 'main';
  showCreateBranchModal = false;
  showTagModal = false;
  newBranchName = '';
  newTagName = '';

  // Create file/folder
  newFileName = '';
  newFolderName = '';
  newFileLanguage = 'Python';

  // Collaboration
  currentSession: any = null;
  showSessionModal = false;
  showJoinModal = false;
  sessionLink = '';
  sessionPassword = '';
  maxParticipants = 10;
  participants: any[] = [];
  joinSessionId = '';
  joinPassword = '';

  languages = ['Python','JavaScript','TypeScript',
    'Java','CSharp','C','C++','Go','Rust','PHP','Ruby'];
  
  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private fileService: FileService,
    private executionService: ExecutionService,
    private versionService: VersionService,
    private commentService: CommentService,
    private projectService: ProjectService,
    private collabService: CollabService ){}

 ngOnInit() {
    this.projectId = Number(
        this.route.snapshot.paramMap.get('projectId'));
    this.auth.getProfile().subscribe({
        next: (res: any) => this.user = res,
        error: () => this.user = this.auth.getCurrentUser()
    });
    this.loadProject();
    this.loadFiles();
    this.loadBranches();
   }

  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  loadProject() {
    this.projectService.getProjectById(this.projectId)
      .subscribe({
        next: (res: any) => this.project = res,
        error: () => {}
      });
  }

  loadFiles() {
    this.fileService.getFileTree(this.projectId)
      .subscribe({
        next: (res: any[]) => {
          this.files = res;
          if (res.length > 0 && !this.selectedFile) {
            const firstFile = res.find(
              (f: any) => !f.isFolder);
            if (firstFile) this.selectFile(firstFile);
          }
        },
        error: () => this.files = []
      });
  }

  selectFile(file: any) {
    if (file.isFolder) return;
    this.selectedFile = file;
    this.fileService.getFileContent(file.fileId)
      .subscribe({
        next: (res: any) => {
          this.fileContent = res.content || '';
        },
        error: () => this.fileContent = ''
      });
    this.loadComments(file.fileId);
  }

  saveFile() {
    if (!this.selectedFile) return;
    this.isSaving = true;
    this.fileService.updateContent(
      this.selectedFile.fileId, {
        content: this.fileContent,
        editedByUserId: this.getUserId()
      }).subscribe({
        next: () => {
          this.isSaving = false;
        },
        error: () => this.isSaving = false
      });
  }

  createFile() {
    if (!this.newFileName.trim()) return;
    this.fileService.createFile({
      projectId: this.projectId,
      name: this.newFileName,
      path: this.newFileName,
      language: this.newFileLanguage,
      content: ''
    }).subscribe({
      next: () => {
        this.showCreateFileModal = false;
        this.newFileName = '';
        this.loadFiles();
      },
      error: (err: any) =>
        alert(err.error?.message || 'Failed!')
    });
  }

  createFolder() {
    if (!this.newFolderName.trim()) return;
    this.fileService.createFolder({
      projectId: this.projectId,
      name: this.newFolderName,
      path: this.newFolderName
    }).subscribe({
      next: () => {
        this.showCreateFolderModal = false;
        this.newFolderName = '';
        this.loadFiles();
      },
      error: (err: any) =>
        alert(err.error?.message || 'Failed!')
    });
  }

  deleteFile(file: any) {
    if (!confirm(`Delete ${file.name}?`)) return;
    this.fileService.deleteFile(file.fileId).subscribe({
      next: () => {
        if (this.selectedFile?.fileId === file.fileId) {
          this.selectedFile = null;
          this.fileContent = '';
        }
        this.loadFiles();
      }
    });
  }

  runCode() {
    if (!this.selectedFile) {
      alert('Please select a file first!');
      return;
    }
    this.isRunning = true;
    this.output = '';
    this.outputError = '';
    this.jobStatus = 'QUEUED';

    this.executionService.submitCode({
      projectId: this.projectId,
      fileId: this.selectedFile.fileId,
      language: this.selectedFile.language ||
        this.project?.language || 'Python',
      sourceCode: this.fileContent,
      stdin: this.stdin || null
    }).subscribe({
      next: (res: any) => {
        this.jobId = res.jobId;
        this.pollResult();
      },
      error: (err: any) => {
        this.isRunning = false;
        this.outputError =
          err.error?.message || 'Execution failed!';
      }
    });
  }

  pollResult() {
    this.pollingInterval = setInterval(() => {
      this.executionService.getResult(this.jobId)
        .subscribe({
          next: (res: any) => {
            this.jobStatus = res.status;
            if (res.status === 'COMPLETED' ||
              res.status === 'FAILED' ||
              res.status === 'TIMED_OUT' ||
              res.status === 'CANCELLED') {
              clearInterval(this.pollingInterval);
              this.isRunning = false;
              this.output = res.stdout || '';
              this.outputError = res.stderr || '';
            }
          },
          error: () => {
            clearInterval(this.pollingInterval);
            this.isRunning = false;
          }
        });
    }, 2000);
  }

  cancelExecution() {
    if (!this.jobId) return;
    this.executionService.cancelJob(this.jobId).subscribe({
      next: () => {
        clearInterval(this.pollingInterval);
        this.isRunning = false;
        this.jobStatus = 'CANCELLED';
      }
    });
  }

  createSnapshot() {
    if (!this.selectedFile || !this.snapshotMsg.trim()) {
      alert('Select a file and enter a commit message!');
      return;
    }
    this.versionService.createSnapshot({
      projectId: this.projectId,
      fileId: this.selectedFile.fileId,
      message: this.snapshotMsg,
      content: this.fileContent,
      branch: 'main'
    }).subscribe({
      next: () => {
        this.showSnapshotModal = false;
        this.snapshotMsg = '';
        this.loadSnapshots();
        alert('Snapshot created!');
      },
      error: (err: any) =>
        alert(err.error?.message || 'Failed!')
    });
  }

  loadSnapshots() {
    if (!this.selectedFile) return;
    this.versionService.getByFile(
      this.selectedFile.fileId).subscribe({
      next: (res: any[]) => this.snapshots = res,
      error: () => this.snapshots = []
    });
  }

  restoreSnapshot(snapshotId: number) {
    if (!confirm('Restore this snapshot? Your current changes will be saved as a new snapshot.')) return;
    
    // First, get the snapshot content
    this.versionService.getSnapshotById(snapshotId)
      .subscribe({
        next: (snapshot: any) => {
          const restoredContent = snapshot.content || snapshot.fileContent || '';
          
          // Update editor content immediately
          this.fileContent = restoredContent;
          
          // Save to file
          if (this.selectedFile) {
            this.isSaving = true;
            this.fileService.updateContent(
              this.selectedFile.fileId, {
                content: restoredContent,
                editedByUserId: this.getUserId()
              }).subscribe({
                next: () => {
                  this.isSaving = false;
                  alert('Snapshot restored successfully!');
                  this.loadSnapshots(); // Refresh list
                },
                error: (err: any) => {
                  this.isSaving = false;
                  console.error('Save error:', err);
                  alert('Content restored in editor but failed to save. Please manually click Save.');
                }
              });
          }
        },
        error: (err: any) => {
          console.error('Get snapshot error:', err);
          alert('Failed to get snapshot content: ' + (err.error?.message || 'Unknown error'));
        }
      });
  }

  diffSnapshots() {
    if (!this.selectedSnap1 || !this.selectedSnap2) {
      alert('Select two snapshots to compare!');
      return;
    }
    this.versionService.diffSnapshots(
      this.selectedSnap1, this.selectedSnap2).subscribe({
      next: (res: any) => this.diffResult = res,
      error: () => alert('Diff failed!')
    });
  }

  loadComments(fileId: number) {
    this.commentService.getByFile(fileId).subscribe({
      next: (res: any[]) => {
        this.comments = res;
        // Load replies for each comment
        this.comments.forEach(c => this.loadReplies(c.commentId));
      },
      error: () => this.comments = []
    });
  }

  addComment() {
    if (!this.newComment.content.trim() ||
      !this.selectedFile) return;
    this.commentService.addComment({
      projectId: this.projectId,
      fileId: this.selectedFile.fileId,
      content: this.newComment.content,
      lineNumber: this.newComment.lineNumber,
      parentCommentId: this.newComment.parentCommentId
    }).subscribe({
      next: () => {
        this.newComment = {
          content: '', lineNumber: 1,
          parentCommentId: null
        };
        this.loadComments(this.selectedFile.fileId);
      }
    });
  }

  resolveComment(id: number) {
    this.commentService.resolveComment(id).subscribe({
      next: () => {
        if (this.selectedFile) {
          this.loadComments(this.selectedFile.fileId);
        }
      }
    });
  }

  deleteComment(id: number) {
    if (!confirm('Delete comment?')) return;
    this.commentService.deleteComment(id).subscribe({
      next: () => {
        if (this.selectedFile) {
          this.loadComments(this.selectedFile.fileId);
        }
      }
    });
  }

  toggleReply(commentId: number) {
    this.replyingTo = this.replyingTo === commentId ? null : commentId;
    this.replyContent = '';
  }

  loadReplies(commentId: number) {
    this.commentService.getReplies(commentId).subscribe({
      next: (res: any[]) => {
        this.commentReplies[commentId] = res;
      },
      error: () => this.commentReplies[commentId] = []
    });
  }

  addReply(parentComment: any) {
    if (!this.replyContent.trim() || !this.selectedFile) return;

    this.commentService.addComment({
      projectId: this.projectId,
      fileId: this.selectedFile.fileId,
      content: this.replyContent,
      lineNumber: parentComment.lineNumber,
      parentCommentId: parentComment.commentId
    }).subscribe({
      next: () => {
        this.replyContent = '';
        this.replyingTo = null;
        this.loadReplies(parentComment.commentId);
        alert('Reply added!');
      },
      error: (err) => alert('Failed to add reply')
    });
  }

  getUserId(): number {
    try {
      const token = this.auth.getToken();
      if (!token) return 1;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Number(payload[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ]) || 1;
    } catch { return 1; }
  }

  getFileIcon(file: any): string {
    if (file.isFolder) return '📁';
    const ext = file.name.split('.').pop()?.toLowerCase();
    const icons: any = {
      'py': '🐍', 'js': '📜', 'ts': '📘',
      'cs': '⚙️', 'java': '☕', 'go': '🐹',
      'rs': '🦀', 'php': '🐘', 'rb': '💎',
      'cpp': '⚡', 'c': '⚡', 'md': '📝',
      'json': '📋', 'html': '🌐', 'css': '🎨'
    };
    return icons[ext || ''] || '📄';
  }
  loadBranches() {
    // Start with main branch only (backend doesn't have list endpoint)
    this.branches = ['main'];
    this.currentBranch = 'main';
  }

  switchBranch(branch: string) {
  this.currentBranch = branch;
  this.versionService.getSnapshotsByBranch(branch).subscribe({
    next: (res: any[]) => {
      this.snapshots = res;
    },
    error: (err) => {
      console.log('Error loading branch snapshots:', err);
      this.snapshots = [];
    }
  });
}

  createBranch() {
    if (!this.newBranchName.trim() || !this.selectedFile) return;
    
    // Get latest snapshot for this file
    const latestSnapshot = this.snapshots[0];
    if (!latestSnapshot) {
      alert('Create a snapshot first!');
      return;
    }
    const snapshotId = latestSnapshot.snapshotId || latestSnapshot.SnapshotId;


    this.versionService.createBranch({
      projectId: this.projectId,
      fileId: this.selectedFile.fileId,
      branchName: this.newBranchName,
      fromSnapshotId: snapshotId
    }).subscribe({
      next: () => {
        this.showCreateBranchModal = false;
        if (!this.branches.includes(this.newBranchName)) {
        this.branches.push(this.newBranchName);
      }
      this.currentBranch = this.newBranchName;

        this.newBranchName = '';
        alert('Branch created!');
      },
      error: (err) => alert(err.error?.message || 'Failed to create branch')
    });
  }

  tagCurrentSnapshot() {
    if (!this.newTagName.trim() || !this.selectedFile) return;
    
    const latestSnapshot = this.snapshots[0];
    if (!latestSnapshot) {
      alert('Create a snapshot first!');
      return;
    }

    this.versionService.tagSnapshot({
      snapshotId: latestSnapshot.snapshotId,
      tag: this.newTagName
    }).subscribe({
      next: () => {
        this.showTagModal = false;
        this.newTagName = '';
        this.loadSnapshots();
        alert('Tag added!');
      },
      error: (err) => alert(err.error?.message || 'Failed to add tag')
    });
  }
  startSession() {
    if (!this.selectedFile) {
      alert('Select a file first!');
      return;
    }

    this.collabService.createSession({
      projectId: this.projectId,
      fileId: this.selectedFile.fileId,
      language: this.selectedFile.language || 'Python',
      maxParticipants: this.maxParticipants,
      isPasswordProtected: !!this.sessionPassword,
      sessionPassword: this.sessionPassword || undefined
    }).subscribe({
      next: (res: any) => {
        this.currentSession = res.session;
        this.sessionLink = `${window.location.origin}/join/${res.session.sessionId}`;
        this.showSessionModal = true;
        this.loadParticipants();
      },
      error: (err) => alert('Failed to start session: ' + err.message)
    });
  }

  loadParticipants() {
    if (!this.currentSession) return;
    
    this.collabService.getParticipants(this.currentSession.sessionId).subscribe({
      next: (res: any[]) => this.participants = res,
      error: () => this.participants = []
    });
  }

  copySessionLink() {
    navigator.clipboard.writeText(this.sessionLink);
    alert('Link copied to clipboard!');
  }

  endSession() {
    if (!this.currentSession) return;
    
    this.collabService.endSession(this.currentSession.sessionId).subscribe({
      next: () => {
        this.currentSession = null;
        this.showSessionModal = false;
        this.participants = [];
        alert('Session ended!');
      },
      error: (err) => alert('Failed to end session')
    });
  }

  joinSession() {
    if (!this.joinSessionId) {
      alert('Enter session ID!');
      return;
    }

    const userId = this.getUserId();
    this.collabService.joinSession(this.joinSessionId, {
      userId: userId,
      sessionPassword: this.joinPassword || null
    }).subscribe({
      next: (res: any) => {
        this.currentSession = { sessionId: this.joinSessionId };
        this.showJoinModal = false;
        this.joinSessionId = '';
        this.joinPassword = '';
        alert('Joined session!');
        this.loadParticipants();
      },
      error: (err) => alert('Failed to join: ' + err.error?.message)
    });
  }

  logout() { this.auth.logout(); }
}
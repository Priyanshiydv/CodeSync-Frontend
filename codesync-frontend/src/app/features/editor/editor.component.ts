import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FileService } from '../../core/services/file.service';
import { ExecutionService } from '../../core/services/execution.service';
import { VersionService } from '../../core/services/version.service';
import { CommentService } from '../../core/services/comment.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy {

  // Project & File data
  projectId: number = 0;
  projectName: string = 'My Project';
  fileTree: any[] = [];
  selectedFile: any = null;
  fileContent: string = '';
  originalContent: string = '';
  hasUnsavedChanges: boolean = false;

  // User
  user: any = null;

  // UI State
  activePanel: string = 'files'; // files | versions | comments
  isSaving: boolean = false;
  isRunning: boolean = false;
  saveMessage: string = '';

  // Create file/folder
  showCreateFile: boolean = false;
  showCreateFolder: boolean = false;
  newFileName: string = '';
  newFolderName: string = '';
  newFileLanguage: string = 'plaintext';

  // Rename
  showRename: boolean = false;
  renameValue: string = '';

  // Execution
  executionOutput: string = '';
  executionError: string = '';
  executionStatus: string = '';
  jobId: string = '';
  pollInterval: any = null;
  stdin: string = '';
  showInputBox: boolean = false;

  // Version history
  snapshots: any[] = [];
  showCreateSnapshot: boolean = false;
  snapshotMessage: string = '';
  showDiff: boolean = false;
  diffResult: any = null;
  selectedSnap1: number = 0;
  selectedSnap2: number = 0;

  // Comments
  comments: any[] = [];
  newComment: string = '';
  selectedLine: number = 1;
  showCommentBox: boolean = false;

  languages = [
    'plaintext','python','javascript','typescript',
    'java','csharp','c','cpp','go','rust','php','ruby'
  ];

  getLineNumbers(): number[] {
    const lines = this.fileContent.split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  }

  handleTab(event: Event) {
    const e = event as KeyboardEvent;
    e.preventDefault();
    const textarea = e.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    this.fileContent =
        this.fileContent.substring(0, start) +
        '  ' +
        this.fileContent.substring(end);
    setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
    });
    this.onContentChange();
   }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fileService: FileService,
    private executionService: ExecutionService,
    private versionService: VersionService,
    private commentService: CommentService,
    private authService: AuthService) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.authService.getProfile().subscribe({
      next: (res: any) => this.user = res,
      error: () => {}
    });

    this.route.params.subscribe(params => {
      this.projectId = +params['projectId'];
      this.projectName = params['projectName'] || 'My Project';
      this.loadFileTree();
    });
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  // ─── FILE TREE ────────────────────────────────────
  loadFileTree() {
    this.fileService.getFileTree(this.projectId).subscribe({
      next: (res: any[]) => this.fileTree = res,
      error: () => this.fileTree = []
    });
  }

  selectFile(file: any) {
    if (file.isFolder) return;
    this.selectedFile = file;
    this.executionOutput = '';
    this.executionError = '';

    this.fileService.getFileContent(file.fileId).subscribe({
      next: (res: any) => {
        this.fileContent = res.content || '';
        this.originalContent = this.fileContent;
        this.hasUnsavedChanges = false;
        this.loadComments(file.fileId);
      },
      error: () => {
        this.fileContent = '';
        this.originalContent = '';
      }
    });
  }

  onContentChange() {
    this.hasUnsavedChanges = this.fileContent !== this.originalContent;
  }

  // ─── SAVE FILE ────────────────────────────────────
  saveFile() {
    if (!this.selectedFile) return;
    this.isSaving = true;

    const userId = this.user?.userId || this.user?.id || 1;

    this.fileService.updateFileContent(
      this.selectedFile.fileId, {
        content: this.fileContent,
        editedByUserId: userId
      }).subscribe({
      next: () => {
        this.isSaving = false;
        this.originalContent = this.fileContent;
        this.hasUnsavedChanges = false;
        this.saveMessage = 'Saved!';
        setTimeout(() => this.saveMessage = '', 2000);
      },
      error: () => {
        this.isSaving = false;
        this.saveMessage = 'Save failed!';
        setTimeout(() => this.saveMessage = '', 2000);
      }
    });
  }

  // ─── CREATE FILE ──────────────────────────────────
  createFile() {
    if (!this.newFileName.trim()) return;
    const userId = this.user?.userId || this.user?.id || 1;

    this.fileService.createFile({
      name: this.newFileName,
      path: this.newFileName,
      language: this.newFileLanguage,
      content: '',
      projectId: this.projectId,
      createdById: userId
    }).subscribe({
      next: () => {
        this.showCreateFile = false;
        this.newFileName = '';
        this.loadFileTree();
      },
      error: (err: any) => alert(err.error?.message || 'Failed!')
    });
  }

  // ─── CREATE FOLDER ────────────────────────────────
  createFolder() {
    if (!this.newFolderName.trim()) return;

    this.fileService.createFolder({
      name: this.newFolderName,
      path: this.newFolderName,
      projectId: this.projectId
    }).subscribe({
      next: () => {
        this.showCreateFolder = false;
        this.newFolderName = '';
        this.loadFileTree();
      },
      error: (err: any) => alert(err.error?.message || 'Failed!')
    });
  }

  // ─── RENAME FILE ──────────────────────────────────
  openRename() {
    if (!this.selectedFile) return;
    this.renameValue = this.selectedFile.name;
    this.showRename = true;
  }

  renameFile() {
    if (!this.renameValue.trim()) return;

    this.fileService.renameFile(
      this.selectedFile.fileId,
      { newName: this.renameValue }
    ).subscribe({
      next: () => {
        this.showRename = false;
        this.loadFileTree();
      },
      error: (err: any) => alert(err.error?.message || 'Failed!')
    });
  }

  // ─── DELETE FILE ──────────────────────────────────
  deleteFile() {
    if (!this.selectedFile) return;
    if (!confirm(`Delete "${this.selectedFile.name}"?`)) return;

    this.fileService.deleteFile(this.selectedFile.fileId)
      .subscribe({
        next: () => {
          this.selectedFile = null;
          this.fileContent = '';
          this.loadFileTree();
        },
        error: (err: any) => alert(err.error?.message || 'Failed!')
      });
  }

  // ─── RUN CODE ─────────────────────────────────────
  runCode() {
    if (!this.selectedFile || !this.fileContent.trim()) return;

    this.isRunning = true;
    this.executionOutput = '';
    this.executionError = '';
    this.executionStatus = 'QUEUED';

    const userId = this.user?.userId || this.user?.id || 1;

    // Map file language to execution language
    const langMap: any = {
      'python': 'Python', 'javascript': 'JavaScript',
      'java': 'Java', 'csharp': 'CSharp',
      'cpp': 'C++', 'c': 'C', 'go': 'Go',
      'rust': 'Rust', 'php': 'PHP', 'ruby': 'Ruby',
      'typescript': 'TypeScript'
    };

    const language = langMap[
      this.selectedFile.language?.toLowerCase()
    ] || 'Python';

    this.executionService.submitExecution({
      projectId: this.projectId,
      fileId: this.selectedFile.fileId,
      language: language,
      sourceCode: this.fileContent,
      stdin: this.stdin || null,
      userId: userId
    }).subscribe({
      next: (res: any) => {
        this.jobId = res.jobId;
        this.pollForResult();
      },
      error: (err: any) => {
        this.isRunning = false;
        this.executionError = err.error?.message || 'Execution failed!';
      }
    });
  }

  pollForResult() {
    let attempts = 0;
    this.pollInterval = setInterval(() => {
      attempts++;
      this.executionService.getJobResult(this.jobId).subscribe({
        next: (res: any) => {
          this.executionStatus = res.status;

          if (res.status === 'COMPLETED') {
            clearInterval(this.pollInterval);
            this.isRunning = false;
            this.executionOutput = res.stdout || 'No output';
            this.executionError = res.stderr || '';
          } else if (
            res.status === 'FAILED' ||
            res.status === 'TIMED_OUT' ||
            res.status === 'CANCELLED') {
            clearInterval(this.pollInterval);
            this.isRunning = false;
            this.executionError = res.stderr ||
              `Execution ${res.status.toLowerCase()}`;
          }

          // Stop polling after 30 attempts (60 seconds)
          if (attempts >= 30) {
            clearInterval(this.pollInterval);
            this.isRunning = false;
            this.executionError = 'Execution timed out!';
          }
        },
        error: () => {}
      });
    }, 2000);
  }

  cancelExecution() {
    if (!this.jobId) return;
    this.executionService.cancelJob(this.jobId).subscribe({
      next: () => {
        clearInterval(this.pollInterval);
        this.isRunning = false;
        this.executionStatus = 'CANCELLED';
      }
    });
  }

  // ─── VERSION CONTROL ──────────────────────────────
  loadVersionHistory() {
    if (!this.selectedFile) return;
    this.versionService.getFileHistory(
      this.selectedFile.fileId).subscribe({
      next: (res: any[]) => this.snapshots = res,
      error: () => this.snapshots = []
    });
  }

  createSnapshot() {
    if (!this.selectedFile || !this.snapshotMessage.trim()) return;
    const userId = this.user?.userId || this.user?.id || 1;

    this.versionService.createSnapshot({
      projectId: this.projectId,
      fileId: this.selectedFile.fileId,
      message: this.snapshotMessage,
      content: this.fileContent,
      branch: 'main',
      authorId: userId
    }).subscribe({
      next: () => {
        this.showCreateSnapshot = false;
        this.snapshotMessage = '';
        this.loadVersionHistory();
      },
      error: (err: any) => alert(err.error?.message || 'Failed!')
    });
  }

  restoreSnapshot(snapshotId: number) {
    if (!confirm('Restore this snapshot? Current content will be replaced.'))
      return;

    this.versionService.restoreSnapshot(snapshotId).subscribe({
      next: (res: any) => {
        this.fileContent = res.snapshot?.content || this.fileContent;
        this.loadVersionHistory();
      },
      error: (err: any) => alert(err.error?.message || 'Failed!')
    });
  }

  compareDiff() {
    if (!this.selectedSnap1 || !this.selectedSnap2) return;
    this.versionService.diffSnapshots(
      this.selectedSnap1, this.selectedSnap2).subscribe({
      next: (res: any) => {
        this.diffResult = res;
        this.showDiff = true;
      },
      error: () => {}
    });
  }

  // ─── COMMENTS ─────────────────────────────────────
  loadComments(fileId: number) {
    this.commentService.getByFile(fileId).subscribe({
      next: (res: any[]) => this.comments = res,
      error: () => this.comments = []
    });
  }

  addComment() {
    if (!this.newComment.trim() || !this.selectedFile) return;
    const userId = this.user?.userId || this.user?.id || 1;

    this.commentService.addComment({
      projectId: this.projectId,
      fileId: this.selectedFile.fileId,
      content: this.newComment,
      lineNumber: this.selectedLine,
      columnNumber: 0,
      authorId: userId
    }).subscribe({
      next: () => {
        this.newComment = '';
        this.showCommentBox = false;
        this.loadComments(this.selectedFile.fileId);
      },
      error: (err: any) => alert(err.error?.message || 'Failed!')
    });
  }

  resolveComment(commentId: number) {
    this.commentService.resolveComment(commentId).subscribe({
      next: () => this.loadComments(this.selectedFile.fileId)
    });
  }

  deleteComment(commentId: number) {
    if (!confirm('Delete this comment?')) return;
    this.commentService.deleteComment(commentId).subscribe({
      next: () => this.loadComments(this.selectedFile.fileId)
    });
  }

  // ─── PANEL SWITCH ─────────────────────────────────
  switchPanel(panel: string) {
    this.activePanel = panel;
    if (panel === 'versions' && this.selectedFile) {
      this.loadVersionHistory();
    }
    if (panel === 'comments' && this.selectedFile) {
      this.loadComments(this.selectedFile.fileId);
    }
  }

  getFileIcon(file: any): string {
    if (file.isFolder) return '📁';
    const ext = file.name?.split('.').pop()?.toLowerCase();
    const icons: any = {
      'ts': '🔷', 'js': '🟨', 'py': '🐍',
      'cs': '💜', 'java': '☕', 'go': '🐹',
      'rs': '🦀', 'cpp': '⚙️', 'c': '⚙️',
      'html': '🌐', 'css': '🎨', 'scss': '🎨',
      'json': '📋', 'md': '📝', 'txt': '📄'
    };
    return icons[ext] || '📄';
  }

  logout() { this.authService.logout(); }
}
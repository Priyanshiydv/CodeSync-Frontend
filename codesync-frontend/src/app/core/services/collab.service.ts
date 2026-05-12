import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

export interface EditOperation {
  type: 'insert' | 'delete' | 'full';
  position: number;
  text?: string;
  length?: number;
  content?: string;
  revision: number;
  userId: number;
}

@Injectable({ providedIn: 'root' })
export class CollabService {
  private baseUrl = `${environment.collabApi}/api/sessions`;
  
  private hubConnection: signalR.HubConnection | null = null;
  
  private receiveEditCallback: ((operation: EditOperation, content: string) => void) | null = null;
  private cursorUpdateCallback: ((userId: number, line: number, col: number, color: string) => void) | null = null;
  private participantJoinedCallback: ((connectionId: string) => void) | null = null;
  private participantLeftCallback: ((connectionId: string) => void) | null = null;
  private sessionEndedCallback: (() => void) | null = null;

  constructor(private http: HttpClient) {}

  offAllListeners(): void {
    this.receiveEditCallback = null;
    this.cursorUpdateCallback = null;
    this.participantJoinedCallback = null;
    this.participantLeftCallback = null;
    this.sessionEndedCallback = null;
    
    if (this.hubConnection) {
      this.hubConnection.off('ReceiveChange');
      this.hubConnection.off('CursorUpdated');
      this.hubConnection.off('ParticipantJoined');
      this.hubConnection.off('ParticipantLeft');
      this.hubConnection.off('SessionEnded');
    }
  }

  createSession(data: {
    projectId: number;
    fileId: number;
    language: string;
    maxParticipants?: number;
    isPasswordProtected?: boolean;
    sessionPassword?: string
  }): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  getSession(sessionId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${sessionId}`);
  }

  joinSession(sessionId: string, data: {
    userId: number;
    sessionPassword?: string | null
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${sessionId}/join`, data);
  }

  leaveSession(sessionId: string, userId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${sessionId}/leave?userId=${userId}`, {});
  }

  endSession(sessionId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${sessionId}/end`, {});
  }

  getParticipants(sessionId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${sessionId}/participants`);
  }

  updateCursor(sessionId: string, data: {
    userId: number;
    cursorLine: number;
    cursorCol: number
  }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${sessionId}/cursor`, data);
  }

  startConnection(sessionId: string, token: string): Promise<void> {
    if (this.hubConnection &&
        this.hubConnection.state === signalR.HubConnectionState.Connected) {
        return this.hubConnection.invoke('JoinSession', sessionId);
    }

    if (this.hubConnection) {
        this.hubConnection.stop();
        this.hubConnection = null;
    }

    const hubUrl = `${environment.collabApi}/hubs/collab`;

    this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

    this.hubConnection.on('ReceiveChange', (userId, content, operationType, position, insertedText, deletedLength, revision) => {
      if (this.receiveEditCallback) {
        const operation: EditOperation = {
          type: operationType as 'insert' | 'delete' | 'full',
          position: position,
          text: insertedText || undefined,
          length: deletedLength,
          content: content,
          revision: revision,
          userId: userId
        };
        this.receiveEditCallback(operation, content);
      }
    });

    this.hubConnection.on('CursorUpdated', (userId, line, col) => {
      if (this.cursorUpdateCallback) {
        this.cursorUpdateCallback(userId, line, col, '#FF5733');
      }
    });

    this.hubConnection.on('ParticipantJoined', (connectionId) => {
      if (this.participantJoinedCallback) {
        this.participantJoinedCallback(connectionId);
      }
    });

    this.hubConnection.on('ParticipantLeft', (connectionId) => {
      if (this.participantLeftCallback) {
        this.participantLeftCallback(connectionId);
      }
    });

    this.hubConnection.on('SessionEnded', () => {
      if (this.sessionEndedCallback) {
        this.sessionEndedCallback();
      }
    });

    return this.hubConnection
        .start()
        .then(() => {
          return this.hubConnection!.invoke('JoinSession', sessionId);
        })
        .catch(err => {
          console.error('SignalR error:', err);
          throw err;
        });
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().catch(() => {});
      this.hubConnection = null;
    }
  }

  // OT methods - send operations instead of full content
  sendInsert(sessionId: string, userId: number, position: number, text: string, revision: number): void {
    this.hubConnection?.invoke(
      'BroadcastChange',
      sessionId, userId, '', 'insert', position, text, 0, revision
    ).catch(err => console.error('SendInsert error:', err));
  }

  sendDelete(sessionId: string, userId: number, position: number, length: number, revision: number): void {
    this.hubConnection?.invoke(
      'BroadcastChange',
      sessionId, userId, '', 'delete', position, null, length, revision
    ).catch(err => console.error('SendDelete error:', err));
  }

  sendFullContent(sessionId: string, userId: number, content: string, revision: number): void {
    this.hubConnection?.invoke(
      'BroadcastChange',
      sessionId, userId, content, 'full', 0, null, 0, revision
    ).catch(err => console.error('SendFullContent error:', err));
  }

  sendCursor(sessionId: string, userId: number, line: number, col: number): void {
    this.hubConnection?.invoke('UpdateCursor', sessionId, userId, line, col)
      .catch(err => console.error('SendCursor error:', err));
  }

  // Callback registration
  onReceiveEdit(callback: (operation: EditOperation, content: string) => void): void {
    this.receiveEditCallback = callback;
  }

  onCursorUpdate(callback: (userId: number, line: number, col: number, color: string) => void): void {
    this.cursorUpdateCallback = callback;
  }

  onParticipantJoined(callback: (connectionId: string) => void): void {
    this.participantJoinedCallback = callback;
  }

  onParticipantLeft(callback: (connectionId: string) => void): void {
    this.participantLeftCallback = callback;
  }

  onSessionEnded(callback: () => void): void {
    this.sessionEndedCallback = callback;
  }

  onConnected(callback: () => void): void {
    this.hubConnection?.onreconnected(() => callback());
    if (this.hubConnection?.state === 'Connected') {
      callback();
    }
  }

  isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as signalR from '@microsoft/signalr';

@Injectable({ providedIn: 'root' })
export class CollabService {
  private baseUrl = 'http://localhost:5457/api/sessions';
  private hubConnection: signalR.HubConnection | null = null;

  constructor(private http: HttpClient) {}

  createSession(data: { projectId: number; fileId: number; language: string; maxParticipants?: number; isPasswordProtected?: boolean; sessionPassword?: string }): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  getSession(sessionId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${sessionId}`);
  }

  joinSession(sessionId: string, data: { userId: number; sessionPassword?: string | null }): Observable<any> {
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

  updateCursor(sessionId: string, data: { userId: number; cursorLine: number; cursorCol: number }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${sessionId}/cursor`, data);
  }
  // ─── SignalR ───────────────────────────────────────────────────────────────

    startConnection(sessionId: string, token: string): void {
    if (this.hubConnection) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`http://localhost:5457/hubs/collab?sessionId=${sessionId}`, {
        accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

    this.hubConnection
        .start()
        .then(() => console.log('SignalR connected'))
        .catch(err => console.error('SignalR error:', err));
    }

    stopConnection(): void {
    this.hubConnection?.stop();
    this.hubConnection = null;
    }

    sendEdit(sessionId: string, fileId: number, content: string, userId: number): void {
    this.hubConnection?.invoke('BroadcastChange', sessionId, fileId, content, userId)
        .catch(err => console.error('SendEdit error:', err));
    }

    sendCursor(sessionId: string, userId: number, line: number, col: number): void {
    this.hubConnection?.invoke('UpdateCursor', sessionId, userId, line, col)
        .catch(err => console.error('SendCursor error:', err));
    }

    onReceiveEdit(callback: (fileId: number, content: string, userId: number) => void): void {
    this.hubConnection?.on('ReceiveChange', (fileId, content, userId) => {
        callback(fileId, content, userId);
    });
    }

    onCursorUpdate(callback: (userId: number, line: number, col: number, color: string) => void): void {
    this.hubConnection?.on('CursorUpdate', (userId, line, col, color) => {
        callback(userId, line, col, color);
    });
    }

    onParticipantJoined(callback: (participant: any) => void): void {
    this.hubConnection?.on('ParticipantJoined', (participant) => {
        callback(participant);
    });
    }

    onParticipantLeft(callback: (userId: number) => void): void {
    this.hubConnection?.on('ParticipantLeft', (userId) => {
        callback(userId);
    });
    }

    onSessionEnded(callback: () => void): void {
    this.hubConnection?.on('SessionEnded', () => {
        callback();
    });
    }   
}
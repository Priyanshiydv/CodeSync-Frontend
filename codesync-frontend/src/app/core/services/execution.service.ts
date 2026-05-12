import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExecutionService {

  private baseUrl = `${environment.executionApi}/api/executions`;
  private hubUrl = `${environment.executionApi}/hubs/execution`;
  // ADD — SignalR connection for real-time stdout streaming
  private connection: signalR.HubConnection | null = null;


  constructor(private http: HttpClient) {}

  submitCode(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/submit`, data);
  }

  getJobById(jobId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${jobId}`);
  }

  getResult(jobId: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/${jobId}/result`);
  }

  cancelJob(jobId: string): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/${jobId}/cancel`, {});
  }

  getSupportedLanguages(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/languages`);
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stats`);
  }
  // ── SignalR streaming methods ─────────────────────────────

  // Connect to execution hub and join job group
  connectToJob(jobId: string, token: string): Promise<void> {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    return this.connection.start().then(() => {
      this.connection!.invoke('JoinJob', jobId)
        .catch(err => console.error('JoinJob error:', err));
    });
  }

  // Disconnect and leave job group
  disconnectFromJob(jobId: string): void {
    if (this.connection) {
      this.connection.invoke('LeaveJob', jobId).catch(() => {});
      this.connection.stop();
      this.connection = null;
    }
  }

  // Listen for job started
  onJobStarted(callback: (jobId: string) => void): void {
    this.connection?.on('JobStarted', callback);
  }

  // Listen for stdout chunks streaming in real time
  onStdoutChunk(callback: (jobId: string, chunk: string) => void): void {
    this.connection?.on('StdoutChunk', callback);
  }

  // Listen for stderr chunks streaming in real time
  onStderrChunk(callback: (jobId: string, chunk: string) => void): void {
    this.connection?.on('StderrChunk', callback);
  }

  // Listen for job completed
  onJobCompleted(callback: (
    jobId: string,
    stdout: string,
    stderr: string,
    exitCode: number) => void): void {
    this.connection?.on('JobCompleted', callback);
  }

  // Listen for job timed out
  onJobTimedOut(callback: (jobId: string) => void): void {
    this.connection?.on('JobTimedOut', callback);
  }

  // Listen for job failed
  onJobFailed(callback: (jobId: string, error: string) => void): void {
    this.connection?.on('JobFailed', callback);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExecutionService {

  private baseUrl = 'http://localhost:5657/api/executions';

  constructor(private http: HttpClient) {}

  submitExecution(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/submit`, data);
  }

  getJobById(jobId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${jobId}`);
  }

  getJobResult(jobId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${jobId}/result`);
  }

  getSupportedLanguages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/languages`);
  }

  cancelJob(jobId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${jobId}/cancel`, {});
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VersionService {

  private baseUrl = 'http://localhost:5557/api/versions';

  constructor(private http: HttpClient) {}

  createSnapshot(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, data);
  }

  getFileHistory(fileId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/history/${fileId}`);
  }

  getLatestSnapshot(fileId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/latest/${fileId}`);
  }

  restoreSnapshot(snapshotId: number): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/${snapshotId}/restore`, {});
  }

  diffSnapshots(id1: number, id2: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/diff/${id1}/${id2}`);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VersionService {
  private baseUrl = `${environment.versionApi}/api/versions`;

  constructor(private http: HttpClient) {}

  createSnapshot(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  getSnapshotById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  getByFile(fileId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/file/${fileId}`);
  }

  getByProject(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/project/${projectId}`);
  }

  getHistory(fileId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/history/${fileId}`);
  }

  getLatest(fileId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/latest/${fileId}`);
  }

  restoreSnapshot(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/restore`, {});
  }

  diffSnapshots(id1: number, id2: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/diff/${id1}/${id2}`);
  }

  
  getSnapshotsByBranch(branch: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/branch/${branch}`);
  }

  createBranch(data: { projectId: number; fileId: number; branchName: string; fromSnapshotId: number }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/createBranch`, data);
  }

  tagSnapshot(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tag`, data);
  }

  getBranches(projectId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/project/${projectId}/branches`);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FileService {

  private baseUrl = 'http://localhost:5357/api/files';

  constructor(private http: HttpClient) {}

  createFile(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  createFolder(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/createFolder`, data);
  }

  getFileById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  getFilesByProject(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/project/${projectId}`);
  }

  getFileContent(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/content`);
  }

  getFileTree(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tree/${projectId}`);
  }

  searchInProject(projectId: number, query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/search/${projectId}?query=${query}`);
  }

  updateContent(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/content`, data);
  }

  renameFile(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/rename`, data);
  }

  moveFile(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/move`, data);
  }

  deleteFile(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  restoreFile(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/restore`, {});
  }
}
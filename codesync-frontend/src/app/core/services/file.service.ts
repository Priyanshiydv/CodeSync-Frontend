import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FileService {

  private baseUrl = 'http://localhost:5357/api/files';

  constructor(private http: HttpClient) {}

  getFileTree(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tree/${projectId}`);
  }

  getFileById(fileId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${fileId}`);
  }

  getFileContent(fileId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${fileId}/content`);
  }

  createFile(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, data);
  }

  createFolder(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/createFolder`, data);
  }

  updateFileContent(fileId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${fileId}/content`, data);
  }

  renameFile(fileId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${fileId}/rename`, data);
  }

  deleteFile(fileId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${fileId}`);
  }

  restoreFile(fileId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${fileId}/restore`, {});
  }

  searchInProject(projectId: number, query: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/search/${projectId}?query=${query}`);
  }
}
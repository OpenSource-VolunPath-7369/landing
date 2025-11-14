import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Infrastructure service for HTTP communication.
 * Provides centralized API access with error handling and loading state management.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:8080/api/v1';
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error ${error.status}: ${error.error?.message || error.message}`;
    }
    
    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  // GET request
  get<T>(endpoint: string): Observable<T> {
    this.setLoading(true);
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.setLoading(false)),
      catchError(this.handleError)
    );
  }

  // POST request
  post<T>(endpoint: string, data: any): Observable<T> {
    this.setLoading(true);
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.setLoading(false)),
      catchError(this.handleError)
    );
  }

  // PUT request
  put<T>(endpoint: string, data: any): Observable<T> {
    this.setLoading(true);
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.setLoading(false)),
      catchError(this.handleError)
    );
  }

  // PATCH request
  patch<T>(endpoint: string, data: any): Observable<T> {
    this.setLoading(true);
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.setLoading(false)),
      catchError(this.handleError)
    );
  }

  // DELETE request
  delete<T>(endpoint: string): Observable<T> {
    this.setLoading(true);
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.setLoading(false)),
      catchError(this.handleError)
    );
  }
}



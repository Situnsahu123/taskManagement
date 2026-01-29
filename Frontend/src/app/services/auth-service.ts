import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API = 'http://localhost:4000'; 

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API}/login`, data);
  }

  signup(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API}/register`, data);
  }

  saveToken(token: string, name: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('name', name);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    this.router.navigate(['/login']);
  }

}

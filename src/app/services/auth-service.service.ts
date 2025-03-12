import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, throwError } from 'rxjs';
import { VirtualNode } from '../classes/virtual-node.interface';
import { environment } from '../../../config/environment'; // Import environment
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})

@Injectable()
export class AuthServiceService {

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();


  private isCreateDocumentSubject = new BehaviorSubject<boolean>(false);
  isCreateDocument$ = this.isCreateDocumentSubject.asObservable();
  
  constructor(private http: HttpClient, private commonService: CommonService) { }

  getVirtualNodes(): Observable<VirtualNode[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + btoa(environment.username + ':' + environment.password)
      }),
      withCredentials: true
    };

    return this.http.get<any>(environment.apiURL + 'getVirtualNodes', httpOptions).pipe(
      map((response: any) => {
        if (response) {
          return response
        } else {
          return [];
        }
      }),
      catchError((error: any) => {
        console.error('Error fetching virtual nodes:', error);
        return [];
      })
    );
  }

  registerUser(shortHash:string, username: string, password: string, role: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + btoa(environment.username + ':' + environment.password)
      }),
        withCredentials: true
    };

    const requestBody = {
      clientRequestId: this.commonService.generateRandomString(32),
      flowClassName: environment.apiClassPath + '.RegisterNewUserFlow',
      requestBody: {
        loginName: username,
        password: password,
        role: role
      }
    };

    return this.http.post<any>(`${environment.apiURL}flow/${shortHash}`, requestBody, httpOptions).pipe(
      catchError((error: any) => {
        console.error('Error registering user:', error);
        return throwError(error);
      })
    );
  }

  getProfile(shortHash: string, token: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + btoa(environment.username + ':' + environment.password)
      }),
      withCredentials: true
    };

    const requestBody = {
      clientRequestId: this.commonService.generateRandomString(32),
      flowClassName: environment.apiClassPath + '.GetUserFlow',
      requestBody: {
        numberOfRecords: 1,
        token: token 
      }
    };

    return this.http.post<any>(`${environment.apiURL}flow/${shortHash}`, requestBody, httpOptions).pipe(
      catchError((error: any) => {
        console.error('Error registering user:', error);
        return throwError(error);
      })
    );
  }

  getPrivateKey(shortHash: string, token: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + btoa(environment.username + ':' + environment.password)
      }),
      withCredentials: true
    };

    const requestBody = {
      clientRequestId: this.commonService.generateRandomString(32),
      flowClassName: environment.apiClassPath + '.GetUserPrivateKeyFlow',
      requestBody: {
        token: token
      }
    };

    return this.http.post<any>(`${environment.apiURL}flow/${shortHash}`, requestBody, httpOptions).pipe(
      catchError((error: any) => {
        console.error('Error registering user:', error);
        return throwError(error);
      })
    );
  }

  checkRegistrationStatus(shortHash: string, requestID: string): Observable<any> {

    const headerUsername = environment.username
    const headerPassword = environment.password

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + btoa(headerUsername + ':' + headerPassword)
      })
    };
    
    const url = `${environment.apiURL}flow/${shortHash}/${requestID}`;
    return this.http.get<any>(url, httpOptions).pipe(
      catchError((error: any) => {
        console.error('Error registering user:', error);
        return throwError(error);
      })
    );
  }

  loginUser(shortHash: string, username: string, password: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + btoa(environment.username + ':' + environment.password)
      })
    };

    const requestBody = {
      clientRequestId: this.commonService.generateRandomString(32),
      flowClassName: environment.apiClassPath + '.GetTokenFlow',
      requestBody: {
        loginName: username,
        password: password,
      }
    };

    return this.http.post<any>(`${environment.apiURL}flow/${shortHash}`, requestBody, httpOptions).pipe(
      catchError((error: any) => {
        console.error('Error registering user:', error);
        return throwError(error);
      })
    );
  }

  getUserRole(): string | null {
    const token = sessionStorage.getItem('token');

    if (token && this.isTokenValid()) {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      return tokenPayload.role;
    } else {
      return null;
    }
  }

  isTokenValid(): boolean {
    try {
      const token = sessionStorage.getItem('token');
      if (token) {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) return false; // Invalid token format

        const payload = JSON.parse(atob(tokenParts[1]));
        if (!payload) return false;

        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp > currentTime; // Check if token has expired
    }else
    {
      return false;
    }
    } catch (error) {
      return false; // Invalid token format
    }
  }

  updateLoggedInStatus(status: boolean) {
    this.isLoggedInSubject.next(status);
  }

  updateRoleStatus(status: boolean) {
    this.isCreateDocumentSubject.next(status);
  }
}

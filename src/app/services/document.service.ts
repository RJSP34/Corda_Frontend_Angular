import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'config/environment';
import { Observable, catchError, of, throwError } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(private http: HttpClient, private commonService: CommonService) { }
  getDocuments(shortHash: string, token: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + btoa(environment.username + ':' + environment.password)
      })
    };

    const requestBody = {
      clientRequestId: this.commonService.generateRandomString(32),
      flowClassName: environment.apiClassPath + '.ListDocumentFlow',
      requestBody: {
        token: token
      }
    };

    return this.http.post<any>(`${environment.apiURL}flow/${shortHash}`, requestBody, httpOptions).pipe(
      catchError((error: any) => {
        console.error('Error getting document:', error);
        return throwError(error);
      })
    );
  }

  createDocument(shortHash: string, token: string, otherMember: string, authorizationID: string, pdfDataBase64: string, documentName: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + btoa(environment.username + ':' + environment.password)
      })
    };

    const requestBody = {
      clientRequestId: this.commonService.generateRandomString(32),
      flowClassName: environment.apiClassPath + '.CreateNewDocumentFlow',
      requestBody: {
        documentName: documentName,
        pdfData: pdfDataBase64,
        authorizationID: authorizationID,
        otherMember: otherMember,
        token: token
      }
    };

    return this.http.post<any>(`${environment.apiURL}flow/${shortHash}`, requestBody, httpOptions).pipe(
      catchError((error: any) => {
        console.error('Error getting document:', error);
        return throwError(error);
      })
    );
  }

  updateDocument(shortHash: string, token: string, id: string, pdfDataBase64: string, documentName: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + btoa(environment.username + ':' + environment.password)
      })
    };

    const requestBody = {
      clientRequestId: this.commonService.generateRandomString(32),
      flowClassName: environment.apiClassPath + '.UpdateDocumentFlow',
      requestBody: {
        id: id,
        documentname: documentName,
        pdfData: pdfDataBase64,
        token: token
      }
    };

    return this.http.post<any>(`${environment.apiURL}flow/${shortHash}`, requestBody, httpOptions).pipe(
      catchError((error: any) => {
        console.error('Error getting document:', error);
        return throwError(error);
      })
    );
  }

  signDocuments(documentid: string, shortHash: string, token: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + btoa(environment.username + ':' + environment.password)
      })
    };

    const requestBody = {
      clientRequestId: this.commonService.generateRandomString(32),
      flowClassName: environment.apiClassPath + '.SignatureFlow',
      requestBody: {
        id: documentid,
        token: token
      }
    };

    return this.http.post<any>(`${environment.apiURL}flow/${shortHash}`, requestBody, httpOptions).pipe(
      catchError((error: any) => {
        console.error('Error getting document:', error);
        return throwError(error);
      })
    );
  }

  getDocumentbyID(documentid: string, shortHash: string, token: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + btoa(environment.username + ':' + environment.password)
      })
    };

    const requestBody = {
      clientRequestId: this.commonService.generateRandomString(32),
      flowClassName: environment.apiClassPath + '.GetDocumentFlow',
      requestBody: {
        id: documentid,
        numberOfRecords: 20,
        token: token
      }
    };

    return this.http.post<any>(`${environment.apiURL}flow/${shortHash}`, requestBody, httpOptions).pipe(
      catchError((error: any) => {
        console.error('Error getting document:', error);
        return throwError(error);
      })
    );
  }

  deleteDocuments(documentid: string, shortHash: string, token: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + btoa(environment.username + ':' + environment.password)
      })
    };

    const requestBody = {
      clientRequestId: this.commonService.generateRandomString(32),
      flowClassName: environment.apiClassPath + '.DeleteDocumentFlow',
      requestBody: {
        id: documentid,
        token: token
      }
    };

    return this.http.post<any>(`${environment.apiURL}flow/${shortHash}`, requestBody, httpOptions).pipe(
      catchError((error: any) => {
        console.error('Error getting document:', error);
        return throwError(error);
      })
    );
  }

  deEncript(encript: string, privateKey: string): Observable<any> {
    const requestBody = {
        privatekeybase64: privateKey,
        textbase64: encript
    };

    const url = `${environment.apiURL}`;
    return this.http.post<any>(url, requestBody).pipe(
      catchError((error: any) => {
        console.error('Error ', error);
        return throwError(error);
      })
    );
  }
}

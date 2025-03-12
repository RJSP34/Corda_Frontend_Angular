import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, catchError, of } from 'rxjs';
import { UserRole } from '../classes/constants';
import { AuthServiceService } from '../services/auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class MyDocumentResolver implements Resolve<boolean> {
  constructor(private router: Router, private authService: AuthServiceService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const userRole = this.authService.getUserRole(); // Add parentheses to invoke the method

    if (!userRole) {
      this.router.navigate(['/login']);
      return of(null);
    }

    let columns: string[] = [];

    switch (userRole) {
      case UserRole.MedicalAuthority:
        columns = [ 'Document Name', 'Authorization ID', 'Signed', 'Completed', 'Created At', 'Last Updated', 'Version', 'Sign', 'Data'];
        break;
      case UserRole.Patient:
        columns = [ 'Document Name', 'Authorization ID', 'Signed', 'Completed', 'Created At', 'Last Updated', 'Version', 'Signned', 'Completed', 'Data'];
        break;
      default:
        columns = [ 'DocumentName', 'Last Changed', 'Regular User Column 1', 'Regular User Column 2'];
        break;
    }

    return of(columns).pipe(
      catchError(error => {
        console.error('Error in DocumentResolver:', error);
        return of([]); 
      })
    );
  }
}

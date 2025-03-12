import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(): boolean {
    if (this.isAuthenticated()) {
      return true; 
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }

  private isAuthenticated(): boolean {
    const token = sessionStorage.getItem('token');
    return !!token;
  }
}

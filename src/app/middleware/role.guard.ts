import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthServiceService } from '../services/auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthServiceService, private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree 
    {

    const userRole = this.authService.getUserRole();
    const requiredRoles = next.data['requiredRole'].split(',');

    const hasRequiredRole = requiredRoles.some((role: string) => userRole === role.trim()); // Adding type annotation

    if (hasRequiredRole) {
      return true;
    } else {
      return this.router.parseUrl('/access-denied');
    }
  }
}
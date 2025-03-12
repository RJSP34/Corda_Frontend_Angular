import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from 'src/app/classes/constants';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { DocumentService } from 'src/app/services/document.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isLoggedIn: boolean = false;
  isCreateDocument: boolean = false;
  imagePath: string = 'assets/imgs/R.png';
  imagePathProfile: string = 'assets/imgs/OIP.jpeg';
  constructor(private router: Router, private documentService: DocumentService, private authService: AuthServiceService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
    });

    this.authService.isCreateDocument$.subscribe((isCreateDocument) => {
      this.isCreateDocument = isCreateDocument;
    });

    const token = sessionStorage.getItem('token');
    this.isLoggedIn = !!token;

    const userRole = this.authService.getUserRole();
    if (!userRole) {
      this.logout();
      return;
    }

    switch (userRole) {
      case UserRole.MedicalAuthority:
        this.isCreateDocument = true;
        break;
      case UserRole.Patient:
        this.isCreateDocument = false;
        break;
      default:
        this.isCreateDocument = false;
        break;
    }
  }

  logout(): void {
    sessionStorage.clear();
    this.authService.updateLoggedInStatus(false);
    this.router.navigate(['/login']);
  }

  navigateTo(route: string) {
    this.router.navigateByUrl(route);
  }

  updateLoggedInStatus(status: boolean) {
    this.isLoggedIn = status;
    this.cdr.detectChanges();
  }
}

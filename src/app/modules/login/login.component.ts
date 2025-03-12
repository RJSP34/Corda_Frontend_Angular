import { Component } from '@angular/core';
import { AuthServiceService } from '../../services/auth-service.service'; 
import { VirtualNode } from '../../classes/virtual-node.interface'; 
import { Router } from '@angular/router';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  selectedMember: string = '';
  options: string[] = [];
  showValidationMessage: boolean = false;
  virtualNodes: VirtualNode[] = [];
  isLoading: boolean = false;

  constructor(private router: Router, private authService: AuthServiceService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.authService.getVirtualNodes().subscribe((virtualNodes: VirtualNode[]) => {
      this.virtualNodes = virtualNodes;
      this.options = virtualNodes
        .filter(node => !node.holdingIdentity.x500Name.includes('Notary'))
        .map(node => node.holdingIdentity.x500Name);
      this.isLoading = false;
    }, error => {
      console.error('Error fetching virtual nodes:', error);
      this.handleError('Failed to fetch virtual nodes.');
      this.isLoading = false;
    });
    this.isLoading = false;
  }

  login() {
    if (!this.validateInputs()) {
      this.showValidationMessage = true;
      return;
    }

    this.isLoading = true;
    const matchedNode = this.virtualNodes.find(node => node.holdingIdentity.x500Name === this.selectedMember);

    if (!matchedNode) {
      this.handleError('Selected member not found.');
      return;
    }
    const startTime = performance.now();

    const shortHash = matchedNode.holdingIdentity.shortHash;
    this.authService.loginUser(shortHash, this.username, this.password).pipe(
      catchError(async (error) => this.handleError('Error logging in: ' + error))
    ).subscribe(async (response) => {
      const { status, error, flow_results } = response;
          if (status === 'error') {
            this.handleError(error || 'Unknown error occurred.');
            return;
          } else if (status === 'completed') {
            const flowResultObject = JSON.parse(flow_results.flowResult);
            const Token = flowResultObject.token;

            sessionStorage.setItem('token', Token);
            sessionStorage.setItem('shortHash', flow_results.holdingIdentityShortHash);

            this.router.navigate(['/home']);

            this.authService.updateLoggedInStatus(true);

            const endTime = performance.now();
            console.log('Execution time:', endTime - startTime, 'milliseconds');
            return;
          }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  private validateInputs(): boolean {
    return !!this.username && !!this.password && !!this.selectedMember;
  }

  private handleError(errorMessage: string) {
    this.isLoading = false;
    console.error(errorMessage);
    this.router.navigate(['/error', { errorMessage }]);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
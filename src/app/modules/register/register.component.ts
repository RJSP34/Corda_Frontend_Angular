import { Component } from '@angular/core';
import { AuthServiceService } from '../../services/auth-service.service';
import { VirtualNode } from '../../classes/virtual-node.interface';
import { Router } from '@angular/router';
import { ROLES } from '../../classes/constants';
import { environment } from 'config/environment';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  role: string = '';
  selectedMember: string = ''; 
  roles: string[] = ROLES;
  options: string[] = [];
  showValidationMessage: boolean = false;
  virtualNodes: VirtualNode[] = [];
  isLoading: boolean = true;

  constructor(private router: Router, private authService: AuthServiceService) { } // Inject AuthServiceService

  ngOnInit(): void {
    this.authService.getVirtualNodes().subscribe((virtualNodes: VirtualNode[]) => {
      this.virtualNodes = virtualNodes;
      this.options = virtualNodes
        .filter(node => !node.holdingIdentity.x500Name.includes('Notary'))
        .map(node => node.holdingIdentity.x500Name);
    });
    this.isLoading = false;
  }

  async register() {
    this.isLoading = true;

    if (!this.validateInputs()) {
      this.showValidationMessage = true;
      return;
    }

    const matchedNode = this.virtualNodes.find(node => node.holdingIdentity.x500Name === this.selectedMember);

    if (!matchedNode) {
      this.isLoading = false;
      this.router.navigate(['/error', { errorMessage: 'Cannot find the Virtual Node. Refresh' }]);
      return;
    }

    const shortHash = matchedNode.holdingIdentity.shortHash;

    try {
      const response = await this.authService.registerUser(shortHash, this.username, this.password, this.role).toPromise();
      this.processRegistrationResponse(response);
    } catch (error) {
      this.isLoading = false;
      console.error("Registration failed:", error);
      this.router.navigate(['/error', { errorMessage: error || 'Unknown error occurred.' }]);
    }
  }

  private validateInputs(): boolean {
    return !!(this.username && this.password && this.selectedMember && this.confirmPassword && this.role && this.password === this.confirmPassword);
  }

  private async processRegistrationResponse(response: any) {
    this.processCheckStatusResponse(response);
  }

  private processCheckStatusResponse(response: any) {
    const { status, error, flow_results } = response;

    switch (status) {
      case 'error':
        this.router.navigate(['/error', { errorMessage: error + flow_results || 'Unknown error occurred.' }]);
        this.isLoading = false;
        return;
      case 'completed':
        this.handleFlowCompleted(flow_results);
        break;
      case 'running':
        return;
      default:
        this.router.navigate(['/error', { errorMessage: "Error on the creation of the Flow" }]);
        break;
    }
    this.isLoading = false;
  }

  private handleFlowCompleted(flow_results: any) {
    const {
      flowStatus,
      flowResult
    } = flow_results;

    switch (flowStatus) {
      case 'RUNNING':
        break;
      case 'COMPLETED':
        try {
          const flowResultObject = JSON.parse(flowResult);
          const { TransactionID, Private, Public } = flowResultObject;
          const keysMessage = 'Public Key:'+ Public + '\n' + 'Private Key:' + Private;
          this.router.navigate(['registration-complete'], { state: { message: keysMessage } });
          this.isLoading = false;
          return 
        } catch (error) {
          this.isLoading = false;
          this.router.navigate(['/error', { errorMessage: error || 'Unknown error occurred.' }]);
        }
        break;
      default:
        this.isLoading = false;
        this.router.navigate(['/error', { errorMessage: "Error on the creation of the Flow" }]);
        break;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
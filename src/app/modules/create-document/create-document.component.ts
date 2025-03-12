import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { VirtualNode } from '../../classes/virtual-node.interface';
import { AuthServiceService } from '../../services/auth-service.service';
import { DocumentService } from 'src/app/services/document.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-document',
  templateUrl: './create-document.component.html',
  styleUrls: ['./create-document.component.css']
})
export class CreateDocumentComponent {
  document = {
    name: '',
    data: '',
    authorizationId: '',
    selectedMember: ''
  };

  virtualNodes: VirtualNode[] = [];
  options: string[] = [];
  isLoading: boolean = true;
  X500Name: string | null | undefined;
  isFormEmpty: boolean = false;

  ngOnInit(): void {
    this.X500Name = sessionStorage.getItem('shortHash')
    this.authService.getVirtualNodes().subscribe((virtualNodes: VirtualNode[]) => {
      this.virtualNodes = virtualNodes;
      this.options = virtualNodes
        .filter(node => !node.holdingIdentity.x500Name.includes('Notary') && node.holdingIdentity.shortHash !== this.X500Name)
        .map(node => node.holdingIdentity.x500Name);
    });
    this.isLoading = false;
  }

  constructor(private router: Router, private authService: AuthServiceService, private documentService: DocumentService, private toastr: ToastrService ) { } // Inject AuthServiceService

  submitForm() {
    const shortHash = sessionStorage.getItem('shortHash') ?? '';
    const token = sessionStorage.getItem('token') ?? '';
    const startTime = performance.now();
    
    if (
      this.document &&
      this.document.selectedMember &&
      this.document.authorizationId &&
      this.document.data &&
      this.document.name
    ){
    this.isLoading = true;

    this.isFormEmpty = false;
    this.documentService.createDocument(shortHash, token, this.document.selectedMember, this.document.authorizationId, this.document.data, this.document.name)
      .subscribe(
        async (response) => {
        const { status, error, flow_results } = response;
              if (status === 'error' || status === 'completed') {
                this.handleFlowResponse(status, error, flow_results);
                const endTime = performance.now();
                console.log('Execution time:', endTime - startTime, 'milliseconds');
                return;
              }
            }
      );
    }
    else{
      this.isLoading = false;
      this.isFormEmpty = true;
    }
  }

  private handleFlowResponse(status: string, error: string, flow_results: any) {
    if (status === 'error' || error != '') {
      this.handleError(error + (flow_results?.flowResult || 'Unknown error occurred.'));
    } else if (status === 'completed') {
      this.handleCompletedFlow(flow_results);
    }
  }

  private async handleCompletedFlow(flow_results: any) {
    const { holdingIdentityShortHash, clientRequestId, flowId, flowStatus, flowResult, flowError, timestamp } = flow_results;
    if (flowStatus === 'COMPLETED') {
      this.isLoading = false;
      this.toastr.success('Creation successful', 'Success');
      this.router.navigate(['/home']);
      return
    } else if (flowStatus !== 'RUNNING') {
      this.handleError('Error on the creation of the Flow');
    }
  }

  private handleError(errorMessage: string) {
    this.isLoading = false;
    this.router.navigate(['/error', { errorMessage }]);
  }


  handleFileInput(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const binaryString = reader.result as string;
        this.document.data = btoa(binaryString);
      };
      reader.readAsBinaryString(file);
    } else {
      this.toastr.error('No file selected', 'Error');
    }
  }
}

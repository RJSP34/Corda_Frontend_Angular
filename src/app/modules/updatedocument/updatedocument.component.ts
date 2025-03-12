import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/internal/operators/catchError';
import { map } from 'rxjs/internal/operators/map';
import { VirtualNode } from 'src/app/classes/virtual-node.interface';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { DocumentService } from 'src/app/services/document.service';

@Component({
  selector: 'app-updatedocument',
  templateUrl: './updatedocument.component.html',
  styleUrls: ['./updatedocument.component.css']
})
export class UpdatedocumentComponent {
  document = {
    id: '',
    name: '',
    data: '',
    authorizationId: '',
    selectedMember: ''
  };

  isFormEmpty: boolean = false;
  virtualNodes: VirtualNode[] = [];
  options: string[] = [];
  isLoading: boolean = true;
  constructor(private router: Router, private authService: AuthServiceService, private documentService: DocumentService, private route: ActivatedRoute, private toastr: ToastrService) { } // Inject AuthServiceService

  ngOnInit(): void {
    this.document.id = this.route.snapshot.params['id'];

    const shortHash = sessionStorage.getItem('shortHash') ?? '';
    const token = sessionStorage.getItem('token') ?? '';
    this.isLoading = true;
    this.documentService.getDocumentbyID(this.document.id ,shortHash, token).pipe(
      catchError(error => {
        console.error('Error fetching documents:', error);
        this.router.navigate(['/error', { errorMessage: 'Failed to fetch documents.' }]);
        return [];
      }),
      map(async response => {
        const { status, error, flow_results } = response;
        if (status === 'error') {
          this.router.navigate(['/error', { errorMessage: error + flow_results.flowResult || 'Unknown error occurred.' }]);
          this.isLoading = false;
          return;
        } else if (status === 'completed') {
          const document = JSON.parse(flow_results.flowResult);

          if (document) {
            this.document.id = document[0].id;
            this.document.name = document[0].documentName;
            this.document.authorizationId = document[0].authorizationID;
            this.document.data = document[0].documentPDF;
            this.document.selectedMember = document[0].issuer;
          }
          this.isLoading = false;

          return;
        }
      })
    ).subscribe();

  }

  submitForm() {
    const shortHash = sessionStorage.getItem('shortHash') ?? '';
    const token = sessionStorage.getItem('token') ?? '';
    this.isLoading = true;
    const startTime = performance.now();
    if (
      this.document.id &&
      this.document.data &&
      this.document.name
    ) {
    this.documentService.updateDocument(shortHash, token, this.document.id , this.document.data, this.document.name)
      .subscribe(
        async (response) => {
          const { status, error, flow_results } = response;
          if (status === 'error') {
            this.router.navigate(['/error', { errorMessage: error + flow_results.flow_result || 'Unknown error occurred.' }]);
            this.isLoading = false;
            return
          } else if (status === 'completed') {

            const holdingIdentityShortHash = flow_results.holdingIdentityShortHash;
            const clientRequestId = flow_results.clientRequestId;
            const flowId = flow_results.flowId;
            const flowStatus = flow_results.flowStatus;
            const flowResult = flow_results.flowResult;
            const flowError = flow_results.flowError;
            const timestamp = flow_results.timestamp;
            this.isFormEmpty = false;
            if (flowStatus === 'RUNNING') {
              return;
            } else if (flowStatus === 'COMPLETED') {
              try {
                this.toastr.success('Updated successful', 'Success');
                const endTime = performance.now();
                console.log('Execution time:', endTime - startTime, 'milliseconds');
                this.router.navigate(['/home']);
                this.isLoading = false;
                return
              } catch (error) {
                this.isLoading = false;
                this.router.navigate(['/error', { errorMessage: error || 'Unknown error occurred.' }]);
                return
              }
            } else {
              this.isLoading = false;
              this.router.navigate(['/error', { errorMessage: error || 'Error on the creation of the Flow' }]);
            }
          }
        },
        (error) => {
          this.isLoading = false;
          this.router.navigate(['/error', { errorMessage: error || 'Unknown error occurred.' }]);
        }
      );
    }
    else
    {
      this.isFormEmpty = true;
    }
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
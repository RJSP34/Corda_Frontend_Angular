import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { error } from 'console';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, map } from 'rxjs';
import { ROLES, UserRole } from 'src/app/classes/constants';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { DocumentService } from 'src/app/services/document.service';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})
export class DocumentListComponent {
  documents: any[] = [];
  columns: string[] = [];
  paginatedDocuments: any[] = []; // New array for paginated documents
  page = 1;
  pageSize = 4;
  isMedicalRole = false;
  isLoading: boolean = true;
  collectionSize = 0; // Initialize collection size to 0


  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private router: Router,
    private authService: AuthServiceService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.columns = data['documents'];
    });

    const shortHash = sessionStorage.getItem('shortHash') || '';
    const token = sessionStorage.getItem('token') || '';
    const userRole = this.authService.getUserRole();

    this.isMedicalRole = userRole === UserRole.MedicalAuthority;

    this.documentService.getDocuments(shortHash, token).pipe(
      catchError(async (error) => this.handleError('Error fetching documents', error))
    ).subscribe(async (response) => {
      this.processFlowResult(response);
    });
  }

  private handleError(errorMessage: string, error: any) {
    this.isLoading = false;
    console.error(errorMessage, error);
    this.router.navigate(['/error', { errorMessage }]);
    throw error;
  }

  private processFlowResult(flowResult: any) {
    const { status, error, flow_results } = flowResult;
    if (status === 'error') {
      this.handleError('Error in flow result', error + (flow_results || 'Unknown error occurred.'));
    } else if (status === 'completed') {
      this.isLoading = false;
      const documents = this.parseDocuments(flow_results?.flowResult);
      if (documents) {
        this.documents = documents;
        this.collectionSize = this.documents.length;
        this.refreshDocuments();
      }
    }
  }

  private parseDocuments(flowResult: any): any[] | null {
    try {
      const flowResultObject = JSON.parse(flowResult);
      return flowResultObject.map((item: any) => ({
        id: item.id,
        'document name': item.documentName,
        'authorization id': item.authorizationID,
        issuer: item.issuer,
        signed: item.isSigned,
        completed: item.isCompleted,
        'created at': new Date(item.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' }),
        'last updated': new Date(item.lastUpdated).toLocaleDateString('en-US', { dateStyle: 'medium' }),
        'record state': item.recordState,
        version: item.version,
        participants: item.participants.map((participant: string) => {
          const parts = participant.split(', ');
          const namesAndDepartments = parts.reduce((acc: any, part: string) => {
            const [key, value] = part.split('=');
            if (key.trim() === 'CN' || key.trim() === 'OU') {
              acc.push(value.trim());
            }
            return acc;
          }, []).join(': '); // Add a colon between participant's name and department
          return namesAndDepartments;
        }).join('\n')
      }));
    } catch (error) {
      this.handleError('Error parsing documents', error);
      return null;
    }
  }

  refreshDocuments() {
    const start = (this.page - 1) * this.pageSize;
    const end = Math.min(start + this.pageSize, this.collectionSize);
    this.paginatedDocuments = this.documents.slice(start, end); // Update paginatedDocuments instead of documents
  }

  signDocument(documentId: string) {
    this.handleDocumentAction(documentId, 'Sign', 'Sign successful');
  }

  deleteDocument(documentId: string) {
    this.handleDocumentAction(documentId, 'Delete', 'Delete successful');
  }

  viewDocument(documentId: string) {
    this.router.navigate(['/viewdocument/id=' + documentId]);
  }

  private handleDocumentAction(documentId: string, action: string, successMessage: string) {
    const shortHash = sessionStorage.getItem('shortHash') || '';
    const token = sessionStorage.getItem('token') || '';
    this.isLoading = true;

    let methodCall;
    switch (action) {
      case 'Sign':
        methodCall = this.documentService.signDocuments(documentId, shortHash, token);
        break;
      case 'Delete':
        methodCall = this.documentService.deleteDocuments(documentId, shortHash, token);
        break;
      default:
        this.handleError('Invalid action', new Error("Invalid action."));
        return;
    }

    methodCall.pipe(
      catchError(async (error) => this.handleError(`Error ${action.toLowerCase()} documents`, error))
    ).subscribe((result: any) => {
      this.isLoading = false;
      const { status, error, flow_results } = result;
      if (status === 'completed') {
        if (flow_results.flowStatus !== 'error') {
          this.isLoading = false;
          this.toastr.success(successMessage, 'Success');
          window.location.reload();
          return;
        }
        this.handleError('Error in flow result', error + (flow_results?.flow_result || 'Unknown error occurred.'));

      } else {
        this.toastr.error(flow_results, 'Faild');
      }
    });
  }
}
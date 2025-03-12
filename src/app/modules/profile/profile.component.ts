import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, map } from 'rxjs';
import { AuthServiceService } from '../../services/auth-service.service';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  isLoading: boolean = true; 
  profile: {
    id: string,
    username: string,
    publicKey: string,
    createdAt: Date,
    lastUpdated: Date,
    recordState: string,
    version: number
  };

  constructor(private route: ActivatedRoute,
    private documentService: DocumentService,
    private router: Router,
    private authService: AuthServiceService,
    private toastr: ToastrService) {
    this.profile = {
      id: '1',
      username: 'john_doe',
      publicKey: 'sample_public_key',
      createdAt: new Date('2024-01-01T12:00:00'),
      lastUpdated: new Date('2024-04-01T15:30:00'),
      recordState: 'active',
      version: 1
    };
    const shortHash = sessionStorage.getItem('shortHash') ?? '';
    const token = sessionStorage.getItem('token') ?? '';

    this.authService.getProfile(shortHash, token).pipe(
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
          const results = JSON.parse(flow_results.flowResult);
          const firstResult = results[0];

          this.profile = {
            id: firstResult.id,
            username: firstResult.username,
            publicKey: firstResult.publicKey,
            createdAt: new Date(firstResult.createdAt),
            lastUpdated: new Date(firstResult.lastUpdated),
            recordState: firstResult.recordState,
            version: firstResult.version
          };
          this.isLoading = false;

          return;
        }
      })
    ).subscribe();
  }

requestPrivateKey() {
    try {
      const shortHash = sessionStorage.getItem('shortHash') ?? '';
      const token = sessionStorage.getItem('token') ?? '';
      this.isLoading = true;

      this.authService.getPrivateKey(shortHash, token).pipe(
        catchError(async (error) => this.handleError('Error fetching documents', error))
      ).subscribe(async (response) => {
        this.processFlowResult(response);
        this.isLoading = false;
      });
    } catch (error) {
      this.handleError('Error in flow result', error + ( 'Unknown error occurred.'));
      this.isLoading = false;
    }
}

private processFlowResult(flowResult: any) {
  const { status, error, flow_results } = flowResult;
  if (status === 'error') {
    this.handleError('Error in flow result', error + (flow_results?.flow_result || 'Unknown error occurred.'));
  } else if (status === 'completed') {
    const flowResultObject = JSON.parse(flow_results.flowResult);
    const { ID, Private, Public } = flowResultObject;
    const keysMessage = 'Public Key:' + Public + '\n' + 'Private Key:' + Private;
    this.router.navigate(['request-complete'], { state: { message: keysMessage } });
    this.isLoading = false;
    return
  }
}

  private handleError(errorMessage: string, error: any) {
    this.isLoading = false;
    console.error(errorMessage, error);
    this.router.navigate(['/error', { errorMessage }]);
    throw error;
  }
}

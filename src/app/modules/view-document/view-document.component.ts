import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map } from 'rxjs';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { DocumentService } from 'src/app/services/document.service';

@Component({
  selector: 'app-view-document',
  templateUrl: './view-document.component.html',
  styleUrls: ['./view-document.component.css']
})
export class ViewDocumentComponent {
  documents: any[] = [
  ];

  documentpdfs: { [id: string]: string | HTMLElement } = {};

  documentslist: Document[] = [];
  columns: string[] = [];
  page = 1;
  pageSize = 4;
  collectionSize = this.documents.length;
  isMedicalRole = false;
  isLoading: boolean = true; 
  id!: string; 
  PrivateBoxValue: any;
  unsubscribe$: any;

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private router: Router,
    private authService: AuthServiceService
  ) { }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.columns = data['documents'];
    });
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id') ?? '';
    });

    const shortHash = sessionStorage.getItem('shortHash') ?? '';
    const token = sessionStorage.getItem('token') ?? '';

    if (this.id === '')
    {
      this.router.navigate(['/home']);
      return
    }

    if (this.id.includes('id=')) {
      this.id = this.id.replace('id=', '');
    }

    this.documentService.getDocumentbyID(this.id, shortHash, token).pipe(
      catchError(error => {
        this.handleError(error)
        return [];
      }),
      map(async response => {
        const { status, error, flow_results } = response;
            try {
              if (status === 'error') {
                this.router.navigate(['/error', { errorMessage: error + flow_results.flowResult || 'Unknown error occurred.' }]);
                this.isLoading = false;
                return;
              } else if (status === 'completed') {
                const documents = await this.parseDocuments(flow_results.flowResult);
                if (documents) {
                  this.documents = documents;
                } else {
                  this.documents = []
                  return;
                }
                this.isLoading = false;

                return;
              }
            } catch (error) {
              this.handleError(error)
              this.isLoading = false;
              this.router.navigate(['/error', { errorMessage: "Error: Flow not started." }]);
            }
      })
    ).subscribe();
  }

  private async parseDocuments(flowResult: any): Promise<any[] | null> {
    try {
      const flowResultObject = JSON.parse(flowResult);
      const parsedDocuments = await Promise.all(flowResultObject.map(async (item: any) => {
        let privateKey = sessionStorage.getItem('privateKey');
        var pdfdata = item.documentPDF;

        if (privateKey) {
          const decryptedPdf = await this.decryptPdf(pdfdata, privateKey)
          
          if (decryptedPdf === '' || !decryptedPdf) {
            pdfdata = 'invalid key';
            sessionStorage.removeItem('privateKey');
          } else {
            pdfdata = decryptedPdf;
          }
          this.documentpdfs[item.id] = item.documentPDF

        } else {
          pdfdata = '??';
          this.documentpdfs[item.id] = item.documentPDF
        }

        this.documentpdfs[item.id] = pdfdata;

        return {
          'id': item.id,
          'document name': item.documentName,
          'authorization id': item.authorizationID,
          'issuer': item.issuer,
          'data': pdfdata,
          'signed': item.isSigned,
          'completed': item.isCompleted,
          'created at': item.createdAt,
          'last updated': item.lastUpdated,
          'record state': item.recordState,
          'version': item.version
        };
      }));
      return parsedDocuments;
    } catch (error) {
      sessionStorage.removeItem('privateKey');
      this.handleError(error)
      return null;
    }
  }

  downloadPdf(documentId: string) {
    const pdfData = this.documentpdfs[documentId];
    if (typeof pdfData === 'string') {
      let fileType: string;
      if (pdfData.startsWith('%PDF') || pdfData.endsWith('.pdf')) {
        fileType = 'pdf';
      } else {
        fileType = 'txt'; 
      }
      const bytes = new Uint8Array(pdfData.length);
      for (let i = 0; i < pdfData.length; i++) {
        bytes[i] = pdfData.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/octet-stream' }); // Default to octet-stream
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      switch (fileType) {
        case 'pdf':
          a.download = `document_${documentId}.pdf`;
          break;
        case 'txt':
        default:
          a.download = `document_${documentId}.txt`;
          break;
      }
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      console.error(`PDF data not found for document ID: ${documentId}`);
    }
  }



  private async decryptPdf(encryptedPdf: string, privateKey: string): Promise<string> {
    try {
      const response = await this.documentService.deEncript(encryptedPdf, privateKey).toPromise();
      const { data } = response;
      const decodedText = atob(data);
      return decodedText;
    } catch (error) {
      sessionStorage.removeItem('privateKey');
      return '';
    }
  }

  refreshDocuments() {
    this.documentslist = this.documents.map((country, i) => ({ id: i + 1, ...country })).slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize,
    );
  }

  storePrivateKey() {
    const privateKey = this.PrivateBoxValue;
    sessionStorage.setItem('privateKey', this.PrivateBoxValue);

    if (privateKey) {
      window.location.reload();
    }
  }

private async decryptWithKeys(privateKey: string) {
  for (let index = 0; index < this.documents.length; index++) {
    const document = this.documents[index];
    const pdfData = this.documentpdfs[document.id];
    if (typeof pdfData === 'string') {
      try {
        const decryptedPdf = await this.decryptPdf(pdfData, privateKey);
        if (decryptedPdf) {
          document.pdf = decryptedPdf;
        } else {
          document.pdf = 'Decryption failed';
        }
      } catch (error) {
        document.pdf = 'Decryption error';
      }
    } else {
      console.error(`PDF data not found for document ID: ${document.id}`);
    }
  }
  sessionStorage.setItem('privateKey', privateKey);
}

private handleError(error: any): void {
    this.router.navigate(['/error', { errorMessage: 'Failed to fetch documents.' }]);
  }
}

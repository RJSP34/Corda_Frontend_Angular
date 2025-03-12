import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {Router } from '@angular/router';

@Component({
  selector: 'app-registration-message',
  templateUrl: './registration-message.component.html',
  styleUrls: ['./registration-message.component.css']
})
export class RegistrationMessageComponent {
  @Input() message: string | undefined;
  sanitizedMessage: SafeHtml | undefined;

  constructor(private router: Router, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.message = history.state.message;
    this.sanitizedMessage = this.sanitizeMessage(this.message);
  }

  sanitizeMessage(message: string | undefined): SafeHtml {
    if (message) {
      const formattedMessage = message.replace(/\n/g, '<br>');
      return this.sanitizer.bypassSecurityTrustHtml(formattedMessage);
    }
    return '';
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  downloadTxt() {
    const filename = 'message.txt';
    const text = this.message ?? ''; // Use the nullish coalescing operator to provide a default value of '' if this.message is undefined

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
}
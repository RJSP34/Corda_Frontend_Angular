import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  footerContent: string;

  constructor() {
    const currentYear = new Date().getFullYear();
    this.footerContent = `Corda Client CC ${currentYear}`;
  }
}

import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent {
  errorMessage: string = '';

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const errorMessageParam = this.route.snapshot.paramMap.get('errorMessage');
    this.errorMessage = errorMessageParam ? errorMessageParam : ''; 
  }
}

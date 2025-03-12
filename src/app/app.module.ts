import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './reducers';
import { DocumentListComponent } from './modules/document-list/document-list.component';
import { ErrorComponent } from './modules/error/error.component';
import { FooterComponent } from './modules/footer/footer.component';
import { HeaderComponent } from './modules/header/header.component';
import { LoginComponent } from './modules/login/login.component';
import { RegisterComponent } from './modules/register/register.component';
import { RegistrationMessageComponent } from './modules/registration-message/registration-message.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatMenuModule } from '@angular/material/menu';
import { CreateDocumentComponent } from './modules/create-document/create-document.component';
import { MatIconModule } from '@angular/material/icon';
import { ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ViewDocumentComponent } from './modules/view-document/view-document.component';
import { NotFoundComponent } from './modules/not-found/not-found.component';
import { NoAccessComponent } from './modules/no-access/no-access.component';
import { UpdatedocumentComponent } from './modules/updatedocument/updatedocument.component';
import { ProfileComponent } from './modules/profile/profile.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DocumentListComponent,
    ErrorComponent,
    RegistrationMessageComponent,
    HeaderComponent,
    FooterComponent,
    CreateDocumentComponent,
    ViewDocumentComponent,
    NotFoundComponent,
    NoAccessComponent,
    UpdatedocumentComponent,
    ProfileComponent
      ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, 
    AppRoutingModule,
    NgbModule,
    MatIconModule,
    FormsModule,
    MatMenuModule,
    HttpClientModule,
    StoreModule.forRoot(reducers, {
      metaReducers
    }),
    ToastrModule.forRoot(),
    CommonModule, 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './modules/login/login.component';
import { RegisterComponent } from './modules/register/register.component';
import { DocumentListComponent } from './modules/document-list/document-list.component';
import { ErrorComponent } from './modules/error/error.component';
import { AuthGuard } from './middleware/auth.guard';
import { RoleGuard } from './middleware/role.guard';
import { DocumentResolver } from './resolver/document.resolver';
import { CreateDocumentComponent } from './modules/create-document/create-document.component';
import { RegistrationMessageComponent } from './modules/registration-message/registration-message.component';
import { ViewDocumentComponent } from './modules/view-document/view-document.component';
import { MyDocumentResolver } from './resolver/my-document.resolver';
import { NotFoundComponent } from './modules/not-found/not-found.component';
import { NoAccessComponent } from './modules/no-access/no-access.component';
import { UpdatedocumentComponent } from './modules/updatedocument/updatedocument.component';
import { ProfileComponent } from './modules/profile/profile.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'home', component: DocumentListComponent, canActivate: [AuthGuard], resolve: {
      documents: DocumentResolver
    } 
  },
  { path: 'createdocument', component: CreateDocumentComponent, canActivate: [RoleGuard], data: { requiredRole: 'MedicalAuthority'} },
  {
    path: 'viewdocument/:id', component: ViewDocumentComponent, canActivate: [RoleGuard], data: { requiredRole: 'MedicalAuthority,Patient' }, resolve: {
      documents: MyDocumentResolver
    }
},
  {
    path: 'update/:id', component: UpdatedocumentComponent, canActivate: [RoleGuard], data: { requiredRole: 'MedicalAuthority' }
  },
  {
    path: 'profile', component: ProfileComponent, canActivate: [AuthGuard], resolve: {
      documents: DocumentResolver
    } 
  },
  { path: 'error', component: ErrorComponent }, 
  { path: 'registration-complete', component: RegistrationMessageComponent },
  { path: 'request-complete', component: RegistrationMessageComponent },
  { path: 'access-denied', component: NoAccessComponent}, 
  { path: '**', component: NotFoundComponent } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

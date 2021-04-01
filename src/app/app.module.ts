/**
 * Framework dependency
 */
import { NgModule, APP_INITIALIZER } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from "@angular/forms";
/**
 * Third party dependency
 */
import { ToastrModule } from "ng6-toastr-notifications";

/**
 * Application dependency
 */
import { AppRoutingModule } from "./app-routing.module";
import { Interceptor } from "./shared/interceptors/interceptor";
import { AppComponent } from "./app.component";
import { LoaderComponent } from "./shared/loader-effect/loader.component";

import { BreadcrumbComponent } from "./shared/breadcrumb/breadcrumb.component";
import { NewPasswordComponent } from './user/forget-password/new-password/new-password.component';
import { SuccessfulComponent } from './user/forget-password/successful/successful.component';
import { EmailVerifiedComponent } from './user/email-verify/email-verified/email-verified.component';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    LoaderComponent,
    BreadcrumbComponent,
    NewPasswordComponent,
    SuccessfulComponent,
    EmailVerifiedComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    DragDropModule,
    FormsModule,
    SharedModule,
    ToastrModule.forRoot()
  ],
  exports: [
    LoaderComponent,
    BreadcrumbComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: Interceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

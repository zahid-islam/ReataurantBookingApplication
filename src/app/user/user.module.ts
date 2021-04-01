/**
 * Frameworks dependency
 */
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";



/**
 * Application dependency Module
 *
 * UserRoutingModule
 * SharedModule
 */
import { UserRoutingModule } from "./user-routing.module";


/**
 * Application Component List
 *
 * UserComponent
 * SignUpComponent
 * UserProfileComponent
 * SignInComponent
 *
 */
import { UserComponent } from "./user.component";
import { SignInComponent } from "./sign-in/sign-in.component";
import { ForgetPasswordComponent } from './forget-password/forget-password/forget-password.component';
import { CheckInboxComponent } from './forget-password/check-inbox/check-inbox.component';
import { SharedModule } from '../shared/shared.module';




@NgModule({
  declarations: [
    UserComponent,
    SignInComponent,
    ForgetPasswordComponent,
    CheckInboxComponent,
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    FormsModule,
    SharedModule
  ],
  providers: [],
})
export class UserModule { }

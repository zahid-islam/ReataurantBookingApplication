/**
 * Frameworks dependency
 */
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";


/**
 * Application Component List
 *
 * UserComponent
 * SignUpComponent
 * UserProfileComponent
 * SignInComponent
 */
import { UserComponent } from "./user.component";
import { SignInComponent } from "./sign-in/sign-in.component";
import { ForgetPasswordComponent } from './forget-password/forget-password/forget-password.component';
import { CheckInboxComponent } from './forget-password/check-inbox/check-inbox.component';


/**
 * Application service List
 *
 */

const routes: Routes = [
  {
    path: "",
    component: UserComponent,
    children: [
      {
        path: "",
        redirectTo: "sign-in",
        pathMatch: "full"
      },
      {
        path: "sign-in",
        component: SignInComponent,
        data: {
          title: "Sign In"
        }
      },
      {
        path: "forget-password",
        component: ForgetPasswordComponent,
        data: {
          title: "Forget Password"
        }
      },
      {
        path: "check-inbox",
        component: CheckInboxComponent,
        data: {
          title: "Check Inbox"
        }
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }

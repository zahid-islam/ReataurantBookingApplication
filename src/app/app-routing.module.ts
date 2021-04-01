/**
 * Framework dependency
 */
import { NgModule } from "@angular/core";
import { Routes, RouterModule, PreloadAllModules } from "@angular/router";

/**
 * Application dependency
 */
import { AuthGuardService } from "./shared/services/auth-guard.service";

import { NewPasswordComponent } from './user/forget-password/new-password/new-password.component';
import { SuccessfulComponent } from './user/forget-password/successful/successful.component';
import { EmailVerifiedComponent } from './user/email-verify/email-verified/email-verified.component';

import { CustomPreloadingStrategy } from './custom-preloading-strategy';

const routes: Routes = [
  {
    path: "user",
    canActivate: [AuthGuardService],
    loadChildren: () => import("./user/user.module").then(m => m.UserModule),
    data: {
      breadcrumb: ""
    }
  },
  {
    path: "admin",
    loadChildren: () => import("./admin/admin.module").then(m => m.AdminModule),
    data: {
      breadcrumb: "",
      preload: true,
      delay: false
    }
  },
  {
    path: "resetpassword",
    component: NewPasswordComponent,
    data: {
      title: "New Password"
    }
  },
  {
    path: "successful",
    component: SuccessfulComponent,
    data: {
      title: "Successful"
    }
  },
  {
    path: "emailverify",
    component: EmailVerifiedComponent,
    data: {
      title: "Email Verify"
    }
  },
  {
    path: "",
    redirectTo: "/user/sign-in",
    pathMatch: "full"
  },

  {
    path: "**",
    redirectTo: "/user/sign-in",
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes,
      {
        preloadingStrategy: CustomPreloadingStrategy
      })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

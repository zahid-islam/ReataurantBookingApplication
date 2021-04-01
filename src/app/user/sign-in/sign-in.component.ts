import { AppConstants } from './../../shared/constants/app-constants';
import { UtilityService } from '../../shared/services/utility.service';
import { UserLogin, UserModel } from "../models/user.model";
import { AuthService } from "../services/auth.service";
/**
 * Frameworks dependency
 */
import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { ToastrManager } from "ng6-toastr-notifications";

@Component({
  selector: "app-sign-in",
  templateUrl: "./sign-in.component.html",
})
export class SignInComponent implements OnInit, OnDestroy {
  public appsConfig?: any;
  public signInForm: any;
  user = {} as UserLogin;

  isDisabled: boolean;
  isApiSubmit: boolean;

  serverErrorMessages: string;
  showSucessMessage: boolean;
  userType: string;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrManager,
    private utility: UtilityService
  ) {
    this.isApiSubmit = false;
    this.isDisabled = false;
  }

  ngOnInit() {
    this.userType = AppConstants.INTERNAL;
  }

  onSubmit(singInForm: NgForm) {
    if (singInForm.valid) {
      this.isDisabled = true;

      this.user.email = singInForm.value.email;
      this.user.password = singInForm.value.password;
      this.user.userType = this.userType;
      this.isApiSubmit = true;
      this.authService.login(this.user).subscribe(
        (res: any) => {
          if (res.status == 200) {
            let user: UserModel = this.utility.getUserPayload();
            this.isApiSubmit = false;
            this.navigateToRoleWisePage(user.userType.name);
            this.toastr.successToastr(res.body.message.en);
          }
          this.isDisabled = false;
          this.isApiSubmit = false;
        },
        err => {
          this.isDisabled = false;
          this.isApiSubmit = false;
          this.toastr.errorToastr(err.error.message.en);

        },
        () => {
          this.isApiSubmit = false;
        }
      );
    } else {
      this.toastr.errorToastr("Please enter valid data");
    }
  }

  navigateToRoleWisePage(userType: string) {
    if (userType == 'SUPER_ADMIN') {
      this.router.navigate(['admin/admin-dashboard']);
    }
    else if (userType == 'CUSTOMER_SUPPORT') {
      this.router.navigate(['admin/orders/ticket-list']);
    }
    else if (userType == 'CUSTOMER_SUPPORT_MANAGER') {
      this.router.navigate(['admin/orders/ticket-list']);
    }
    else if (userType == 'ACCOUNTS_MANAGER') {
      this.router.navigate(['admin/accounts/receivable']);
    }
    else if (userType == 'ACCOUNTS') {
      this.router.navigate(['admin/accounts/receivable']);
    }
    else {
      this.router.navigate(['admin/admin-dashboard']);
    }
  }

  ngOnDestroy() { }
}

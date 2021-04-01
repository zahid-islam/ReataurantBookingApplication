import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrManager } from "ng6-toastr-notifications";
import { AuthService } from '../../services/auth.service';
import { NgForm } from '@angular/forms';
import { NewPassword } from '../../models/user.model';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styles: []
})
export class NewPasswordComponent implements OnInit {

  public accessToken: any = {};
  public isNewPassword: boolean;
  public isConfirmPassword: boolean;
  newPasswordModel: NewPassword = new NewPassword();
  passwordNew: any = {};
  // newPasswordModel: any = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrManager,
    private authService: AuthService
  ) {
    // initialize variable value
    this.isNewPassword = false;
    this.isConfirmPassword = false;
    this.accessToken.token = this.route.snapshot.queryParams.token;
  }

  ngOnInit() {
    this.authService.deleteToken();
  }


  public submitNewPassword(newPassword: NgForm) {
    if (newPassword.valid) {
      this.passwordNew.newPassword = newPassword.value.newPassword;
      this.authService.verifyPasswordRecover(this.passwordNew, this.accessToken).subscribe(
        (res: any) => {
          if (res.status == 200) {
            this.router.navigate(['successful']);
          } else if (res.status == 401) {
            this.router.navigate(['user/sign-in']);
          }
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
          this.router.navigate(['user/sign-in']);
        }
      );
    } else {
      this.toastr.errorToastr("Please enter valid password");
    }
  }
  public isPasswordShow(name: string) {
    if (name == 'new_password') {
      this.isNewPassword = !this.isNewPassword;
    } else if (name == 'confirm_password') {
      this.isConfirmPassword = !this.isConfirmPassword;
    }
  }

  validateConfirmPass(passwordForm) {
    passwordForm.controls['confirmNewPassword'].updateValueAndValidity();
  }

}

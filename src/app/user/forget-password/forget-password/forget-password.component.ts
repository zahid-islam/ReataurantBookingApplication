import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastrManager } from "ng6-toastr-notifications";
import { ForgetPassword } from '../../models/user.model';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from "rxjs";

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styles: []
})
export class ForgetPasswordComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  public forgetPassword: ForgetPassword = new ForgetPassword();
  userType: string;

  constructor(
    private router: Router,
    private toastr: ToastrManager,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.userType = 'INTERNAL'
    this.authService.deleteToken();
  }
  public onSubmit(forgetValue: NgForm) {
    if (forgetValue.valid) {

      this.forgetPassword.email = forgetValue.value.email;
      this.forgetPassword.userType = this.userType;
      this.authService.requestForForgetPassword(this.forgetPassword).subscribe(
        (res: any) => {
          if (res.status == 200) {
            this.router.navigate(['user/check-inbox']);
          } else if (res.status == 401) {
            this.router.navigate(['user/sign-in']);
          }
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
          this.toastr.errorToastr(err.error.message);
          this.router.navigate(['user/sign-in']);
        }
      );
    } else {
      this.toastr.errorToastr("Please enter valid data");
    }
  }

  ngOnDestroy() {}

}

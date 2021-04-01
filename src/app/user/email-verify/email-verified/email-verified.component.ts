import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrManager } from "ng6-toastr-notifications";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-email-verified',
  templateUrl: './email-verified.component.html',
  styles: []
})
export class EmailVerifiedComponent implements OnInit {
  public accessToken: any = {};
  public isVerifiedEmail: boolean;
  public isUnverified: boolean;
  public isLoading: boolean;
  public message: string;
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastr: ToastrManager,
    private router: Router
  ) {
    this.accessToken.token = this.route.snapshot.queryParams.token;
    this.isVerifiedEmail = false;
    this.isUnverified = false;
    this.isLoading = false;
  }

  ngOnInit() {
    this.authService.deleteToken();
    if (this.accessToken.token) {
      this.verifyEmailViaOneTimeToken(this.accessToken);
    }

  }

  verifyEmailViaOneTimeToken(token: any) {
    this.isLoading = true;
    this.authService.verifyEmailViaOneTimeToken(token).subscribe(
      (res: any) => {
        this.isVerifiedEmail = true;
        if (res.status == 200) {
          this.isVerifiedEmail = true;
          this.message = res.body.message.en;
        }
        this.message = res.body.message.en;
      },
      (err: any) => {
        let url = 'emailverify';
        if (err.status == 401) {
          this.message = err.error.message.en;
          this.isUnverified = true;
          // this.router.navigate(['user/sign-in']);
          this.isLoading = false;
          this.router.navigateByUrl(url);
          return;
        }
        this.isUnverified = true;
        this.message = err.error.message.en;
        this.router.navigateByUrl(url);
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      }
    );
  }

}

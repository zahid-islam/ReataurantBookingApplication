import { LoaderService } from "./../services/loader.service";
import { AppConstants } from "./../constants/app-constants";
import { Injectable } from "@angular/core";
import { tap } from "rxjs/operators";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams
} from "@angular/common/http";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { AuthService } from '../../user/services/auth.service';

@Injectable()
export class Interceptor implements HttpInterceptor {
  cloneRequest: any;

  constructor(
    private router: Router,
    private loaderService: LoaderService,
    private authService: AuthService
  ) { }
  //function which will be called for all http calls
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Apps Loader will be called for all http calls
    this.showLoader();

    const token = localStorage.getItem(AppConstants.TOKEN);


    if (req.body) {
      for (let key of Object.keys(req.body)) {
        let value = req.body[key];
        if ((value == null || value == undefined || value == '') && value !== 0 && (typeof value !== "boolean")) {
          delete req.body[key];
        }
        else if (typeof value === 'object' && value.constructor === Object) {
          if (Object.entries(value).length === 0) {
            delete req.body[key];
          }
        }
        else if (typeof value === 'object' && value.constructor === Array) {
          if (value.length === 0) {
            delete req.body[key];
          }
          else {
            value.forEach(item => {
              for (let key of Object.keys(item)) {
                let value = item[key];
                if (typeof value === 'object' && value.constructor === Object) {
                  if (Object.entries(value).length === 0) {
                    delete item[key];
                  }
                }
                if ((value == null || value == undefined || value == '') && value !== 0 && (typeof value !== "boolean")) {
                  delete item[key];
                }
              }
            });
          }
        }
      }
    }

    if (token == null) {
      return next.handle(req.clone()).pipe(
        tap(
          event => {
            if (event instanceof HttpResponse) {
              this.onEnd();
            }
          },
          error => {
            this.onEnd();
            if (error.status == 401) {
              this.authService.deleteToken();
              this.router.navigate(["./user"]);
            }
          }
        )
      );
    } else {
      let cleanedParams = new HttpParams();
      req.params.keys().forEach(x => {
        let xValue = req.params.get(x);
        if (xValue != undefined && xValue != null && xValue != '') {
          cleanedParams = cleanedParams.append(x, req.params.get(x));
        }
      });

      if (req.responseType != 'text') {
        this.cloneRequest = req.clone({
          headers: req.headers.set("Authorization", token),
          params: cleanedParams
        });
      }
      else {
        this.cloneRequest = req.clone();
      }

      return next.handle(this.cloneRequest).pipe(
        tap(
          event => {
            if (event instanceof HttpResponse) {
              this.onEnd();
            }
          },
          error => {
            this.onEnd();
            if (error.status == 401) {
              this.authService.deleteToken();
              this.router.navigate(["user/sign-in"]);

            }
          }
        )
      );
    }
  }

  private onEnd(): void {
    this.hideLoader();
  }

  private showLoader(): void {
    this.loaderService.show();
  }

  private hideLoader(): void {
    this.loaderService.hide();
  }
}

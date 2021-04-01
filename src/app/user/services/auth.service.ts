import { UpdateAccessControl } from './../../shared/models/common.model';
import { HttpParams } from "@angular/common/http";
import { UserLogin, ForgetPassword } from "./../models/user.model";
import { AppConstants } from "./../../shared/constants/app-constants";
import { UtilityService } from "./../../shared/services/utility.service";
import { ApiService } from "./../../shared/services/api.service";

import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  constructor(
    private apiService: ApiService,
    private utilityService: UtilityService
  ) { }

  login(user: UserLogin) {
    return this.apiService
      .post(this.utilityService.getApiEndPointUrl("login"), user)
      .pipe(
        map((response: any) => {
          const token = response.body.data.token;
          if (token) {
            this.setUserData(token);
            this.utilityService.setResolveEndpont();
          }
          return response;
        })
      );
  }

  private setUserData(token: string): void {
    localStorage.setItem(AppConstants.TOKEN, token);
  }

  createInternalUser(user: any) {
    return this.apiService
      .post(this.utilityService.getApiEndPointUrl("users/internals"), user)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getInternalUsers(
    offset: string,
    limit: string,
    status?: string,
    type?: string,
    paginate?: string
  ) {
    let params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("status", status)
      .set("type", type)
      .set("paginate", paginate);
    return this.apiService
      .getWithParam(
        this.utilityService.getApiEndPointUrl("users/internals"),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getInternalsUserTypes() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl("userTypes/internals"))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getUsersStatus() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl("users/statuses"))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getUserById(userId: number) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`users/internals/${userId}`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getlUserStatuses() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl("users/statuses"))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  updateUserEntity(user: any, usirId: number) {
    return this.apiService
      .put(
        this.utilityService.getApiEndPointUrl(`users/internals/${usirId}`),
        user
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  updateAccessControl(accessControl: UpdateAccessControl[]) {
    return this.apiService
      .put(
        this.utilityService.getApiEndPointUrl(`acl`),
        accessControl
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  requestForForgetPassword(forgetpassword: ForgetPassword) {
    return this.apiService
      .post(this.utilityService.getApiEndPointUrl("recoverpassword/email"), forgetpassword)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  verifyPasswordRecover(newpassword, accesstoken) {
    return this.apiService
      .putWithHeaders(this.utilityService.getApiEndPointUrl("recoverpassword"), newpassword, accesstoken)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }


  requestForSendVerificationEmail() {
    return this.apiService.get(this.utilityService.getApiEndPointUrl('users/me/email/sendverification')).pipe(
      map((response: any) => {
        return response;
      }));
  }

  verifyEmailViaOneTimeToken(token: any) {
    return this.apiService.getWithHeaders(this.utilityService.getApiEndPointUrl('users/me/email/verify'), token).pipe(
      map((response: any) => {
        return response;
      }));
  }

  public deleteToken() {
    for (let i = 1; i <= localStorage.length; i++) {
      let keys = localStorage.key(i - 1);
      localStorage.removeItem(keys);
      i--;
    }
  }

  getAllRegisteredRoutes() {
    return this.apiService.get(this.utilityService.getApiEndPointUrl('acl/routes')).pipe(
      map((response: any) => {
        return response;
      }));
  }
  registerAllRoutes() {
    return this.apiService.get(this.utilityService.getApiEndPointUrl('acl/register')).pipe(
      map((response: any) => {
        return response;
      }));
  }

  searchInternalslUser(usersSearch: any, offset: string, limit: string) {
    const params = new HttpParams().set("offset", offset).set("limit", limit);
    return this.apiService
      .postWithParam(this.utilityService.getApiEndPointUrl('users/internals/search'), usersSearch, params)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

}

import { Injectable } from '@angular/core';
import { LazyServiceModule } from './lazy-service.module';
import { ApiService } from './../../shared/services/api.service';
import { UtilityService } from './../../shared/services/utility.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: LazyServiceModule
})
export class ManageService {

  constructor(private utilityService: UtilityService, private apiService: ApiService) { }

  getApiUrl(resourceUrl: string) {
    let urlPath = this.utilityService.getApiEndPointUrl(resourceUrl);
    return urlPath;
  }

  getUserById() {
    return this.apiService.get(this.getApiUrl('users/me')).pipe(
      map((response: any) => {
        return response;
      }));
  }

  updatePassword(passowrd: any) {
    return this.apiService.put(this.getApiUrl('users/me/password'), passowrd).pipe(
      map((response: any) => {
        return response;
      }));
  }

  updateProfile(profile: any) {
    return this.apiService.put(this.getApiUrl('users/me'), profile).pipe(
      map((response: any) => {
        return response;
      }));
  }

  requestForSendVerificationEmail() {
    return this.apiService.get(this.getApiUrl('users/me/email/sendverification')).pipe(
      map((response: any) => {
        return response;
      }));
  }

}

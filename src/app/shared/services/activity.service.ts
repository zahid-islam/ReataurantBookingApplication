import { Injectable } from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";

import { ApiService } from "./api.service";
import { UtilityService } from "./utility.service";

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  constructor(
    private utilityService: UtilityService,
    private apiService: ApiService
  ) { }

  getAllActivityByDatePaginatedly(offset: string, limit: string, fromDate?: number, toDate?: number) {
    let params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("fromDate", fromDate.toString())
      .set("toDate", toDate.toString());
    return this.apiService
      .getWithParam(this.utilityService.getApiEndPointUrl("activitylogs"), params)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getAllActivity(offset: string, limit: string) {
    let params = new HttpParams().set("offset", offset).set("limit", limit);
    return this.apiService
      .getWithParam(this.utilityService.getApiEndPointUrl("activitylogs"), params)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getActivityById(activityId: number) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`activitylogs/${activityId}`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getBusinessUserWithoutBusinessById(businessUserId: number) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`users/business/${businessUserId}`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getPrticularPromotionById(promotionId: number) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`promotions/${promotionId}`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getBankWithoutBusinessById(banksId: number) {
    return this.apiService.get(this.utilityService.getApiEndPointUrl(`banks/${banksId}`)).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  getParticularFoodTypeById(foodTypeId: number) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`food/category/${foodTypeId}`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getFoodMenuWithoutBusinessById(foodMenuId: number) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`foods/${foodMenuId}`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getAddonWithoutBusinessAndMenuById(addonId: number) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`addons/${addonId}`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getFloorPlanWithoutBusinessById(floorId: number) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`floorplans/${floorId}`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getInternalUserById(userId: number) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`users/internals/${userId}`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

}

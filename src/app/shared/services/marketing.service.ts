import { MarketingNotification } from './../models/marketing.model';
import { Injectable } from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";

import { ApiService } from "./api.service";
import { UtilityService } from "./utility.service";

@Injectable({
  providedIn: "root"
})
export class MarketingService {
  constructor(
    private utilityService: UtilityService,
    private apiService: ApiService
  ) { }

/**
 * ---------------------------------------------- Notification Management ----------------------
 */
  createMarketingPushNotification(marketing: MarketingNotification) {
    return this.apiService
      .post(this.utilityService.getApiEndPointUrl("marketing/pushnotifications"), marketing)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getAllMarketingPush(offset: string, limit: string, status?: string) {
    let params = new HttpParams().set("offset", offset).set("limit", limit).set("status", status);
    return this.apiService
      .getWithParam(this.utilityService.getApiEndPointUrl("marketing/pushnotifications"), params)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getMarketingPushNotificcationDetails(id: number) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`marketing/pushnotifications/${id}`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getMarketingNotificationStatus() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl("marketing/pushnotifications/statuses"))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getParticularNotificationRecipients(notificationsID: number, offset: string, limit: string) {
    let params = new HttpParams().set("offset", offset).set("limit", limit).set("status", status);
    return this.apiService
      .getWithParam(this.utilityService.getApiEndPointUrl(`marketing/pushnotifications/${notificationsID}/recipients`), params)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  cancelPendingNotification(notificationId: number) {
    return this.apiService
      .putWithoutBody(this.utilityService.getApiEndPointUrl(`marketing/pushnotifications/${notificationId}/cancel`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getUsersIdsAssociatedWithAPublicNotificationId(notificationId: number) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`marketing/pushnotifications/${notificationId}/userIds`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  updatePendingNotification(notificationId: number, notificationBody: any) {
    return this.apiService
      .put(this.utilityService.getApiEndPointUrl(`marketing/pushnotifications/${notificationId}`), notificationBody)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }


/**
 * ---------------------------------------------- Promotion management ----------------------
 */

getAllPromotionsPaginatedly(offset: string, limit: string, status?: string, sort?: string) {
  const params = new HttpParams()
    .set("offset", offset)
    .set("limit", limit)
    .set("status", status)
    .set("sort", sort);

  return this.apiService
    .getWithParam(
      this.utilityService.getApiEndPointUrl("promotions"),
      params
    )
    .pipe(
      map((response: any) => {
        return response;
      })
    );
}

getPromotionStatuses() {
  return this.apiService
    .get(this.utilityService.getApiEndPointUrl("promotions/statuses"))
    .pipe(
      map((response: any) => {
        return response;
      })
    );
}

createPublicPromotion(promotions: any) {
  return this.apiService
    .post(this.utilityService.getApiEndPointUrl("promotions/public"), promotions)
    .pipe(
      map((response: any) => {
        return response;
      })
    );
}

createPersonalPromotion(promotions: any) {
  return this.apiService
    .post(this.utilityService.getApiEndPointUrl("promotions/personal"), promotions)
    .pipe(
      map((response: any) => {
        return response;
      })
    );
}

getParticularPromotion(promotionID: number) {
  return this.apiService
    .get(this.utilityService.getApiEndPointUrl(`promotions/${promotionID}`))
    .pipe(
      map((response: any) => {
        return response;
      })
    );
}

updateParticularPromotion(promotionId: number, promotion: any) {
  return this.apiService
    .put(this.utilityService.getApiEndPointUrl(`promotions/${promotionId}`), promotion)
    .pipe(
      map((response: any) => {
        return response;
      })
    );
}

addNewUserToPersonalPromotion(promotionId: number, newUserIds: any) {
  return this.apiService
    .put(this.utilityService.getApiEndPointUrl(`promotions/${promotionId}/newuser`), newUserIds)
    .pipe(
      map((response: any) => {
        return response;
      })
    );
}


}

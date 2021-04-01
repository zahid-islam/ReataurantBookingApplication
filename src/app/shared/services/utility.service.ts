import { environment } from './../../../environments/environment';
import { UserModel } from './../../user/models/user.model';
import { AppConstants } from './../constants/app-constants';
import { Injectable } from "@angular/core";
import * as jwt_decode from "jwt-decode";

interface IPayload {
  id: number;
  businesId?: number;
  userType: string;
  email: string;
  userStatus: string;
}

@Injectable({
  providedIn: "root"
})
export class UtilityService {
  baseURL: string;

  resolvedEndPoint: any = {};

  constructor() {
    this.baseURL = environment.baseUrl;
    this.setResolveEndpont();
  }

  setResolveEndpont() {
    let user: UserModel = this.getUserPayload();
    if (user) {
      if (user.userType.name === 'SALES') {
        this.resolvedEndPoint = this.getSalesEndPoint();
      }
      else {
        this.resolvedEndPoint = this.getAdminEndPoint();
      }
    }
  }

  public getApiEndPointUrl(routePath: string): string {
    return `${this.baseURL}/${routePath}`;
  }

  getBusinessId() {
    let busId = localStorage.getItem(AppConstants.BUSINESS_ID);
    return busId ? Number(busId) : null;
  }

  getUserPayload() {
    let user: UserModel = new UserModel();
    let token = localStorage.getItem(AppConstants.TOKEN);
    let userData = token ? jwt_decode(token) : null;
    if (userData) {
      user = userData.user;
      return user;
    }
    else {
      return null;
    }
  }

  deleteEmptyPropertyFromObject(obj: any) {
    for (let key of Object.keys(obj)) {
      let value = obj[key];
      if (value === null || value === undefined || value === '') {
        delete obj[key];
      }
    }
    return obj;
  }

  pushItemIntoArrayListAtZeroIndex(arr: any[], index: number, newItem: any) {
    return [
      // part of the array before the specified index
      ...arr.slice(0, index),
      // inserted item
      newItem,
      // part of the array after the specified index
      ...arr.slice(index)
    ];
  }

  getStatusNameById(statusArray: any, selectedStatusId: number) {
    let status = null;
    if (selectedStatusId !== 0) {
      status = statusArray.find(item => {
        return item.id === selectedStatusId;
      }).name;
    }
    return status;
  }

  getAdminEndPoint() {
    let self = this;
    return {
      updateBusinessEntity: function (businessId: number) {
        return self.getApiEndPointUrl(`businesses/${businessId}`);
      },
      submitBusinessEntity: function () {
        return self.getApiEndPointUrl('businesses');
      },
      getBusinessesById: function (businessId: number) {
        return self.getApiEndPointUrl(`businesses/${businessId}`);
      },
      getBusinesses: function () {
        return self.getApiEndPointUrl('businesses');
      },
      searchBusiness: function () {
        return self.getApiEndPointUrl('businesses/search');
      },
      submitUserUnderBusiness: function (businessId: number) {
        return self.getApiEndPointUrl(`businesses/${businessId}/users`);
      },
      updateUserUnderBusiness: function (businessId: number, businessUserId: number) {
        return self.getApiEndPointUrl(`businesses/${businessId}/users/${businessUserId}`);
      },
      getBusinessesUserById: function (businessId: number, userId: number) {
        return self.getApiEndPointUrl(`businesses/${businessId}/users/${userId}`);
      },
      getBusinesseUsers: function (businessId: number) {
        return self.getApiEndPointUrl(`businesses/${businessId}/users`);
      },
      submitFloorPlan: function (businessId: number) {
        return self.getApiEndPointUrl(`businesses/${businessId}/floorplans`);
      },
      updateFloorPlan: function (businessId: number, floorId: number) {
        return self.getApiEndPointUrl(`businesses/${businessId}/floorplans/${floorId}`);
      },
      getFloorPlanById: function (businessId: number, floorId: number) {
        return self.getApiEndPointUrl(`businesses/${businessId}/floorplans/${floorId}`);
      },
      getAllFloorPlanUnderBusiness: function (businessId: number) {
        return self.getApiEndPointUrl(`businesses/${businessId}/floorplans`);
      },
      getOrderPaginatedlyUnderTable: function (businessId: number, floorPlanId: number, tableId: number) {
        return self.getApiEndPointUrl(`businesses/${businessId}/floorplans/${floorPlanId}/tables/${tableId}/orders`);
      },
      deleteTablesFromFloorPlan: function (businessId: number, floorPlanId: number) {
        return self.getApiEndPointUrl(`businesses/${businessId}/floorplans/${floorPlanId}/tables/delete`);
      },
      getMaxSvgIdUnderFloorPlan: function (businessId: number, floorPlanId: number) {
        return self.getApiEndPointUrl(`businesses/${businessId}/floorplans/${floorPlanId}/tables/maxsvgid`);
      },
      updateBusinessFloorPlanStatuses: function (businessId: number, floorPlanId: number) {
        return self.getApiEndPointUrl(`businesses/${businessId}/floorplans/${floorPlanId}/status`);
      },
      registerNewBankAgainstBusiness: function (businessId: number) {
        return self.getApiEndPointUrl(`businesses/${businessId}/banks`);
      },
      getAllRegisteredBanks: function (businessId: number) {
        return self.getApiEndPointUrl(`businesses/${businessId}/banks`);
      },
      getParticularBankById: function (businessId: number, bankId: number) {
        return self.getApiEndPointUrl(`businesses/${businessId}/banks/${bankId}`);
      },
      updateBankInfoUnderBusiness: function (businessId: number, bankId: number) {
        return self.getApiEndPointUrl(`businesses/${businessId}/banks/${bankId}`);
      },
      deleteBankUnderBusiness: function (businessId: number, bankId: number) {
        return self.getApiEndPointUrl(`businesses/${businessId}/banks/${bankId}`);
      }
    }
  }

  getSalesEndPoint() {
    let self = this;
    return {
      updateBusinessEntity: function (businessId: number) {
        return self.getApiEndPointUrl(`businesses/sales/${businessId}`);
      },
      submitBusinessEntity: function () {
        return self.getApiEndPointUrl('businesses/sales');
      },
      getBusinessesById: function (businessId: number) {
        return self.getApiEndPointUrl(`businesses/sales/${businessId}`);
      },
      getBusinesses: function () {
        return self.getApiEndPointUrl('businesses/sales');
      },
      searchBusiness: function () {
        return self.getApiEndPointUrl('businesses/sales/search');
      },
      submitUserUnderBusiness: function (businessId: number) {
        return self.getApiEndPointUrl(`businesses/sales/${businessId}/users`);
      },
      updateUserUnderBusiness: function (businessId: number, businessUserId: number) {
        return self.getApiEndPointUrl(`businesses/sales/${businessId}/users/${businessUserId}`);
      },
      getBusinessesUserById: function (businessId: number, userId: number) {
        return self.getApiEndPointUrl(`businesses/sales/${businessId}/users/${userId}`);
      },
      getBusinesseUsers: function (businessId: number) {
        return self.getApiEndPointUrl(`businesses/sales/${businessId}/users`);
      },
      submitFloorPlan: function (businessId: number) {
        return self.getApiEndPointUrl(`businesses/sales/${businessId}/floorplans`);
      },
      updateFloorPlan: function (businessId: number, floorId: number) {
        return self.getApiEndPointUrl(`businesses/sales/${businessId}/floorplans/${floorId}`);
      },
      getFloorPlanById: function (businessId: number, floorId: number) {
        return self.getApiEndPointUrl(`businesses/sales/${businessId}/floorplans/${floorId}`);
      },
      getAllFloorPlanUnderBusiness: function (businessId: number) {
        return self.getApiEndPointUrl(`businesses/sales/${businessId}/floorplans`);
      },
      getOrderPaginatedlyUnderTable: function (businessId: number, floorPlanId: number, tableId: number) {
        return self.getApiEndPointUrl(`businesses/sales/${businessId}/floorplans/${floorPlanId}/tables/${tableId}/orders`);
      },
      deleteTablesFromFloorPlan: function (businessId: number, floorPlanId: number) {
        return self.getApiEndPointUrl(`businesses/sales/${businessId}/floorplans/${floorPlanId}/tables/delete`);
      },
      getMaxSvgIdUnderFloorPlan: function (businessId: number, floorPlanId: number) {
        return self.getApiEndPointUrl(`businesses/sales/${businessId}/floorplans/${floorPlanId}/tables/maxsvgid`);
      },
      updateBusinessFloorPlanStatuses: function (businessId: number, floorPlanId: number) {
        return self.getApiEndPointUrl(`businesses/sales/${businessId}/floorplans/${floorPlanId}/status`);
      },
      registerNewBankAgainstBusiness: function (businessId: number) {
        return self.getApiEndPointUrl(`businesses/sales/${businessId}/banks`);
      },
      getAllRegisteredBanks: function (businessId: number) {
        return self.getApiEndPointUrl(`businesses/sales/${businessId}/banks`);
      },
      getParticularBankById: function (businessId: number, bankId: number) {
        return self.getApiEndPointUrl(`businesses/sales/${businessId}/banks/${bankId}`);
      },
      updateBankInfoUnderBusiness: function (businessId: number, bankId: number) {
        return self.getApiEndPointUrl(`businesses/sales/${businessId}/banks/${bankId}`);
      },
      deleteBankUnderBusiness: function (businessId: number, bankId: number) {
        return self.getApiEndPointUrl(`businesses/sales/${businessId}/banks/${bankId}`);
      }
    }
  }

}

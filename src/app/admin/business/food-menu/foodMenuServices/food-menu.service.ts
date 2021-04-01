import { ApiService } from "./../../../../shared/services/api.service";
import { UtilityService } from "./../../../../shared/services/utility.service";
import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class FoodMenuService {
  businessId: number;
  constructor(
    private utilityService: UtilityService,
    private apiService: ApiService
  ) { }

  getApiUrl(resourceUrl: string) {
    let urlPath = this.utilityService.getApiEndPointUrl(resourceUrl);
    return urlPath;
  }

  getFoodMenuUnderBusiness(
    offset: string,
    limit: string,
    businessId: number,
    status?: string
  ) {
    let params;
    if (status) {
      params = new HttpParams()
        .set("offset", offset)
        .set("limit", limit)
        .set("status", status);
    } else {
      params = new HttpParams().set("offset", offset).set("limit", limit);
    }
    return this.apiService
      .getWithParam(this.getApiUrl(`businesses/${businessId}/foods`), params)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getAllFoodMenuStatus() {
    return this.apiService.get(this.getApiUrl("foods/statuses")).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  getAllVatStatus() {
    return this.apiService.get(this.getApiUrl("vatStatuses")).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  getMenuCategories() {
    return this.apiService.get(this.getApiUrl("foods/types")).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  submitFoodMenu(menuItem: any, businessId: number) {
    return this.apiService
      .post(this.getApiUrl(`businesses/${businessId}/foods`), menuItem)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  createFoodType(category: any) {
    return this.apiService
      .post(this.getApiUrl('foods/types'), category)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  uploadImage(formData: any) {
    return this.apiService.post(this.getApiUrl("upload"), formData).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  updateFoodMenu(foodMeny: any, businessId: number, menuId: number) {
    return this.apiService
      .put(this.getApiUrl(`businesses/${businessId}/foods/${menuId}`), foodMeny)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getFoodMenuById(businesId: number, menuId: number) {
    return this.apiService
      .get(
        this.utilityService.getApiEndPointUrl(
          `businesses/${businesId}/foods/${menuId}`
        )
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getAddOnsByMenuId(businessId: number, menuId: number) {
    return this.apiService
      .get(this.getApiUrl(`businesses/${businessId}/foods/${menuId}/addons`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getAddonTypeUnderMenu() {
    return this.apiService.get(this.getApiUrl("foods/addons/types")).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  submitAddons(addOnsItem: any, businessId: number, menuId: number) {
    return this.apiService
      .post(
        this.getApiUrl(`businesses/${businessId}/foods/${menuId}/addons`),
        addOnsItem
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  updateAddons(
    addOnsItem: any,
    businessId: number,
    menuId: number,
    addOnsId: number
  ) {
    return this.apiService
      .put(
        this.getApiUrl(
          `businesses/${businessId}/foods/${menuId}/addons/${addOnsId}`
        ),
        addOnsItem
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getAllAddonStatus() {
    return this.apiService.get(this.getApiUrl("foods/addons/statuses")).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  getAddonsById(businessId: number, menuId: number, addonId: number) {
    return this.apiService
      .get(
        this.getApiUrl(
          `businesses/${businessId}/foods/${menuId}/addons/${addonId}`
        )
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  searchFoodMenuUnderBusinss(searchData: any, businessId: number, offset: string, limit: string) {
    let params = new HttpParams().set("offset", offset).set("limit", limit);
    return this.apiService
      .postWithParam(this.utilityService.getApiEndPointUrl(`businesses/${businessId}/foods/search`), searchData, params)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

}

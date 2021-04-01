import { Injectable } from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";

import { LazyServiceModule } from "./lazy-service.module";
import { ApiService } from "./../../shared/services/api.service";
import { UtilityService } from "./../../shared/services/utility.service";

@Injectable({ providedIn: LazyServiceModule })
export class CustomerService {
  constructor(
    private utilityService: UtilityService,
    private apiService: ApiService
  ) {}

  getCustomer(
    offset: string,
    limit: string,
    status?: string,
    phoneVerified?: string,
    emailVerified?: string
  ) {
    const params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("status", status)
      .set("phoneVerified", phoneVerified)
      .set("emailVerified", emailVerified);
    return this.apiService
      .getWithParam(
        this.utilityService.getApiEndPointUrl("users/customers"),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getCustomerById(customerId: number) {
    return this.apiService
      .get(
        this.utilityService.getApiEndPointUrl(`users/customers/${customerId}`)
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  updateCustomerEntity(customerId: number, business: any) {
    return this.apiService
      .put(
        this.utilityService.getApiEndPointUrl(`users/customers/${customerId}`),
        business
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  searchCustomer(customeSearch: any, offset: string, limit: string) {
    return this.apiService
      .post(
        this.utilityService.getApiEndPointUrl(
          `users/customers/search?offset=${offset}&limit=${limit}`
        ),
        customeSearch
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }
}

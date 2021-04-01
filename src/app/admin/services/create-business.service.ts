import { Injectable } from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";

import { LazyServiceModule } from "./lazy-service.module";
import { ApiService } from "./../../shared/services/api.service";
import { UtilityService } from "./../../shared/services/utility.service";
import {
  BusinessBankInfos,
  RequestForReceive,
  BankTransactionId,
  RefundRequest
} from "../models/business.model";

@Injectable({
  providedIn: LazyServiceModule
})
export class CreateBusinessService {
  apiUrl = this.utilityService.getApiEndPointUrl("businesses/types");

  constructor(
    private utilityService: UtilityService,
    private apiService: ApiService
  ) { }

  getBusinessType() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl("businesses/types"))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getBusinesses(offset: string, limit: string, status?: string) {
    // Dynamic endpoint
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
      .getWithParam(
        this.utilityService.resolvedEndPoint.getBusinesses(),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getBusinessesStatus() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl("businesses/statuses"))
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
    type?: string
  ) {
    let params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("status", status)
      .set("type", type);
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

  getBusinessesTags() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl("tags/active"))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getAllFacilitiesTags() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl("facilities/active"))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  submitBusinessEntity(business: any) {
    // Dynamic endpoint
    return this.apiService
      .post(
        this.utilityService.resolvedEndPoint.submitBusinessEntity(),
        business
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  searchBusiness(
    businessData: any,
    offset: string,
    limit: string,
    status?: string
  ) {
    // Dynamic endpoint
    const params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("status", status);
    return this.apiService
      .postWithParam(
        this.utilityService.resolvedEndPoint.searchBusiness(),
        businessData,
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  updateBusinessEntity(business: any, businessId: number) {
    // Dynamic endpoint
    return this.apiService
      .put(
        this.utilityService.resolvedEndPoint.updateBusinessEntity(businessId),
        business
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  submitUserUnderBusiness(user: any, businessId: number) {
    // Dynamic endpoint
    return this.apiService
      .post(
        this.utilityService.resolvedEndPoint.submitUserUnderBusiness(
          businessId
        ),
        user
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  // Dynamic endpoint
  updateUserUnderBusiness(
    business: any,
    businessId: number,
    businessUserId: number
  ) {
    return this.apiService
      .put(
        this.utilityService.resolvedEndPoint.updateUserUnderBusiness(
          businessId,
          businessUserId
        ),
        business
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getBusinessesUserById(businessId: number, userId: number) {
    // Dynamic endpoint
    return this.apiService
      .get(
        this.utilityService.resolvedEndPoint.getBusinessesUserById(
          businessId,
          userId
        )
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getBusinessesById(businessId: number) {
    // Dynamic endpoint
    return this.apiService
      .get(this.utilityService.resolvedEndPoint.getBusinessesById(businessId))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  // Dynamic endpoint
  getBusinesseUsers(
    businessId: number,
    offset: string,
    limit: string,
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
      .getWithParam(
        this.utilityService.resolvedEndPoint.getBusinesseUsers(businessId),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getBusinessesUserStatus() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl("users/statuses"))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  /**
   * Banks CRUD methods
   *
   */

  getAllRegisteredBanks(businessId: number) {
    // Dynamic endpoint
    return this.apiService
      .get(
        this.utilityService.resolvedEndPoint.getAllRegisteredBanks(businessId)
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  // Dynamic endpoint
  registerNewBankAgainstBusiness(
    bankInfo: BusinessBankInfos,
    businessId: number
  ) {
    return this.apiService
      .post(
        this.utilityService.resolvedEndPoint.registerNewBankAgainstBusiness(
          businessId
        ),
        bankInfo
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  // Dynamic endpoint
  updateBankInfoUnderBusiness(
    bankInfo: BusinessBankInfos,
    businessId: number,
    bankId: number
  ) {
    return this.apiService
      .put(
        this.utilityService.resolvedEndPoint.updateBankInfoUnderBusiness(
          businessId,
          bankId
        ),
        bankInfo
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  deleteBankUnderBusiness(businessId: number, bankId: number) {
    // Dynamic endpoint
    return this.apiService
      .delete(
        this.utilityService.resolvedEndPoint.deleteBankUnderBusiness(
          businessId,
          bankId
        )
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getParticularBankById(businessId: number, bankId: number) {
    // Dynamic endpoint
    return this.apiService
      .get(
        this.utilityService.resolvedEndPoint.getParticularBankById(
          businessId,
          bankId
        )
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  /*
   * Receivables
   */
  getAllAccountReceivables(
    offset: string,
    limit: string,
    status?: string,
    sort?: string
  ) {
    const params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("status", status)
      .set("sort", sort);

    return this.apiService
      .getWithParam(
        this.utilityService.getApiEndPointUrl("accounting/receivables"),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getParticularAccountReceivableById(receivableId: number) {
    return this.apiService
      .get(
        this.utilityService.getApiEndPointUrl(
          `accounting/receivables/${receivableId}`
        )
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  markReceivableAsReceived(formInfo: RequestForReceive) {
    return this.apiService
      .post(
        this.utilityService.getApiEndPointUrl(`accounting/received`),
        formInfo
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }
  /*
   * Received
   */
  getAllReceivedAccount(offset: string, limit: string, sort?: string) {
    let params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("sort", sort);
    return this.apiService
      .getWithParam(
        this.utilityService.getApiEndPointUrl("accounting/received"),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  /*
   *  -------------------------- Payables account ------------------------
   */

  getAllPayablesAccount(
    offset: string,
    limit: string,
    requested?: string,
    sort?: string
  ) {
    let params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("requested", requested)
      .set("sort", sort);
    return this.apiService
      .getWithParam(
        this.utilityService.getApiEndPointUrl("accounting/payables"),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getAllWithdrawRequests(
    offset: string,
    limit: string,
    approved?: string,
    sort?: string
  ) {
    let params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("approved", approved)
      .set("sort", sort);
    return this.apiService
      .getWithParam(
        this.utilityService.getApiEndPointUrl("accounting/withdrawrequests"),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  approveWithdrawMoneyRequest(
    bankTransactionId: BankTransactionId,
    withdrawId: number
  ) {
    return this.apiService
      .post(
        this.utilityService.getApiEndPointUrl(
          `accounting/withdrawrequests/${withdrawId}/approve`
        ),
        bankTransactionId
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }
  // --------------------------  Paid ----------------
  getAccountPaid(offset: string, limit: string, sort?: string) {
    let params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("sort", sort);
    return this.apiService
      .getWithParam(
        this.utilityService.getApiEndPointUrl("accounting/paid"),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  /** ------------------ Business payment -------------- */

  // Pending balance
  getAccountReceivableForBusiness(
    offset: string,
    limit: string,
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
      .getWithParam(
        this.utilityService.getApiEndPointUrl(
          "businesses/accounting/mine/receivables"
        ),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  /** ------------------ Business Assign To Particular Sales User -------------- */

  updateAssignedSalesPersonel(businessID: number, salesUserIds: any) {
    return this.apiService
      .put(
        this.utilityService.getApiEndPointUrl(`businesses/${businessID}/sales`),
        salesUserIds
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  // vilable balance
  getAccountSummaryForBusinessFacing() {
    return this.apiService
      .get(
        this.utilityService.getApiEndPointUrl(
          "businesses/accounting/mine/summary"
        )
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getAllPayablesForBusiness(offset: string, limit: string, requested?: string) {
    let params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("requested", requested);

    return this.apiService
      .getWithParam(
        this.utilityService.getApiEndPointUrl(
          "businesses/accounting/mine/payables"
        ),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  businessCreateWithdrawMoneyRequest(withdrawMoneyRequest: any) {
    return this.apiService
      .post(
        this.utilityService.getApiEndPointUrl(
          `businesses/accounting/mine/withdraws`
        ),
        withdrawMoneyRequest
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  // Inprogress Balance
  getAllWithdrawRequestsForBusiness(
    offset: string,
    limit: string,
    approved?: string
  ) {
    let params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("approved", approved);
    return this.apiService
      .getWithParam(
        this.utilityService.getApiEndPointUrl(
          "businesses/accounting/mine/withdrawrequests"
        ),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  // Received balance
  getAccountPaidForBbusiness(offset: string, limit: string) {
    let params = new HttpParams().set("offset", offset).set("limit", limit);
    return this.apiService
      .getWithParam(
        this.utilityService.getApiEndPointUrl(
          "businesses/accounting/mine/paid"
        ),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  /** ----------------------- Reting review ----------------------  */
  getRatingsOfABusiness(businessId: number, offset: string, limit: string) {
    const params = new HttpParams().set("offset", offset).set("limit", limit);
    return this.apiService
      .getWithParam(
        this.utilityService.getApiEndPointUrl(
          `businesses/${businessId}/ratings`
        ),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  /** ----------------------- Refund ----------------------  */
  markReceivableAsRefund(refundRequest: RefundRequest) {
    return this.apiService
      .post(
        this.utilityService.getApiEndPointUrl(`accounting/received/refund`),
        refundRequest
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  /** ------------------------- Restaurant Offer ------------------------ */
  getAllRestaurantOffers(
    offset: string,
    limit: string,
    status?: string,
    type?: string
  ) {
    const params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("status", status)
      .set("type", type);

    return this.apiService
      .getWithParam(
        this.utilityService.getApiEndPointUrl("v2/restaurantoffers"),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getAllRestaurantOfferTypes() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl("v2/restaurantoffers/types"))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }
  getAllRestaurantOfferStatus() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl("v2/restaurantoffers/statuses"))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  createRestaurantOffer(restaurantoffer: any) {
    return this.apiService
      .post(
        this.utilityService.getApiEndPointUrl(`v2/restaurantoffers`),
        restaurantoffer
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  updateRestaurantOffer(restaurantoffer: any, promotionId: number) {
    return this.apiService
      .put(
        this.utilityService.getApiEndPointUrl(`v2/restaurantoffers/${promotionId}`),
        restaurantoffer
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getParticularRestaurantOffer(promotionID: number) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`v2/restaurantoffers/${promotionID}`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }
}

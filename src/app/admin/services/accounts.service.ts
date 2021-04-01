import { Injectable } from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";

import { ApiService } from "../../shared/services/api.service";
import { UtilityService } from "../../shared/services/utility.service";
import {
  BusinessBankInfos,
  RequestForReceive,
  BankTransactionId,
  RefundRequest
} from "../models/business.model";
import { SortingObj } from "../../shared/models/common.model";

@Injectable({
  providedIn: "root"
})
export class AccountsService {
  constructor(
    private utilityService: UtilityService,
    private apiService: ApiService
  ) {}

  getAccountReceivableSummary() {
    return this.apiService
      .get(
        this.utilityService.getApiEndPointUrl(`accounting/receivables/summary`)
      )
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getAccountReceivedSummary() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`accounting/received/summary`))
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
  getAccountPayableSummary() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`accounting/payables/summary`))
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getAllAccountPaidPaginatedly(
    offset: string,
    limit: string,
    fromDate?: number,
    toDate?: number
  ) {
    let params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("fromDate", fromDate.toString())
      .set("toDate", toDate.toString());
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

  getAccountPaidSummary() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`accounting/paid/summary`))
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getWithdrawsummary() {
    return this.apiService
      .get(
        this.utilityService.getApiEndPointUrl(`accounting/withdraws/summary`)
      )
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  /**  ------------------- Accounting  --------------- * */

  /*
   *  ------------------------ Receivables ---------------------------*/

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

  getBreakdownsOfAccountReceivableIfRefund(receivableId: number) {
    return this.apiService
      .get(
        this.utilityService.getApiEndPointUrl(
          `accounting/receivables/${receivableId}/refundbreakdown`
        )
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  searchAllAccountReceivablePaginatedly(
    offset: string,
    limit: string,
    status?: any,
    sort?: any,
    searchObj?: any
  ) {
    const params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("status", status)
      .set("sort", sort);

    return this.apiService
      .postWithParam(
        this.utilityService.getApiEndPointUrl(`accounting/receivables/search`),
        searchObj,
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  /**
   *  Refund
   */
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
  /*
   * ------------------------------  Received --------------------------
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

  searchAllAccountReceivedPaginatedly(
    offset: string,
    limit: string,
    sort?: any,
    searchObj?: any
  ) {
    const params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("sort", sort);

    return this.apiService
      .postWithParam(
        this.utilityService.getApiEndPointUrl(`accounting/received/search`),
        searchObj,
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  // ---------- Payables ------------------------

  getAllPayablesAccount(
    offset: string,
    limit: string,
    requested?: string,
    sort?: string,
    businessId?: string
  ) {
    let params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("requested", requested)
      .set("sort", sort)
      .set("businessId", businessId);
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

  getAccountingStatesAgainstAnOrder(orderId: string) {
    return this.apiService
      .get(
        this.utilityService.getApiEndPointUrl(`accounting/orders/${orderId}`)
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  prefeexCreateWithdrawMoneyrequest(withdrawMoneyRequest: any) {
    return this.apiService
      .post(
        this.utilityService.getApiEndPointUrl(
          `businesses/accounting/prefeex/withdraws`
        ),
        withdrawMoneyRequest
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  searchAllAccountPayablePaginatedly(
    offset: string,
    limit: string,
    requested?: string,
    sort?: string,
    businessId?: string,
    searchObj?: any,
  ) {
    const params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("requested", requested)
      .set("sort", sort)
      .set("businessId", businessId);

    return this.apiService
      .postWithParam(
        this.utilityService.getApiEndPointUrl(`accounting/payables/search`),
        searchObj,
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  /* --------------------  withdraws ---------------*/

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
        this.utilityService.getApiEndPointUrl("accounting/withdraws"),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  approveBusinessWithdrawMoneyRequest(
    bankTransactionId: BankTransactionId,
    withdrawId: number
  ) {
    return this.apiService
      .post(
        this.utilityService.getApiEndPointUrl(
          `accounting/withdraws/${withdrawId}/approve`
        ),
        bankTransactionId
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getParticularWithdrawRequest(withdrawId: number) {
    return this.apiService
      .get(
        this.utilityService.getApiEndPointUrl(
          `accounting/withdraws/${withdrawId}`
        )
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getBusinessAccountSummary(businessesId: number) {
    return this.apiService
      .get(
        this.utilityService.getApiEndPointUrl(
          `accounting/businesses/${businessesId}/summary`
        )
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  markB2CPayableAsPaid(payToB2C: any) {
    return this.apiService
      .post(
        this.utilityService.getApiEndPointUrl(`accounting/paid/b2c`),
        payToB2C
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

  // Order promotion start
  getAllOrderPromotionPaginatedly(
    offset: string,
    limit: string,
    promotionFilterData: any
  ) {
    let params = new HttpParams().set("offset", offset).set("limit", limit);
    return this.apiService
      .postWithParam(
        this.utilityService.getApiEndPointUrl("orderpromotions"),
        promotionFilterData,
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getAllOrderPromotionStatuses() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl("orderpromotions/statuses"))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getParticularOrderPromotion(promotionId: number) {
    return this.apiService
      .get(
        this.utilityService.getApiEndPointUrl(
          `orderpromotions/orders/${promotionId}`
        )
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  markPaidOrderPromotionAsSettled(promotionData: any) {
    return this.apiService
      .put(
        this.utilityService.getApiEndPointUrl(`orderpromotions/settle`),
        promotionData
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }
  // Order promotion end
}

import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { ToastrManager } from "ng6-toastr-notifications";
import { NgForm } from "@angular/forms";
import { Subscription, forkJoin } from "rxjs";
import { Paginator } from "primeng/paginator";

import {
  Receivables,
  RequestForReceive,
  RefundRequest,
  Payables
} from "../../../models/business.model";
import { PayableViewDetails } from "../../../models/account.model";
import { AccountsService } from "../../../services/accounts.service";
import { SettingService } from "../../../services/setting.service";
import { SortingObj } from "./../../../../shared/models/common.model";
import { ParticularRefundPolicy } from "../../../models/setting.model";
import { AppConstants } from "../../../../shared/constants/app-constants";
import { UtilityService } from "src/app/shared/services/utility.service";

declare var jQuery: any;
declare var jsPDF: any;

interface IAccountReceivable {
  orderCount: number;
  totalReceivable: number;
}
interface IRefundPrimaryRequest {
  id: number;
  amoun: number;
  currentDate: number;
}

@Component({
  selector: "app-receivable",
  templateUrl: "./receivable.component.html",
  styles: []
})
export class ReceivableComponent implements OnInit {
  @ViewChild("receiveModal", { static: false }) receiveModal: ElementRef;
  @ViewChild("refundModal", { static: false }) refundModal: ElementRef;
  @ViewChild("refundConfirmModal", { static: false })
  refundConfirmModal: ElementRef;
  @ViewChild("refundNotExistModal", { static: false })
  refundNotExistModal: ElementRef;
  @ViewChild("paginator", { static: false }) dataTable: ElementRef<Paginator>;

  refundPoliyNotExistMessage: string;
  private subscription: Subscription;
  receivableAll: Receivables[];
  accountReceivable: Receivables;
  recieveRequest: RequestForReceive = new RequestForReceive();
  recieveRequestSubmit: RequestForReceive = new RequestForReceive();
  refundbreakdown: any = {};
  accountReceivableId: string;
  accountRefundId: number;
  refundRequest: RefundRequest = new RefundRequest();
  isRefundConfirm: boolean;
  isRefundApiSubmit: boolean;
  totalRefundbreakdownAmount: number = 0;
  currentRefundDateTime: any;
  viewDetails: PayableViewDetails = new PayableViewDetails();

  isLoading: boolean;
  isApiSubmit: boolean;

  defaultSelectedStatus: string;
  activeRefundPolicy: ParticularRefundPolicy = new ParticularRefundPolicy();
  // paginator variable
  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

  // below both property introduce for  column wise sorting
  receivableSorting: SortingObj = new SortingObj();
  sortingColumnArr: any = [];
  sortedString: string = "";

  eachRefundPolicy: any = {};
  accountReceivableSearch: any = {};
  accountReceivableData: IAccountReceivable = {} as IAccountReceivable;

  constructor(
    private toastr: ToastrManager,
    private accountsService: AccountsService,
    private settingService: SettingService,
    private utility: UtilityService
  ) {}

  ngOnInit() {
    // set default  Status and sort property
    this.defaultSelectedStatus = "receivable";
    this.sortedString = "createdAt:desc";
    this.receivableSorting.createdAt = false;

    this.isLoading = false;
    this.isApiSubmit = false;
    this.getAccountReceivableSummary();
    this.checkActiveRefundPolicyIsExist();
    // column array initialize
    this.sortingColumnArr = ["createdAt", "orderId", "amount"];
  }

  sortColumnWise(keyString: string) {
    // Create Sorted String
    this.sortedString = AppConstants.createSortedString(
      keyString,
      this.sortingColumnArr,
      this.receivableSorting
    );
    this.getAllAccountReceivables(
      this.offset.toString(),
      this.limit.toString(),
      this.defaultSelectedStatus,
      true,
      this.sortedString
    );
  }

  getAccountReceivableSummary() {
    this.accountsService.getAccountReceivableSummary().subscribe(
      (res: any) => {
        this.accountReceivableData = res.data;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  public getAllAccountReceivables(
    offset: string,
    limit: string,
    status?: string,
    loading?: boolean,
    sort?: string,
    search?: any
  ) {
    this.isLoading = loading === false ? loading : true;
    // Use forkJoin to ger AccountReceivables and ActiveRefundPolicy at same time from API,
    this.subscription = forkJoin([
      this.accountsService.searchAllAccountReceivablePaginatedly(
        offset,
        limit,
        status,
        sort,
        search
      ),
      this.settingService.getActiveRefundPolicy()
    ]).subscribe(
      (res: any) => {
        this.receivableAll = res[0].body.data.receivables;
        this.totalCount = res[0].body.data.count;
        this.activeRefundPolicy = res[1].body.data.refundPolicy;

        // Set pagination on exact offset number.
        const paginatorRef: any = this.dataTable;
        paginatorRef.first = this.offset;
        paginatorRef.rows = this.limit;

        // Does the ActiveRefundPolicy Ascending oreder
        this.activeRefundPolicy.policyBreakdowns.sort(
          (a, b) => parseFloat(a.appliedMillis) - parseFloat(b.appliedMillis)
        );
        // get current time in milliseconds
        const refundRequestTimestamp = new Date().getTime();
        // check receivables array is not empty
        if (this.receivableAll.length > 0) {
          // Check each item from receivables array
          this.receivableAll.forEach(item => {
            const policyBreakdownsForRemainingTimeMin = [];
            const policyBreakdownsForLastIndex = [];
            const policyBreakdownsForRefund = [];
            const policyBreakdownsForRefundLastIndex = [];
            // Minas from  Order SchedualedAt to Current time tamp
            const remainingTimeInMillis =
              parseInt(`${new Date(item.order.scheduledAt).getTime()}`, 10) -
              parseInt(`${refundRequestTimestamp}`, 10);

            // Show Refund button
            if (item.order.orderStatus.name === "CANCELED") {
              // Minas from  Order SchedualedAt to canceledAt time tamp
              const remainingCanceledTimeInMillis =
                parseInt(`${new Date(item.order.scheduledAt).getTime()}`, 10) -
                parseInt(`${new Date(item.order.canceledAt).getTime()}`, 10);

              if (this.activeRefundPolicy.policyBreakdowns.length > 0) {
                // get specific Breakdowns
                for (const policyBreakdown of this.activeRefundPolicy
                  .policyBreakdowns) {
                  if (
                    parseInt(`${policyBreakdown.appliedMillis}`, 10) >
                    parseInt(`${remainingCanceledTimeInMillis}`, 10)
                  ) {
                    // crate tamp array for this time remaing
                    policyBreakdownsForRefund.push(policyBreakdown);
                    break;
                  }
                }
                if (policyBreakdownsForRefund.length > 0) {
                  if (policyBreakdownsForRefund[0].isNoRefund) {
                    item["isRefundShow"] = false;
                    item["isReceiveShow"] = true;
                  } else if (
                    policyBreakdownsForRefund[0].isNoRefund &&
                    !policyBreakdownsForRefund[0].isAppliedBeforeMillis
                  ) {
                    item["isRefundShow"] = true;
                  } else if (
                    !policyBreakdownsForRefund[0].isNoRefund &&
                    policyBreakdownsForRefund[0].isAppliedBeforeMillis
                  ) {
                    item["isRefundShow"] = true;
                  } else if (
                    policyBreakdownsForRefund[0].isNoRefund &&
                    policyBreakdownsForRefund[0].isAppliedBeforeMillis
                  ) {
                    item["isRefundShow"] = true;
                  } else if (
                    !policyBreakdownsForRefund[0].isNoRefund &&
                    !policyBreakdownsForRefund[0].isAppliedBeforeMillis
                  ) {
                    item["isRefundShow"] = true;
                  }
                } else if (policyBreakdownsForRefund.length === 0) {
                  // If particular refund policy belong to last policy brackdowns
                  policyBreakdownsForRefundLastIndex.push(
                    this.activeRefundPolicy.policyBreakdowns[
                      this.activeRefundPolicy.policyBreakdowns.length - 1
                    ]
                  );
                  if (policyBreakdownsForRefundLastIndex[0].isNoRefund) {
                    item["isRefundShow"] = false;
                    item["isReceiveShow"] = true;
                  } else if (
                    policyBreakdownsForRefundLastIndex[0].isNoRefund &&
                    !policyBreakdownsForRefundLastIndex[0].isAppliedBeforeMillis
                  ) {
                    item["isRefundShow"] = true;
                  } else if (
                    !policyBreakdownsForRefundLastIndex[0].isNoRefund &&
                    policyBreakdownsForRefundLastIndex[0].isAppliedBeforeMillis
                  ) {
                    item["isRefundShow"] = true;
                  } else if (
                    policyBreakdownsForRefundLastIndex[0].isNoRefund &&
                    policyBreakdownsForRefundLastIndex[0].isAppliedBeforeMillis
                  ) {
                    item["isRefundShow"] = true;
                  } else if (
                    !policyBreakdownsForRefundLastIndex[0].isNoRefund &&
                    !policyBreakdownsForRefundLastIndex[0].isAppliedBeforeMillis
                  ) {
                    item["isRefundShow"] = true;
                  }
                }
              }
            } else if (item.order.orderStatus.name === "REFUND_INITIATED") {
              item["isRefundShow"] = true;
              item["isReceiveShow"] = false;
            } else if (
              item.order.orderStatus.name === "CANCELED_AND_NO_REFUND"
            ) {
              item["isRefundShow"] = false;
              item["isReceiveShow"] = true;
            } else {
              // Check Receiv button show state
              // scheduledAt getter the corrent time
              if (
                parseInt(`${new Date(item.order.scheduledAt).getTime()}`, 10) >
                parseInt(`${refundRequestTimestamp}`, 10)
              ) {
                if (this.activeRefundPolicy.policyBreakdowns.length > 0) {
                  // get specific Breakdowns
                  for (const policyBreakdown of this.activeRefundPolicy
                    .policyBreakdowns) {
                    if (
                      parseInt(`${policyBreakdown.appliedMillis}`, 10) >
                      parseInt(`${remainingTimeInMillis}`, 10)
                    ) {
                      // crate tamp array for this time remaing
                      policyBreakdownsForRemainingTimeMin.push(policyBreakdown);
                      break;
                    }
                  }
                  if (policyBreakdownsForRemainingTimeMin.length > 0) {
                    if (policyBreakdownsForRemainingTimeMin[0].isNoRefund) {
                      item["isReceiveShow"] = true;
                    } else if (
                      policyBreakdownsForRemainingTimeMin[0].isNoRefund &&
                      !policyBreakdownsForRemainingTimeMin[0]
                        .isAppliedBeforeMillis
                    ) {
                      item["isReceiveShow"] = false;
                    } else if (
                      !policyBreakdownsForRemainingTimeMin[0].isNoRefund &&
                      policyBreakdownsForRemainingTimeMin[0]
                        .isAppliedBeforeMillis
                    ) {
                      item["isReceiveShow"] = false;
                    } else if (
                      policyBreakdownsForRemainingTimeMin[0].isNoRefund &&
                      policyBreakdownsForRemainingTimeMin[0]
                        .isAppliedBeforeMillis
                    ) {
                      item["isReceiveShow"] = false;
                    } else if (
                      !policyBreakdownsForRemainingTimeMin[0].isNoRefund &&
                      !policyBreakdownsForRemainingTimeMin[0]
                        .isAppliedBeforeMillis
                    ) {
                      item["isReceiveShow"] = false;
                    }
                  } else if (policyBreakdownsForRemainingTimeMin.length === 0) {
                    // If particular refund policy belong to last policy brackdowns
                    policyBreakdownsForLastIndex.push(
                      this.activeRefundPolicy.policyBreakdowns[
                        this.activeRefundPolicy.policyBreakdowns.length - 1
                      ]
                    );
                    if (policyBreakdownsForLastIndex[0].isNoRefund) {
                      item["isReceiveShow"] = true;
                    } else if (
                      policyBreakdownsForLastIndex[0].isNoRefund &&
                      !policyBreakdownsForLastIndex[0].isAppliedBeforeMillis
                    ) {
                      item["isReceiveShow"] = false;
                    } else if (
                      !policyBreakdownsForLastIndex[0].isNoRefund &&
                      policyBreakdownsForLastIndex[0].isAppliedBeforeMillis
                    ) {
                      item["isReceiveShow"] = false;
                    } else if (
                      policyBreakdownsForLastIndex[0].isNoRefund &&
                      policyBreakdownsForLastIndex[0].isAppliedBeforeMillis
                    ) {
                      item["isReceiveShow"] = false;
                    } else if (
                      !policyBreakdownsForLastIndex[0].isNoRefund &&
                      !policyBreakdownsForLastIndex[0].isAppliedBeforeMillis
                    ) {
                      item["isReceiveShow"] = false;
                    }
                  }
                }
              } else {
                item["isReceiveShow"] = true;
              }
            }
          });
        }
      },
      err => {
        this.isLoading = false;
        this.isApiSubmit = false;
        this.toastr.errorToastr(err.error.message.en);
      },
      () => {
        this.isLoading = false;
        this.isApiSubmit = false;
      }
    );
  }

  public requestForReceiveAmount(receiveForm: NgForm) {
    this.recieveRequestSubmit.bankTransactionId = this.recieveRequest.bankTransactionId;
    this.recieveRequestSubmit.comment = this.recieveRequest.comment;
    this.recieveRequestSubmit.accountReceivableId = this.accountReceivableId;
    this.accountsService
      .markReceivableAsReceived(this.recieveRequestSubmit)
      .subscribe(
        (res: any) => {
          jQuery(this.receiveModal.nativeElement).modal("hide");
          this.toastr.successToastr(res.body.message.en);
          this.getAllAccountReceivables(
            this.offset.toString(),
            this.limit.toString(),
            this.defaultSelectedStatus,
            false,
            this.sortedString
          );
          this.getAccountReceivableSummary();
          receiveForm.reset();
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
  }

  receiveById(receivableId: any) {
    this.accountReceivableId = receivableId;
    jQuery(this.receiveModal.nativeElement).modal("show");
  }

  refundById(receivableId: any, eachReceivable: any, orderId: string) {
    this.accountRefundId = receivableId;
    forkJoin([
      this.accountsService.getBreakdownsOfAccountReceivableIfRefund(
        receivableId
      ),
      this.accountsService.getAccountingStatesAgainstAnOrder(orderId)
    ]).subscribe(
      (res: any) => {
        this.refundbreakdown = res[0].body.data;
        this.viewDetails = res[1].body.data;
        const details = { ...res[1].body.data };
        this.totalRefundbreakdownAmount =
          Number(this.refundbreakdown.prefeexSplitAmount) +
          Number(this.refundbreakdown.b2bSplitAmount) +
          Number(this.refundbreakdown.b2cSplitAmount);
        this.eachRefundPolicy = eachReceivable;
        const totalInv = Number(details.order.totalInvoicePrice);
        const receivAmt = Number(details.receivable.amount);
        const disAmt = Number(
          details.orderPromotion ? details.orderPromotion.discountAmount : 0
        );
        if (this.viewDetails.orderPromotion) {
          this.viewDetails.sslFee = totalInv - (receivAmt + disAmt);
          this.viewDetails.netAmount = receivAmt + disAmt;
        } else {
          this.viewDetails.sslFee = totalInv - receivAmt;
          this.viewDetails.netAmount = receivAmt;
        }
        jQuery(this.refundModal.nativeElement).modal("show");
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  refundMondyForm(refundForm: NgForm) {
    if (this.accountRefundId) {
      this.refundRequest.accountReceivableId = this.accountRefundId;
      jQuery(this.refundModal.nativeElement).modal("hide");
      jQuery(this.refundConfirmModal.nativeElement).modal("show");
      refundForm.reset();
    } else {
      this.toastr.errorToastr("Receivable Id not found");
    }
  }

  markReceivableAsRefund(confirm: boolean) {
    if (confirm == true) {
      this.isRefundApiSubmit = true;
      this.accountsService.markReceivableAsRefund(this.refundRequest).subscribe(
        (res: any) => {
          this.isRefundApiSubmit = false;
          jQuery(this.refundConfirmModal.nativeElement).modal("hide");
          this.toastr.successToastr(res.body.message.en);
          this.getAllAccountReceivables(
            this.offset.toString(),
            this.limit.toString(),
            this.defaultSelectedStatus,
            false,
            this.sortedString
          );

          this.getAccountReceivableSummary();
        },
        err => {
          this.isRefundApiSubmit = false;
          this.toastr.errorToastr(err.error.message.en);
        },
        () => {
          this.isRefundApiSubmit = false;
        }
      );
    } else if (confirm == false) {
      jQuery(this.refundConfirmModal.nativeElement).modal("hide");
    }
  }

  paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    if (Object.keys(this.accountReceivableSearch).length) {
      this.getAllAccountReceivables(
        this.offset.toString(),
        this.limit.toString(),
        this.defaultSelectedStatus,
        false,
        this.sortedString,
        this.accountReceivableSearch
      );
    } else {
      this.getAllAccountReceivables(
        this.offset.toString(),
        this.limit.toString(),
        this.defaultSelectedStatus,
        false,
        this.sortedString
      );
    }
  }

  private checkActiveRefundPolicyIsExist() {
    this.settingService.getActiveRefundPolicy().subscribe(
      (res: any) => {
        if (res.body.data.refundPolicy.policyBreakdowns.length > 0) {
          this.getAllAccountReceivables(
            this.offset.toString(),
            this.limit.toString(),
            this.defaultSelectedStatus,
            true,
            this.sortedString
          );
        }
      },
      err => {
        if (err.status == 404) {
          this.refundPoliyNotExistMessage = err.error.message.en;
          jQuery(this.refundNotExistModal.nativeElement).modal("show");
        }
      }
    );
  }

  checkValueIsNumberAndPositive(value: any) {
    return AppConstants.checkValueIsNumberAndPositive(value);
  }

  // Download pdf from this function
  convert() {
    this.isLoading = true;
    let allReceivable = [];
    let totalSum = 0;

    this.accountsService
      .getAllAccountReceivables(
        this.offset.toString(),
        this.totalCount.toString(),
        "receivable"
      )
      .subscribe(
        (res: any) => {
          allReceivable = res.body.data.receivables;
          if (Array.isArray(allReceivable) && allReceivable.length > 0) {
            let doc = new jsPDF("l", "pt"); // oreientation, unit, formate
            doc.setFontSize(18);
            doc.text("Receivable Report", 350, 50);
            doc.setFontSize(8);
            doc.setTextColor(100);
            const col = [
              "Date",
              "Reservation ID",
              "For B2B",
              "Transaction ID",
              "Receivable Amount"
            ];
            const rows = [];

            allReceivable.forEach(item => {
              totalSum = totalSum + Number(item.amount);
              let date = new Date(item.createdAt).toLocaleDateString();
              const temp = [
                date,
                item.order.refId,
                item.business ? item.business.name : "",
                item.pgTransactionId,
                item.amount
              ];
              rows.push(temp);
            });
            rows.push(["", "", "", "Total Amount:", totalSum]);

            doc.autoTable(col, rows, { margin: { top: 70 } });
            doc.save("Receivable.pdf");
          }
          this.isLoading = false;
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  // Search

  receivableSearchForm() {
    this.accountReceivableSearch = this.utility.deleteEmptyPropertyFromObject(
      this.accountReceivableSearch
    );
    if (Object.keys(this.accountReceivableSearch).length) {
      this.setPagingAtOne();
      this.isApiSubmit = true;
      this.getAllAccountReceivables(
        this.offset.toString(),
        this.limit.toString(),
        this.defaultSelectedStatus,
        false,
        this.sortedString,
        this.accountReceivableSearch
      );
    } else {
      this.toastr.errorToastr("Please enter data to search");
    }
  }

  invokeOnChnagingSearchData() {
    this.accountReceivableSearch = this.utility.deleteEmptyPropertyFromObject(
      this.accountReceivableSearch
    );
    if (!Object.keys(this.accountReceivableSearch).length) {
      this.clearSearchingForm();
    }
  }

  clearSearchingForm() {
    this.setPagingAtOne();
    this.accountReceivableSearch = {};
    this.getAllAccountReceivables(
      this.offset.toString(),
      this.limit.toString(),
      this.defaultSelectedStatus,
      false,
      this.sortedString
    );
  }

  private setPagingAtOne() {
    const paginatorRef: any = this.dataTable;
    this.offset = 0;
    this.limit = this.limit;
    paginatorRef.first = this.offset;
    paginatorRef.rows = this.limit;
  }
}

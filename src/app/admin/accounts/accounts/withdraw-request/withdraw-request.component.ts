import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { forkJoin } from "rxjs";
import { ToastrManager } from "ng6-toastr-notifications";

import { CreateBusinessService } from "../../../services/create-business.service";
import {
  WithdrawRequests,
  BusinessWithdrawMoneyRequest,
  Payables,
  BusinessBankInfos
} from "../../../models/business.model";
import {
  WithdrawSummary,
  WithdrawRequestViewDetails,
  PayableViewDetails,
  BusinessAccountSummary
} from "../../../models/account.model";
import { AccountsService } from "../../../services/accounts.service";
import { SortingWithdrawPaid } from "./../../../../shared/models/common.model";
import { AppConstants } from "../../../../shared/constants/app-constants";

declare var jQuery: any;
declare var jsPDF: any;

@Component({
  selector: "app-withdraw-request",
  templateUrl: "./withdraw-request.component.html",
  styles: []
})
export class WithdrawRequestComponent implements OnInit {
  @ViewChild("withdrawMoneyRequestModal", { static: false })
  withdrawMoneyRequestModal: ElementRef;
  @ViewChild("withdrawRequestViewDetailsModal", { static: false })
  withdrawRequestViewDetailsModal: ElementRef;
  @ViewChild("payableDetailsModal", { static: false })
  payableDetailsModal: ElementRef;

  viewDetails: WithdrawRequestViewDetails = new WithdrawRequestViewDetails();
  payableViewDetails: PayableViewDetails = new PayableViewDetails();
  businessAccountSummary: BusinessAccountSummary = new BusinessAccountSummary();
  payToBusinessitem: any;
  accountReceivable: WithdrawRequests;
  withdrawSummary: WithdrawSummary = new WithdrawSummary();

  allRegisteredBanks: BusinessBankInfos[] = [];

  allWithdraw: WithdrawRequests[];
  withdawRequestModel: BusinessWithdrawMoneyRequest = new BusinessWithdrawMoneyRequest();
  accountWithdrawId: number;
  isLoading: boolean;
  defaultRequested: string;
  withdrawRequestId: number;
  prefeexIndex: Payables = new Payables();
  b2bIndex: Payables = new Payables();
  customerIndex: Payables = new Payables();

  // Paginator variable
  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

  // Below both property introduce for column wise sorting
  withdrawnSortingModel: SortingWithdrawPaid = new SortingWithdrawPaid();
  sortingColumnArr: any = [];
  sortedString: string = "";
  preferredBankId: any = null;

  constructor(
    private businessService: CreateBusinessService,
    private accountsService: AccountsService,
    private toastr: ToastrManager
  ) {}

  ngOnInit() {
    // set default  Status and sort property
    this.sortedString = "createdAt:desc";
    this.withdrawnSortingModel.createdAt = false;
    this.defaultRequested = "false";

    this.sortingColumnArr = ["createdAt", "amount"];
    this.isLoading = false;
    this.getWithdrawRequests(
      this.offset.toString(),
      this.limit.toString(),
      this.defaultRequested,
      true,
      this.sortedString
    );
    this.getAllWithdrawSummary();
  }

  getAllWithdrawSummary() {
    this.accountsService.getWithdrawsummary().subscribe(
      (res: any) => {
        this.withdrawSummary = res.data;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  getWithdrawRequests(
    offset: string,
    limit: string,
    approved?: string,
    loading?: boolean,
    sort?: string
  ) {
    this.isLoading = loading == false ? loading : true;
    this.accountsService
      .getAllWithdrawRequests(offset, limit, approved, sort)
      .subscribe(
        (res: any) => {
          this.allWithdraw = res.body.data.withdrawRequests;
          this.totalCount = res.body.data.count;
        },
        (err: any) => {
          this.toastr.errorToastr(err.error.message.en);
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  sortColumnWise(keyString: string) {
    this.sortedString = AppConstants.createSortedString(
      keyString,
      this.sortingColumnArr,
      this.withdrawnSortingModel
    );
    this.getWithdrawRequests(
      this.offset.toString(),
      this.limit.toString(),
      this.defaultRequested,
      false,
      this.sortedString
    );
  }

  receiveById(receivableId: any) {
    this.accountWithdrawId = receivableId;
    jQuery(this.withdrawMoneyRequestModal.nativeElement).modal("show");
  }

  public requestForWithdrawAmount(receiveForm: NgForm) {
    this.accountsService
      .approveBusinessWithdrawMoneyRequest(
        this.withdawRequestModel,
        this.accountWithdrawId
      )
      .subscribe(
        (res: any) => {
          jQuery(this.withdrawMoneyRequestModal.nativeElement).modal("hide");
          jQuery(this.withdrawRequestViewDetailsModal.nativeElement).modal(
            "hide"
          );
          this.toastr.successToastr(res.body.message.en);
          this.getWithdrawRequests(
            this.offset.toString(),
            this.limit.toString(),
            this.defaultRequested
          );
          receiveForm.reset();
          this.getAllWithdrawSummary();
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
  }

  paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.getWithdrawRequests(
      this.offset.toString(),
      this.limit.toString(),
      this.defaultRequested,
      false,
      this.sortedString
    );
  }

  //Download pdf from this function
  convert() {
    this.isLoading = true;
    let allwithdrawnRequests = [];
    let totalSum = 0;

    this.accountsService
      .getAllWithdrawRequests(
        this.offset.toString(),
        this.totalCount.toString(),
        this.defaultRequested
      )
      .subscribe(
        (res: any) => {
          allwithdrawnRequests = res.body.data.withdrawRequests;
          if (
            Array.isArray(allwithdrawnRequests) &&
            allwithdrawnRequests.length > 0
          ) {
            let doc = new jsPDF("l", "pt"); //oreientation, unit, formate
            doc.setFontSize(18);
            doc.text("Withdrawn Requests Report", 350, 50);
            doc.setFontSize(8);
            doc.setTextColor(100);
            const col = ["Applied Date", "B2B", "Applied for Amounts"];
            const rows = [];

            allwithdrawnRequests.forEach(item => {
              totalSum = totalSum + Number(item.amount);
              let date = new Date(item.createdAt).toLocaleDateString();
              const temp = [
                date,
                item.business ? item.business.name : "",
                item.amount
              ];
              rows.push(temp);
            });
            rows.push(["", "Total Amount:", totalSum]);

            doc.autoTable(col, rows, { margin: { top: 70 } });
            doc.save("Withdrawn.pdf");
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

  public withdrawRequestViewDetails(withdrawId: number, businessesId: number) {
    this.accountWithdrawId = withdrawId;
    forkJoin([
      this.accountsService.getParticularWithdrawRequest(this.accountWithdrawId),
      this.accountsService.getBusinessAccountSummary(businessesId)
    ]).subscribe(
      (res: any) => {
        this.viewDetails = res[0].body.data.withdrawRequest;
        this.businessAccountSummary = res[1].body.data;
        jQuery(this.withdrawRequestViewDetailsModal.nativeElement).modal(
          "show"
        );
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }
  public payTo(withdraw: any, businessId: any) {
    this.accountWithdrawId = withdraw.id;
    this.getAllRegisteredBanksUnderBusiness(withdraw, businessId);
    jQuery(this.withdrawMoneyRequestModal.nativeElement).modal("show");
  }

  payToBusiness(payToBusiness, businessId: number) {
    this.payTo(payToBusiness, businessId);
  }

  viewParticularPaybleDetails(orderId: string) {
    this.accountsService.getAccountingStatesAgainstAnOrder(orderId).subscribe(
      (res: any) => {
        this.payableViewDetails = res.body.data;
        let details = res.body.data;
        let totalInv = Number(details.order.totalInvoicePrice);
        let receivAmt = Number(details.receivable.amount);
        let disAmt = Number(
          details.orderPromotion ? details.orderPromotion.discountAmount : 0
        );

        if (res.body.data.payables.length > 0) {
          this.customerIndex = {} as Payables;
          this.prefeexIndex = {} as Payables;
          this.b2bIndex = {} as Payables;
          res.body.data.payables.forEach(element => {
            if (element.business == null) {
              this.customerIndex = element;
            } else if (element.business.name == "Prefeex LTD.") {
              this.prefeexIndex = element;
            } else {
              this.b2bIndex = element;
            }
          });
        }
        if (this.payableViewDetails.orderPromotion) {
          this.payableViewDetails.sslFee = totalInv - (receivAmt + disAmt);
          this.payableViewDetails.netAmount = receivAmt + disAmt;
        } else {
          this.payableViewDetails.sslFee = totalInv - receivAmt;
          this.payableViewDetails.netAmount = receivAmt;
        }
        jQuery(this.payableDetailsModal.nativeElement).modal("show");
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

  checkValueIsNumberAndPositive(value: any) {
    return AppConstants.checkValueIsNumberAndPositive(value);
  }

  getAllRegisteredBanksUnderBusiness(withdraw: any, businessId: any) {
    this.withdawRequestModel = new BusinessWithdrawMoneyRequest();
    let withdrawRequest = {};
    withdrawRequest = { ...withdraw };
    this.businessService.getAllRegisteredBanks(businessId).subscribe(
      (res: any) => {
        this.allRegisteredBanks = res.body.data.businessBankInfos;
        if (withdrawRequest["preferredBankId"]) {
          this.preferredBankId = withdrawRequest["preferredBankId"];
          this.withdawRequestModel.bankId = withdrawRequest["preferredBankId"];
        } else {
          if (this.allRegisteredBanks.length) {
            this.preferredBankId = this.allRegisteredBanks[0].id;
            this.withdawRequestModel.bankId = this.allRegisteredBanks[0].id;
          }
        }
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  setPreferedBankId(bankId: number) {
    this.preferredBankId = bankId;
    this.withdawRequestModel.bankId = bankId;
  }
}

import { NgForm } from "@angular/forms";
import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { ToastrManager } from "ng6-toastr-notifications";

import { BusinessBankInfos } from "./../../../models/business.model";
import { SortingObj } from "./../../../../shared/models/common.model";
import { AppConstants } from "../../../../shared/constants/app-constants";
import { Payables, PayToCustomer } from "../../../models/business.model";
import { IAccountPayable } from "../../../models/account.model";
import { PayableViewDetails } from "../../../models/account.model";
import { CreateBusinessService } from "../../../services/create-business.service";
import { AccountsService } from "../../../services/accounts.service";
import { CommonType } from "../../../../shared/models/common.model";
import { Paginator } from "primeng/paginator";
import { UtilityService } from "../../../../shared/services/utility.service";

declare var jQuery: any;
declare var jsPDF: any;

@Component({
  selector: "app-payble",
  templateUrl: "./payble.component.html",
  styles: []
})
export class PaybleComponent implements OnInit {
  @ViewChild("payableDetailsModal", { static: false })
  payableDetailsModal: ElementRef;
  @ViewChild("payToB2CModal", { static: false }) payToB2CModal: ElementRef;
  @ViewChild("paginator", { static: false }) dataTable: ElementRef<Paginator>;
  isPayToB2CApiSubmit: boolean;
  viewDetails: PayableViewDetails = new PayableViewDetails();
  paybleAll: Payables[];
  isLoading: boolean;
  isApiSubmit: boolean;
  prefeexName: string;
  defaultRequested: string;
  prefeexIndex: Payables = new Payables();
  b2bIndex: Payables = new Payables();
  customerIndex: Payables = new Payables();
  withdrawsRequestObj: any = {};
  accountPayables: any[] = [];
  payToCustomer: PayToCustomer = new PayToCustomer();

  // paginator variable
  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

  accountPayableData: IAccountPayable = {} as IAccountPayable;
  allRegisteredBanks: BusinessBankInfos[] = [];

  // below both property introduce for  column wise sorting
  payableSorting: SortingObj = new SortingObj();
  sortingColumnArr: any = [];
  sortedString: string = "";

  allBusinesses: CommonType[] = [];
  searchResultForBusiness: CommonType[] = [];
  selectedBusiness: CommonType = null;
  accountPaybleSearch: any = {};

  constructor(
    private businessService: CreateBusinessService,
    private toastr: ToastrManager,
    private accountsService: AccountsService,
    private utility: UtilityService
  ) { }

  ngOnInit() {
    // set default  Status and sort property
    this.sortedString = "createdAt:desc";
    this.payableSorting.createdAt = false;
    this.defaultRequested = "false";

    this.sortingColumnArr = ["createdAt", "orderId", "amount"];
    this.isLoading = false;
    this.isApiSubmit = false;
    this.prefeexName = AppConstants.PREFEEX;
    this.getAllPayablesAccount(
      this.offset.toString(),
      this.limit.toString(),
      this.defaultRequested,
      true,
      this.sortedString
    );
    this.getAccountPayableSummary();
    this.getBusiness();
  }

  setSinglePayableToPrefeexChecked(value: any, payableId: number) {
    if (value.target.checked) {
      this.accountPayables.push(payableId);
    } else {
      let index = this.accountPayables.indexOf(payableId);
      if (index !== -1) {
        this.accountPayables.splice(index, 1);
      }
    }
  }

  setPaginationOnFirstPage() {
    const paginatorRef: any = this.dataTable;
    this.offset = 0;
    this.limit = this.limit;
    paginatorRef.first = this.offset;
    paginatorRef.rows = this.limit;
  }

  resetPayable() {
    this.selectedBusiness = null;
    this.accountPaybleSearch = {};
    this.setPaginationOnFirstPage();
    this.getAllPayablesAccount(
      this.offset.toString(),
      this.limit.toString(),
      this.defaultRequested,
      true,
      this.sortedString
    );
  }

  setBusinessId(value: any) {
    this.accountPaybleSearch = {};
    this.setPaginationOnFirstPage();
    this.getAllPayablesAccount(
      this.offset.toString(),
      this.limit.toString(),
      this.defaultRequested,
      true,
      this.sortedString,
      this.selectedBusiness.id.toString()
    );
  }

  search(event: any) {
    this.searchResultForBusiness = [];
    this.allBusinesses.forEach(item => {
      let searchVal = event.query.toLowerCase();
      let val = item.name.toLowerCase().indexOf(searchVal);
      if (typeof item.name == "string" && val > -1) {
        if (this.searchResultForBusiness.length <= 10) {
          this.searchResultForBusiness.push(item);
        }
      }
    });
  }

  getBusiness() {
    let offset = 0;
    let limit = 10000;
    let status = "APPROVED";
    this.businessService
      .getBusinesses(offset.toString(), limit.toString(), status)
      .subscribe(
        (res: any) => {
          res.body.data.businesses.forEach(value => {
            let obj = {} as CommonType;
            obj.id = value.id;
            obj.name = value.name;
            this.allBusinesses.push(obj);
          });
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
  }

  private getAccountPayableSummary() {
    this.accountsService.getAccountPayableSummary().subscribe(
      (res: any) => {
        this.accountPayableData = res.data;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  private getAllPayablesAccount(
    offset: any,
    limit: string,
    requested?: string,
    loading?: boolean,
    sort?: string,
    businessId?: string,
    search?: any
  ) {
    this.isLoading = loading === false ? loading : true;
    this.accountsService
      .searchAllAccountPayablePaginatedly(
        offset,
        limit,
        requested,
        sort,
        businessId,
        search
      )
      .subscribe(
        (res: any) => {
          this.paybleAll = res.body.data.accountPayables;
          //If prefeex payable checked earlier then set checkbox true
          if (this.accountPayables.length > 0) {
            this.paybleAll.forEach(item => {
              let index = this.accountPayables.indexOf(item.id);
              if (index !== -1) {
                item.isPrefeexchecked = true;
              }
            });
          }
          this.totalCount = res.body.data.count;
          if (!this.paybleAll.length && offset > 0) {
            this.setPaginationOnFirstPage();
            this.getAllPayablesAccount(
              this.offset.toString(),
              this.limit.toString(),
              this.defaultRequested,
              false,
              this.sortedString,
              this.selectedBusiness &&
                typeof this.selectedBusiness === "object" &&
                this.selectedBusiness.constructor === Object
                ? this.selectedBusiness.id.toString()
                : null,
              Object.keys(this.accountPaybleSearch).length
                ? this.accountPaybleSearch
                : null
            );
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

  paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;

    this.getAllPayablesAccount(
      this.offset.toString(),
      this.limit.toString(),
      this.defaultRequested,
      false,
      this.sortedString,
      this.selectedBusiness &&
        typeof this.selectedBusiness === "object" &&
        this.selectedBusiness.constructor === Object
        ? this.selectedBusiness.id.toString()
        : null,
      Object.keys(this.accountPaybleSearch).length
        ? this.accountPaybleSearch
        : null
    );
  }

  // Download pdf from this function
  convert() {
    this.isLoading = true;
    let allPayable = [];

    let netOrderValue = 0;
    let netVatAmount = 0;
    let netService = 0;
    let netPrefeexAmount = 0;
    let netB2BAmount = 0;
    let netInvoice = 0;

    this.accountsService
      .searchAllAccountPayablePaginatedly(
        this.offset.toString(),
        this.totalCount.toString(),
        this.defaultRequested,
        this.sortedString,
        (this.selectedBusiness &&
          typeof this.selectedBusiness === "object" &&
          this.selectedBusiness.constructor === Object)
          ? this.selectedBusiness.id.toString()
          : null,
        Object.keys(this.accountPaybleSearch).length
          ? this.accountPaybleSearch
          : null
      )
      .subscribe(
        (res: any) => {
          console.log(res.body.data.accountPayables);
          if (res.body.data.accountPayables.length) {
            res.body.data.accountPayables.forEach(obj => {
              if (obj.business) {
                // 1 == Prefeex Ltd and 69 == Sayesta Kha.
                if (obj.business.id !== 1 && obj.business.id !== 69) {
                  allPayable.push(obj);
                }
              }
            });
          }
          if (Array.isArray(allPayable) && allPayable.length > 0) {
            let doc = new jsPDF("l", "pt"); //oreientation, unit, formate
            doc.setFontSize(18);
            doc.text(
              this.selectedBusiness
                ? this.selectedBusiness.name
                : "Payable List",
              350,
              50
            );
            doc.setFontSize(8);
            doc.setTextColor(100);
            const col = [
              "Date",
              "Time",
              "RefID",
              "Business Name",
              "Order Value",
              "Vat",
              "Service Charge",
              "Prefeex",
              "B2B Payable",
              "Invoice Price"
            ];
            const rows = [];

            allPayable.forEach(item => {
              let currentAmount = Number(item.amount) || 0;
              let totalInvoice = Number(item.order.totalInvoicePrice) || 0;
              let vatAmount = Number(item.order.vatAmount) || 0;
              let serviceAmount = Number(item.order.serviceChargeAmount) || 0;

              let orderValue = totalInvoice - (vatAmount + serviceAmount);

              let date = new Date(item.order.scheduledAt).toLocaleDateString();
              let time = new Date(
                item.order.scheduledAt
              ).toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true
              });

              netOrderValue = netOrderValue + orderValue;
              netVatAmount = netVatAmount + vatAmount;
              netService = netService + serviceAmount;
              netInvoice = netInvoice + totalInvoice;

              let prefeexAmount = 0;
              let isRefund = "false";
              if (item.order.orderRefund) {
                let b2bAmount = item.order.orderRefund.b2bSplitAmount || 0;
                let refund = item.order.orderRefund;
                if (refund.refundPolicyBreakdown.isNoRefund) {
                  prefeexAmount = totalInvoice - currentAmount;
                } else {
                  prefeexAmount = totalInvoice - b2bAmount;
                  isRefund = "true";
                }
              } else {
                prefeexAmount = totalInvoice - currentAmount;
              }

              netPrefeexAmount = netPrefeexAmount + prefeexAmount;
              netB2BAmount = netB2BAmount + currentAmount;

              const temp = [
                date,
                time,
                item.order.refId,
                item.business ? item.business.name : "",
                orderValue.toFixed(2),
                item.order.vatAmount,
                item.order.serviceChargeAmount,
                prefeexAmount.toFixed(2),
                item.amount,
                item.order.totalInvoicePrice,
                isRefund
              ];
              rows.push(temp);
            });
            rows.push([
              "",
              "",
              "",
              "Net Amount :",
              netOrderValue.toFixed(2),
              netVatAmount.toFixed(2),
              netService.toFixed(2),
              netPrefeexAmount.toFixed(2),
              netB2BAmount.toFixed(2),
              netInvoice.toFixed(2),
              "false"
            ]);

            doc.autoTable(col, rows, {
              margin: { top: 70 },
              styles: { overflow: "linebreak" },
              headStyles: {
                fillColor: "#b8423e",
                textColor: "white",
                halign: "center"
              },
              columnStyles: {
                0: { cellWidth: "auto", halign: "center", fillColor: "white" },
                1: { cellWidth: "auto", halign: "center", fillColor: "white" },
                2: { cellWidth: "auto", halign: "center", fillColor: "white" },
                3: { cellWidth: "auto", halign: "center", fillColor: "white" },
                4: { cellWidth: "auto", halign: "center", fillColor: "white" },
                5: { cellWidth: "auto", halign: "center", fillColor: "white" },
                6: { cellWidth: "auto", halign: "center", fillColor: "white" },
                7: { cellWidth: "auto", halign: "center", fillColor: "white" },
                8: { cellWidth: "auto", halign: "center", fillColor: "white" },
                9: { cellWidth: "auto", halign: "center", fillColor: "white" }
              },
              willDrawCell: function (data) {
                if (data.row.index === rows.length - 1) {
                  doc.setFontStyle("bold");
                }
                let obj = data.settings.body[data.row.index];
                if (obj[10] === "true" && data.section !== "head") {
                  doc.setFillColor("#bfbdbd");
                }
              }
            });
            doc.save("Payable.pdf");
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

  particularPayableDetails(orderId: string) {
    this.accountsService.getAccountingStatesAgainstAnOrder(orderId).subscribe(
      (res: any) => {
        this.viewDetails = res.body.data;
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
        if (this.viewDetails.orderPromotion) {
          this.viewDetails.sslFee = totalInv - (receivAmt + disAmt);
          this.viewDetails.netAmount = receivAmt + disAmt;
        } else {
          this.viewDetails.sslFee = totalInv - receivAmt;
          this.viewDetails.netAmount = receivAmt;
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

  payToCustomerByAccountPayableId(accountPayableId: number) {
    this.payToCustomer.accountPayableId = accountPayableId;
    jQuery(this.payToB2CModal.nativeElement).modal("show");
  }

  requestForCustomerAmount(payToCustomer: NgForm) {
    this.isPayToB2CApiSubmit = true;
    this.accountsService.markB2CPayableAsPaid(this.payToCustomer).subscribe(
      (res: any) => {
        this.isPayToB2CApiSubmit = false;
        jQuery(this.payToB2CModal.nativeElement).modal("hide");
        this.toastr.successToastr(res.body.message.en);
        this.getAllPayablesAccount(
          this.offset.toString(),
          this.limit.toString(),
          this.defaultRequested,
          false,
          this.sortedString
        );
      },
      err => {
        this.isPayToB2CApiSubmit = false;
        this.toastr.errorToastr(err.error.message.en);
      },
      () => {
        this.isPayToB2CApiSubmit = false;
      }
    );
  }

  getBankAndCreateWithdrawMoneyrequest(
  ) {
    let businessId = 1; // 1 for prefeex business.
    this.businessService.getAllRegisteredBanks(businessId).subscribe(
      (res: any) => {
        this.allRegisteredBanks = res.body.data.businessBankInfos;
        if (this.allRegisteredBanks.length) {
          this.prefeexCreateWithdrawMoneyRequest();
        } else {
          this.toastr.warningToastr("Prefeex have no bank added yet.");
        }
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  prefeexCreateWithdrawMoneyRequest() {
    this.withdrawsRequestObj.accountPayables = this.accountPayables;
    this.withdrawsRequestObj.preferredBankId = this.allRegisteredBanks[0].id;
    this.accountsService
      .prefeexCreateWithdrawMoneyrequest(this.withdrawsRequestObj)
      .subscribe(
        (res: any) => {
          this.toastr.successToastr(res.body.message.en);
          this.getAllPayablesAccount(
            this.offset.toString(),
            this.limit.toString(),
            this.defaultRequested,
            false,
            this.sortedString,
            this.selectedBusiness &&
              typeof this.selectedBusiness === "object" &&
              this.selectedBusiness.constructor === Object
              ? this.selectedBusiness.id.toString()
              : null,
            Object.keys(this.accountPaybleSearch).length
              ? this.accountPaybleSearch
              : null
          );
          this.getAccountPayableSummary();
          this.accountPayables = [];
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
  }

  sortColumnWise(keyString: string) {
    this.sortedString = AppConstants.createSortedString(
      keyString,
      this.sortingColumnArr,
      this.payableSorting
    );
    this.getAllPayablesAccount(
      this.offset.toString(),
      this.limit.toString(),
      this.defaultRequested,
      false,
      this.sortedString,
      this.selectedBusiness &&
        typeof this.selectedBusiness === "object" &&
        this.selectedBusiness.constructor === Object
        ? this.selectedBusiness.id.toString()
        : null,
      Object.keys(this.accountPaybleSearch).length
        ? this.accountPaybleSearch
        : null
    );
  }

  // Search
  paybleSearchForm() {
    this.accountPaybleSearch = this.utility.deleteEmptyPropertyFromObject(
      this.accountPaybleSearch
    );
    if (Object.keys(this.accountPaybleSearch).length) {
      this.setPaginationOnFirstPage();
      this.isApiSubmit = true;
      this.getAllPayablesAccount(
        this.offset.toString(),
        this.limit.toString(),
        this.defaultRequested,
        false,
        this.sortedString,
        this.selectedBusiness &&
          typeof this.selectedBusiness === "object" &&
          this.selectedBusiness.constructor === Object
          ? this.selectedBusiness.id.toString()
          : null,
        this.accountPaybleSearch
      );
    } else {
      this.toastr.errorToastr("Please enter data to search");
    }
  }

  invokeOnChnagingSearchData() {
    this.accountPaybleSearch = this.utility.deleteEmptyPropertyFromObject(
      this.accountPaybleSearch
    );
    if (!Object.keys(this.accountPaybleSearch).length) {
      this.clearSearchingForm();
    }
  }

  clearSearchingForm() {
    this.setPaginationOnFirstPage();
    this.accountPaybleSearch = {};
    this.getAllPayablesAccount(
      this.offset.toString(),
      this.limit.toString(),
      this.defaultRequested,
      false,
      this.sortedString,
      this.selectedBusiness &&
        typeof this.selectedBusiness === "object" &&
        this.selectedBusiness.constructor === Object
        ? this.selectedBusiness.id.toString()
        : null
    );
  }
}

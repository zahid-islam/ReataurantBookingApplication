import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { ToastrManager } from "ng6-toastr-notifications";
import { Paginator } from "primeng/paginator";

import { SortingObj } from "./../../../../shared/models/common.model";
import { Recevied } from "../../../models/business.model";
import { CreateBusinessService } from "../../../services/create-business.service";
import { AccountsService } from "../../../services/accounts.service";
import { Payables, PayToCustomer } from "../../../models/business.model";
import { PayableViewDetails } from "../../../models/account.model";
import { AppConstants } from "../../../../shared/constants/app-constants";
import { UtilityService } from "../../../../shared/services/utility.service";

declare var jQuery: any;

interface IAccountReceived {
  totalReceived: number;
}
declare var jsPDF: any;

@Component({
  selector: "app-received",
  templateUrl: "./received.component.html",
  styles: []
})
export class ReceivedComponent implements OnInit {
  @ViewChild("ReceivedDetailsModal", { static: false })
  ReceivedDetailsModal: ElementRef;
  @ViewChild("paginator", { static: false }) dataTable: ElementRef<Paginator>;
  viewDetails: PayableViewDetails = new PayableViewDetails();
  prefeexIndex: Payables = new Payables();
  b2bIndex: Payables = new Payables();
  customerIndex: Payables = new Payables();

  receivedAll: Recevied[];
  isLoading: boolean;
  isApiSubmit: boolean;

  // paginator variable
  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

  // below both property introduce for sorting column wise
  receivedSorting: SortingObj = new SortingObj();
  sortingColumnArr: any = [];
  sortedString: string = "";
  accountReceivedSearch: any = {};
  accountReceivedData: IAccountReceived = {} as IAccountReceived;

  constructor(
    private businessService: CreateBusinessService,
    private toastr: ToastrManager,
    private accountsService: AccountsService,
    private utility: UtilityService
  ) {}

  ngOnInit() {
    // set default sort property
    this.sortedString = "createdAt:desc";
    this.receivedSorting.createdAt = false;
    this.isLoading = false;
    this.isApiSubmit = false;

    this.getAllReceivedAccount(
      this.offset.toString(),
      this.limit.toString(),
      true,
      this.sortedString
    );
    this.getAccountReceivedSummary();
    // column array initialize
    this.sortingColumnArr = ["createdAt", "orderId", "amount"];
  }

  sortColumnWise(keyString: string) {
    this.sortedString = AppConstants.createSortedString(
      keyString,
      this.sortingColumnArr,
      this.receivedSorting
    );
    this.getAllReceivedAccount(
      this.offset.toString(),
      this.limit.toString(),
      false,
      this.sortedString
    );
  }

  getAccountReceivedSummary() {
    this.accountsService.getAccountReceivedSummary().subscribe(
      (res: any) => {
        this.accountReceivedData = res.data;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
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
        jQuery(this.ReceivedDetailsModal.nativeElement).modal("show");
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  checkValueIsNumberAndPositive(value: any) {
    return AppConstants.checkValueIsNumberAndPositive(value);
  }

  getAllReceivedAccount(
    offset: string,
    limit: string,
    loading?: boolean,
    sort?: string,
    search?: any
  ) {
    this.isLoading = loading === false ? loading : true;
    // this.businessService.getAllReceivedAccount(offset, limit, sort)
    this.accountsService
      .searchAllAccountReceivedPaginatedly(offset, limit, sort, search)
      .subscribe(
        (res: any) => {
          this.receivedAll = res.body.data.accountRecevied;
          this.totalCount = res.body.data.count;

          // Set pagination on exact offset number.
          const paginatorRef: any = this.dataTable;
          paginatorRef.first = this.offset;
          paginatorRef.rows = this.limit;
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
    if (Object.keys(this.accountReceivedSearch).length) {
      this.getAllReceivedAccount(
        this.offset.toString(),
        this.limit.toString(),
        false,
        this.sortedString,
        this.accountReceivedSearch
      );
    } else {
      this.getAllReceivedAccount(
        this.offset.toString(),
        this.limit.toString(),
        false,
        this.sortedString
      );
    }
  }

  // Download pdf from this function
  convert() {
    this.isLoading = true;
    let allReceived = [];
    let totalSum = 0;

    this.accountsService
      .getAllReceivedAccount(this.offset.toString(), this.totalCount.toString())
      .subscribe(
        (res: any) => {
          allReceived = res.body.data.accountRecevied;
          if (Array.isArray(allReceived) && allReceived.length > 0) {
            let doc = new jsPDF("l", "pt"); //oreientation, unit, formate
            doc.setFontSize(18);
            doc.text("Received Report", 350, 50);
            doc.setFontSize(8);
            doc.setTextColor(100);
            const col = [
              "Date",
              "Reservation ID",
              "For B2B",
              "Bank Transaction ID",
              "Received  Amount",
              "Comment"
            ];
            const rows = [];

            allReceived.forEach(item => {
              totalSum = totalSum + Number(item.amount);
              let date = new Date(item.createdAt).toLocaleDateString();
              const temp = [
                date,
                item.order.refId,
                item.business ? item.business.name : "",
                item.bankTransactionId,
                item.amount,
                item.comment
              ];
              rows.push(temp);
            });
            rows.push(["", "", "", "Total Amount:", totalSum, ""]);

            doc.autoTable(col, rows, { margin: { top: 70 } });
            doc.save("Received.pdf");
            totalSum = 0;
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
  receivedSearchForm() {
    this.accountReceivedSearch = this.utility.deleteEmptyPropertyFromObject(
      this.accountReceivedSearch
    );
    if (Object.keys(this.accountReceivedSearch).length) {
      this.setPagingAtOne();
      this.isApiSubmit = true;
      this.getAllReceivedAccount(
        this.offset.toString(),
        this.limit.toString(),
        false,
        this.sortedString,
        this.accountReceivedSearch
      );
    } else {
      this.toastr.errorToastr("Please enter data to search");
    }
  }

  invokeOnChnagingSearchData() {
    this.accountReceivedSearch = this.utility.deleteEmptyPropertyFromObject(
      this.accountReceivedSearch
    );
    if (!Object.keys(this.accountReceivedSearch).length) {
      this.clearSearchingForm();
    }
  }

  clearSearchingForm() {
    this.setPagingAtOne();
    this.accountReceivedSearch = {};
    this.getAllReceivedAccount(
      this.offset.toString(),
      this.limit.toString(),
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

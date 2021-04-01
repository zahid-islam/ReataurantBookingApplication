import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { ToastrManager } from "ng6-toastr-notifications";

import { AccountPaid } from "../../../models/business.model";
import { Payables } from "../../../models/business.model";
import { SortingWithdrawPaid } from "./../../../../shared/models/common.model";
import {
  PaidSummary,
  WithdrawRequestViewDetails
} from "../../../models/account.model";
import { AccountsService } from "../../../services/accounts.service";
import { AppConstants } from "../../../../shared/constants/app-constants";

declare var jQuery: any;
declare var jsPDF: any;

interface IPaidDateRangeModel {
  fromDate: Date;
  toDate: Date;
}
declare var jQuery: any;
@Component({
  selector: "app-paid",
  templateUrl: "./paid.component.html",
  styles: []
})
export class PaidComponent implements OnInit {
  @ViewChild("paidModal", { static: false }) paidModal: ElementRef;
  @ViewChild("paidDetailsModal", { static: false })
  paidDetailsModal: ElementRef;
  viewDetails: WithdrawRequestViewDetails = new WithdrawRequestViewDetails();
  prefeexIndex: Payables = new Payables();
  b2bIndex: Payables = new Payables();
  customerIndex: Payables = new Payables();
  accountPaidAll: AccountPaid[];
  paidSummary: PaidSummary = new PaidSummary();
  isLoading: boolean;

  // paginator variable
  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

  paidDateRangeModel: IPaidDateRangeModel = {} as IPaidDateRangeModel;

  // below both property introduce for  column wise sorting
  paidSorting: SortingWithdrawPaid = new SortingWithdrawPaid();
  sortingColumnArr: any = [];
  sortedString: string = "";

  constructor(
    private accountsService: AccountsService,
    private toastr: ToastrManager
  ) {}

  ngOnInit() {
    // set default sort property
    this.sortedString = "createdAt:desc";
    this.paidSorting.createdAt = false;
    this.isLoading = false;
    this.getAllPaidAccount(this.offset.toString(), this.limit.toString(), true, this.sortedString);
    this.getAllAccountPaidSummary();
    this.sortingColumnArr = ["createdAt", "amount"];
  }

  getAllAccountPaidSummary() {
    this.accountsService.getAccountPaidSummary().subscribe(
      (res: any) => {
        this.paidSummary = res.data;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  public getAllPaidAccount(
    offset: string,
    limit: string,
    loading?: boolean,
    sort?: string
  ) {
    this.isLoading = loading == false ? loading : true;
    this.accountsService.getAccountPaid(offset, limit, sort).subscribe(
      (res: any) => {
        this.accountPaidAll = res.body.data.accountPaid;
        this.totalCount = res.body.data.count;
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

  paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.getAllPaidAccount(
      this.offset.toString(),
      this.limit.toString(),
      false,
      this.sortedString
    );
  }

  public particularPaidDetails(WithdrawMoneyRequestId: number) {
    this.accountsService
      .getParticularWithdrawRequest(WithdrawMoneyRequestId)
      .subscribe(
        (res: any) => {
          this.viewDetails = res.body.data.withdrawRequest;
          jQuery(this.paidDetailsModal.nativeElement).modal("show");
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

  getAllAccountPaidPaginatedly() {
    this.accountPaidAll = [];
    this.isLoading = true;
    let currentDate = new Date().getTime();
    let fromDate = this.paidDateRangeModel.fromDate
      ? new Date(this.paidDateRangeModel.fromDate).getTime()
      : null;
    let toDate = this.paidDateRangeModel.toDate
      ? new Date(this.paidDateRangeModel.toDate).getTime()
      : new Date().getTime();

    if (fromDate <= toDate && fromDate != null && toDate <= currentDate) {
      this.accountsService
        .getAllAccountPaidPaginatedly(
          this.offset.toString(),
          this.limit.toString(),
          fromDate,
          toDate
        )
        .subscribe(
          (res: any) => {
            this.accountPaidAll = res.body.data.accountPaid;
            this.totalCount = res.body.data.count;
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
    } else {
      this.toastr.errorToastr(
        "From date is required to filter and DateFrom not greater than DateTo"
      );
    }
  }

  // Disabled future date into date calender.
  getToday(): string {
    return new Date().toISOString().split("T")[0];
  }

  sortColumnWise(keyString: string) {
    this.sortedString = AppConstants.createSortedString(
      keyString,
      this.sortingColumnArr,
      this.paidSorting
    );
    this.getAllPaidAccount(
      this.offset.toString(),
      this.limit.toString(),
      false,
      this.sortedString
    );
  }

  //Download pdf from this function
  convert() {
    this.isLoading = true;
    let allPaidList = [];
    let totalSum = 0;

    this.accountsService
      .getAccountPaid(this.offset.toString(), this.totalCount.toString())
      .subscribe(
        (res: any) => {
          allPaidList = res.body.data.accountPaid;
          if (Array.isArray(allPaidList) && allPaidList.length > 0) {
            let doc = new jsPDF("l", "pt"); //oreientation, unit, formate
            doc.setFontSize(18);
            doc.text("Paid List Report", 350, 50);
            doc.setFontSize(8);
            doc.setTextColor(100);
            const col = [
              "Date",
              "For B2B",
              "Bank Transaction ID",
              "Amount",
              "Comment"
            ];
            const rows = [];

            allPaidList.forEach(item => {
              totalSum = totalSum + Number(item.amount);
              let date = new Date(item.createdAt).toLocaleDateString();
              const temp = [
                date,
                item.business ? item.business.name : "",
                item.bankTransactionId,
                item.amount,
                item.comment
              ];
              rows.push(temp);
            });
            rows.push(["", "", "Total Amount:", totalSum, ""]);

            doc.autoTable(col, rows, { margin: { top: 70 } });
            doc.save("PaidList.pdf");
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
}

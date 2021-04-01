import { NgForm } from "@angular/forms";
import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { ToastrManager } from "ng6-toastr-notifications";

import {
  SettlementModel,
  SettledRequestModel
} from "./../../../models/account.model";
import { AccountsService } from "../../../services/accounts.service";

declare var jQuery: any;

@Component({
  selector: "app-order-promotion-list",
  templateUrl: "./order-promotion-list.component.html",
  styles: []
})
export class OrderPromotionListComponent implements OnInit {
  @ViewChild("settleModal", { static: false }) settleModal: ElementRef;
  isLoading: boolean;

  // paginator variable
  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;
  promotionFilterObj: any = {};

  allOrderPromotion: any[] = [];
  settlementModel: SettlementModel = new SettlementModel();
  today: any = new Date();

  constructor(
    private toastr: ToastrManager,
    private accountsService: AccountsService
  ) {}

  ngOnInit() {

    this.settlementModel.orderIds = [];
    this.promotionFilterObj.statuses = ["RECEIVED", "SETTLED"];
    this.isLoading = false;
    this.getAllOrderPromotionPaginatedly();
  }

  getAllOrderPromotionPaginatedly() {
    this.accountsService
      .getAllOrderPromotionPaginatedly(
        this.offset.toString(),
        this.limit.toString(),
        this.promotionFilterObj
      )
      .subscribe(
        (res: any) => {
          this.allOrderPromotion = res.body.data.orderPromotions;
          this.allOrderPromotion.forEach(item => {
            item.checked = false;
            item.isSettled =
              item.orderPromotionStatus.name === "SETTLED" ? "Yes" : "No";
          });
          this.totalCount = res.body.data.count;
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
  }

  setPromotionChecked(value: any, orderId: number) {
    if (value.target.checked) {
      this.settlementModel.orderIds.push(orderId);
    } else {
      let index = this.settlementModel.orderIds.indexOf(orderId);
      if (index != -1) {
        this.settlementModel.orderIds.splice(index, 1);
      }
    }
  }

  submitPromotionSettlement(settledForm: NgForm) {
    let settleRequestObj = {} as SettledRequestModel;
    settleRequestObj.orderIds = this.settlementModel.orderIds;
    settleRequestObj.settledDate = this.settlementModel.settledDate
      ? new Date(this.settlementModel.settledDate).getTime()
      : null;
    settleRequestObj.settledTraxId = this.settlementModel.settledTraxId;

    if (
      settleRequestObj.settledDate !== null &&
      settleRequestObj.settledTraxId !== null &&
      settleRequestObj.orderIds.length
    ) {
      this.accountsService
        .markPaidOrderPromotionAsSettled(settleRequestObj)
        .subscribe(
          (res: any) => {
            this.toastr.successToastr(res.body.message.en);
            jQuery(this.settleModal.nativeElement).modal("hide");
            this.getAllOrderPromotionPaginatedly();
            settledForm.reset();
          },
          err => {
            this.toastr.errorToastr(err.error.message.en);
          }
        );
    } else {
      this.toastr.infoToastr(
        "You have to insert Transaction Id and Settlement Date!"
      );
    }
  }

  popUpSettlement() {
    jQuery(this.settleModal.nativeElement).modal("show");
  }

  paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.getAllOrderPromotionPaginatedly();
  }
}

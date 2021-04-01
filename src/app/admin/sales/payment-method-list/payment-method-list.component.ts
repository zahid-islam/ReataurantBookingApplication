import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from "@angular/core";
import { ToastrManager } from "ng6-toastr-notifications";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from 'rxjs';

import { CreateBusinessService } from "./../../services/create-business.service";
import { BusinessBankInfos } from "../../models/business.model";

declare var jQuery: any;

@Component({
  selector: 'app-payment-method-list',
  templateUrl: './payment-method-list.component.html',
  styles: []
})
export class PaymentMethodListComponent implements OnInit, OnDestroy {
  @ViewChild("BankDeleteConfirmModal", { static: false }) BankDeleteConfirmModal: ElementRef;

  businesId: number;
  bankID: number;
  isLoading: boolean;
  isDeleteBankInfoApiSubmit: boolean;
  private subscription: Subscription;
  allRegisteredBanks: BusinessBankInfos[];

  constructor(
    private businessService: CreateBusinessService,
    private toastr: ToastrManager,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.isLoading = false;
    this.isDeleteBankInfoApiSubmit = false;
    this.subscription = this.route.params.subscribe(params => {
      this.businesId = +params["id"];
      if (this.businesId) {
        this.getAllRegisteredBanksUnderBusiness(this.businesId);
      }

    });
  }

  getAllRegisteredBanksUnderBusiness(businessId: number) {
    this.subscription = this.businessService.getAllRegisteredBanks(businessId).subscribe(
      (res: any) => {
        this.allRegisteredBanks = res.body.data.businessBankInfos;
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

  editBankInfo(bankId: number) {
    this.router.navigate([`/admin/sales/payment-method/${this.businesId}/update-bank-info`, bankId]);
  }

  deleteBankInfo(bankId: number) {
    this.bankID = bankId;
    jQuery(this.BankDeleteConfirmModal.nativeElement).modal("show");

  }

  bankDeleteConfirm(isConfirm: boolean) {
    if (this.bankID && isConfirm === true) {
      this.isDeleteBankInfoApiSubmit = true;
      this.businessService.deleteBankUnderBusiness(this.businesId, this.bankID).subscribe(
        (res: any) => {
          this.toastr.successToastr(res.body.message.en);
          this.getAllRegisteredBanksUnderBusiness(this.businesId);
        },
        err => {
          this.isDeleteBankInfoApiSubmit = false;
          this.toastr.errorToastr(err.error.message.en);
        },
        () => {
          this.isDeleteBankInfoApiSubmit = false;
          jQuery(this.BankDeleteConfirmModal.nativeElement).modal("hide");
        }
      );
    }  else if (isConfirm === false) {
      jQuery(this.BankDeleteConfirmModal.nativeElement).modal("hide");
    }

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}

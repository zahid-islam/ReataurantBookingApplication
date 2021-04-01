
import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { PlatformLocation } from '@angular/common';
import { ToastrManager } from "ng6-toastr-notifications";

import { CreateBusinessService } from "../../services/create-business.service";
import { BusinessBankInfos } from "../../models/business.model";
import { SharedDataService } from '../../../shared/services/shared-data.service';

@Component({
  selector: 'app-payment-method-form',
  templateUrl: './payment-method-form.component.html',
})
export class PaymentMethodFormComponent implements OnInit {
  isApiSubmit: boolean;
  isReadOnly: boolean;
  bankInfoModel: BusinessBankInfos = new BusinessBankInfos();
  businessId: number;
  bankId: number;

  constructor(
    private businessService: CreateBusinessService,
    private toastr: ToastrManager,
    private router: Router,
    private platformLocation: PlatformLocation,
    private sharedDataService: SharedDataService,

  ) {
    this.isApiSubmit = false;
  }

  ngOnInit() {
    let pathIdList: number[] = [];
    const fullPath = this.platformLocation.href;
    pathIdList = this.sharedDataService.getFillPathIDList(fullPath);
    if (pathIdList.length == 1) {
      this.businessId = pathIdList[0];
    } else if (pathIdList.length == 2) {
      this.businessId = pathIdList[0];
      this.bankId = pathIdList[1];
      this.getParticularBankById(this.businessId, this.bankId);
    }
  }

  getParticularBankById(businesId: number, bankId: number) {
    if (this.bankId != undefined && this.businessId != undefined) {
      this.businessService.getParticularBankById(businesId, bankId).subscribe(
        (res: any) => {
          const particularBank = res.body.data.bankInfo;
          this.bankInfoModel.accountNumber = particularBank.accountNumber;
          this.bankInfoModel.accountHolderName = particularBank.accountHolderName;
          this.bankInfoModel.bankName = particularBank.bankName;
          this.bankInfoModel.routingNumber = particularBank.routingNumber;
          this.bankInfoModel.branchName = particularBank.branchName;
          this.bankInfoModel.branchAddress = particularBank.branchAddress;
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
    }
  }

  submitBankInfo(userForm: NgForm) {
    if (userForm) {
      this.isApiSubmit = true;
      if (this.bankId != undefined) {
        this.businessService
          .updateBankInfoUnderBusiness(this.bankInfoModel, this.businessId, this.bankId)
          .subscribe(
            (res: any) => {
              this.isApiSubmit = false;
              this.toastr.successToastr(res.body.message.en);
              this.router.navigate([`/admin/sales/payment-method/${this.businessId}`]);
            },
            (err: any) => {
              this.isApiSubmit = false;
              this.toastr.errorToastr(err.error.message.en);
            },
            () => {
              this.isApiSubmit = false;
            }
          );
      } else {
        this.businessService
          .registerNewBankAgainstBusiness(this.bankInfoModel, this.businessId)
          .subscribe(
            (res: any) => {
              this.isApiSubmit = false;
              this.toastr.successToastr(res.body.message.en);
              this.router.navigate(["/admin/sales/payment-method", this.businessId]);
            },
            (err: any) => {
              this.isApiSubmit = false;
              this.toastr.errorToastr(err.error.message.en);
            },
            () => {
              this.isApiSubmit = false;
            }
          );
      }
    } else {
      this.toastr.errorToastr("Please enter valid data");
    }
  }

}

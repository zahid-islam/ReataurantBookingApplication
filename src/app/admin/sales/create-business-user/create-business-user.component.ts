import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { PlatformLocation } from '@angular/common';
import { ToastrManager } from "ng6-toastr-notifications";

import { CreateBusinessService } from "../../services/create-business.service";


@Component({
  selector: "app-create-business-user",
  templateUrl: "./create-business-user.component.html",
})
export class CreateBusinessUserComponent implements OnInit, OnDestroy {

  isApiSubmit: boolean;
  isReadOnly: boolean;
  userModel: any = {};
  businessId: number;
  businessUserId: number;

  constructor(
    private businessService: CreateBusinessService,
    private toastr: ToastrManager,
    private router: Router,
    private platformLocation: PlatformLocation,
  ) {
    this.isReadOnly = false;
    this.isApiSubmit = false;
  }

  ngOnInit() {
    const regex = /\/\d+/g;
    let allID: number[] = [];
    const fullPath = this.platformLocation.href;
    allID = fullPath.match(regex).map(str => parseInt(str.substr(1)));
    if (allID.length == 1) {
      this.businessId = allID[0];
    } else if (allID.length == 2) {
      this.businessId = allID[0];
      this.businessUserId = allID[1];
      this.getBusinessUserById(this.businessUserId, this.businessId);
    }
  }

  getBusinessUserById(userId: number, businesId: number) {
    if (this.businessUserId != 0 && this.businessId != 0) {
      this.businessService.getBusinessesUserById(businesId, userId).subscribe(
        (res: any) => {
          this.isReadOnly = true;
          let data = res.body.data;
          this.userModel.firstName = data.firstName;
          this.userModel.lastName = data.lastName;
          this.userModel.email = data.email;
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
    }
  }

  //Create and Update business user
  submitUserOfBusiness(userForm: NgForm) {
    if (userForm) {
      this.isApiSubmit = true;
      if (this.businessUserId != undefined) {
        delete this.userModel.email;
        this.businessService
          .updateUserUnderBusiness(
            this.userModel,
            this.businessId,
            this.businessUserId
          )
          .subscribe(
            (res: any) => {
              this.toastr.successToastr(res.body.message.en);
              this.isApiSubmit = false;
              this.router.navigate([
                `admin/sales/business-user/${this.businessId}`
              ]);
            },
            err => {
              this.isApiSubmit = false;
              this.toastr.errorToastr(err.error.message.en);
            },
            () => {
              this.isApiSubmit = false;
            }
          );
      } else {
        //this.userModel.password = Math.random().toString(36).slice(-6);
        this.userModel.password = "1234";
        this.businessService
          .submitUserUnderBusiness(this.userModel, this.businessId)
          .subscribe(
            (res: any) => {
              this.isApiSubmit = false;
              this.toastr.successToastr(res.body.message.en);
              this.router.navigate(["admin/sales/create-business-user-view"], { state: { data: this.userModel } });
            },
            err => {
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

  ngOnDestroy() {
  }
}

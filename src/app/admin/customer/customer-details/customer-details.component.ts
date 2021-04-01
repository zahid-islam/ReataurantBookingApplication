import { Component, OnInit } from "@angular/core";
import { ToastrManager } from "ng6-toastr-notifications";
import { Router, ActivatedRoute } from "@angular/router";

import { CustomerService } from "./../../services/customer.service";
import { UserModel } from "src/app/user/models/user.model";

@Component({
  selector: "app-customer-details",
  templateUrl: "./customer-details.component.html",
  styles: []
})
export class CustomerDetailsComponent implements OnInit {
  customerDetailsGridLists: any[];
  customerId: number;
  customerDetails: UserModel = new UserModel();
  age: number;
  isImgLoading: boolean;

  constructor(
    private customerService: CustomerService,
    private toastr: ToastrManager,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.isImgLoading = true;
    this.route.params.subscribe(params => {
      this.customerId = +params["id"];
      if (this.customerId) {
        this.getCustomerById(this.customerId);
      }
    });
  }

  onLoad() {
    this.isImgLoading = false;
  }

  getCustomerById(customerId: number) {
    this.customerService.getCustomerById(customerId).subscribe(
      (res: any) => {
        this.customerDetails = res.body.data.user;

        //Calculate age from dob
        if (this.customerDetails.dob) {
          const bdate = new Date(this.customerDetails.dob);
          let timeDiff = Math.abs(Date.now() - bdate.getTime());
          this.age = Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);
        }
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

}

import { SettingService } from "./../../../services/setting.service";
import { Component, OnInit } from "@angular/core";
import { RefundPolicy, PolicyBreakdown } from "../../../models/setting.model";
import { ToastrManager } from "ng6-toastr-notifications";
import { Router } from "@angular/router";

@Component({
  selector: "app-create-refund-policy",
  templateUrl: "./create-refund-policy.component.html",
  styles: []
})
export class CreateRefundPolicyComponent implements OnInit {
  minDate: Date;
  refundPolicy: RefundPolicy = new RefundPolicy();
  policyModel: PolicyBreakdown = new PolicyBreakdown();
  policyBreakdowns: PolicyBreakdown[] = [];
  policyBreakdown: PolicyBreakdown = new PolicyBreakdown();
  isNoRefundObject: any;
  hoursList: any;
  isAppliedBeforeMillisObject: any;
  disablePercetageField: boolean = false;
  selectedHour: any;
  isApiSubmit: boolean;

  constructor(
    private toastr: ToastrManager,
    private settingService: SettingService,
    private router: Router
  ) {
    this.hoursList = [
      { name: "2", value: 2 * 3600 * 1000, disabled: false },
      { name: "6", value: 6 * 3600 * 1000, disabled: false },
      { name: "12", value: 12 * 3600 * 1000, disabled: false },
      { name: "24", value: 24 * 3600 * 1000, disabled: false },
      { name: "48", value: 48 * 3600 * 1000, disabled: false },
      { name: "All", value: 0, disabled: false }
    ];
    this.isNoRefundObject = [
      { name: "Yes", value: true },
      { name: "No", value: false }
    ];

    this.isAppliedBeforeMillisObject = [
      { name: "Before", value: true },
      { name: "After", value: false }
    ];
  }

  ngOnInit() {
    this.resetPolicyBreakdownForm();
    this.initializePolicyApplyDate();
  }

  // bcz of set current time to 1 hour advance
  initializePolicyApplyDate() {
    let date = new Date();
    let addedDateTime = date.setHours(date.getHours() + 1);
    this.refundPolicy.policyApplyFromDate = new Date(addedDateTime);
    this.minDate = new Date(addedDateTime);
  }

  createRefundPolicy() {
    if (this.policyBreakdowns.length) {
      if (this.policyBreakdowns.length == 1) {
        if (this.policyBreakdowns[0].isAppliedBeforeMillis) {
          this.submitPolicy();
        } else {
          this.toastr.infoToastr(
            "If you want only one policy then It should be All Hours policy."
          );
        }
      } else {
        let length = this.policyBreakdowns.length;
        if (this.policyBreakdowns[length - 1].isAppliedBeforeMillis) {
          this.submitPolicy();
        } else {
          this.toastr.infoToastr("You must have to create All Hours policy.");
        }
      }
    }
  }

  submitPolicy() {
    this.isApiSubmit = true;
    let policyObject = {} as RefundPolicy;
    policyObject.policyBreakdowns = this.policyBreakdowns;
    policyObject.policyApplyFromDate = this.formatePolicyApplyDate();
    this.settingService.createNewRefundPolicy(policyObject).subscribe(
      (res: any) => {
        this.isApiSubmit = false;
        this.toastr.successToastr(res.body.message.en);
        this.router.navigate(["admin/setting/refund-policy"]);
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

  formatePolicyApplyDate() {
    if (this.refundPolicy.policyApplyFromDate) {
      return this.refundPolicy.policyApplyFromDate.getTime();
    } else {
      return this.minDate.getTime();
    }
  }

  setAppliedMilis() {
    if (this.selectedHour) {
      this.policyModel.appliedMillis = this.selectedHour.value;
    }
  }

  setPercentageField() {
    if (this.policyModel.isNoRefund) {
      this.policyModel.b2bPercentage = 0;
      this.policyModel.b2cPercentage = 0;
      this.policyModel.prefeexPercentage = 0;
      this.disablePercetageField = true;
    } else {
      this.disablePercetageField = false;
    }
  }

  addPolicyBreakdown() {
    let policy: PolicyBreakdown = Object.assign({}, this.policyModel);
    if (this.selectedHour) {
      if (this.selectedHour.name == "All") {
        policy.isAppliedBeforeMillis = true;
      }
      if (policy.isNoRefund) {
        this.policyBreakdowns.push(policy);
        // bcz I don't wanna insert same policy again
        this.setSelecetdHourDisabled();
        this.resetPolicyBreakdownForm();
        this.sortPolicyBreakDown();
      } else {
        let sumOfPercentage =
          policy.b2bPercentage +
          policy.b2cPercentage +
          policy.prefeexPercentage;
        if (sumOfPercentage == 100) {
          this.policyBreakdowns.push(policy);
          // bcz I don't wanna insert same policy again.
          this.setSelecetdHourDisabled();
          this.resetPolicyBreakdownForm();
          this.sortPolicyBreakDown();
        } else {
          this.toastr.infoToastr(
            "B2C, B2B and Prefeex percentage's sum should be 100"
          );
        }
      }
    } else {
      this.toastr.infoToastr("Please slelect an Hours");
    }
  }

  setSelecetdHourDisabled() {
    this.hoursList.find(
      item => item.name == this.selectedHour.name
    ).disabled = true;
  }

  sortPolicyBreakDown() {
    // let abc = [56, 0, 7, 8];
    // abc.sort((a, b) => (a > b) ? 1 : ((b > a) ? -1 : 0));
    if (this.policyBreakdowns.length > 1) {
      // sorted here bcz all policy appliedMillis can replaced by last applied milis.
      this.sortAnArray();
      let length = this.policyBreakdowns.length;
      // Find index of All policy then get the
      // last item from sorted list and set the last item into All policy index position.
      let lastItem = this.policyBreakdowns[length - 1];
      //Don't want to execute if last item is All policy item.
      if (!lastItem.isAppliedBeforeMillis) {
        let index = this.policyBreakdowns.findIndex(
          item => item.isAppliedBeforeMillis == true
        );
        if (index != -1) {
          let temp = Object.assign({}, this.policyBreakdowns[index]);
          temp.appliedMillis = lastItem.appliedMillis;
          this.policyBreakdowns[index] = this.policyBreakdowns[length - 1];
          this.policyBreakdowns[length - 1] = temp;
        }
        this.sortAnArray();
      } else {
        this.policyBreakdowns[length - 1].appliedMillis = this.policyBreakdowns[
          length - 2
        ].appliedMillis;
      }
    } else {
      if (this.policyBreakdowns[0].isAppliedBeforeMillis) {
        this.policyBreakdowns[0].appliedMillis = 0;
      }
    }
  }

  sortAnArray() {
    this.policyBreakdowns.sort((a, b) =>
      a.appliedMillis > b.appliedMillis
        ? 1
        : b.appliedMillis > a.appliedMillis
        ? -1
        : 0
    );
  }

  deletePolicy(index: number, policy: PolicyBreakdown) {
    // bcz when an item deleted again want to show hour enabled.
    if (policy.isAppliedBeforeMillis) {
      this.hoursList.find(item => item.name == "All").disabled = false;
    } else {
      this.hoursList.find(
        item => item.value == policy.appliedMillis
      ).disabled = false;
    }

    this.policyBreakdowns.splice(index, 1);
    this.sortPolicyBreakDown();
  }

  resetPolicyBreakdownForm() {
    this.policyModel.appliedMillis = 0;
    this.policyModel.b2bPercentage = 0;
    this.policyModel.b2cPercentage = 0;
    this.policyModel.isNoRefund = false;
    this.policyModel.prefeexPercentage = 0;
    this.policyModel.isAppliedBeforeMillis = false;
    this.selectedHour = null;
    this.disablePercetageField = false;
  }
}

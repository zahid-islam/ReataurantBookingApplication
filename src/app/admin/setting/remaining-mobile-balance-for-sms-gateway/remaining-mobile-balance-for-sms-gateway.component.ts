import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { ToastrManager } from "ng6-toastr-notifications";

import { SMSGatewayBalance } from "../../models/setting.model";
import { SettingService } from "../../services/setting.service";

@Component({
  selector: "app-remaining-mobile-balance-for-sms-gateway",
  templateUrl: "./remaining-mobile-balance-for-sms-gateway.component.html",
  styles: []
})
export class RemainingMobileBalanceForSmsGatewayComponent
  implements OnInit, OnDestroy {
  private subscription: Subscription;
  isLoading: boolean;
  public smsGatewayBalance: SMSGatewayBalance = new SMSGatewayBalance();

  constructor(
    private settingService: SettingService,
    private toastr: ToastrManager
  ) {}

  ngOnInit() {
    this.isLoading = false;
    this.getSMSGatewayBalance();
  }

  private getSMSGatewayBalance() {
    this.isLoading = true;
    this.subscription = this.settingService.getSMSGatewayBalance().subscribe(
      (res: any) => {
        this.smsGatewayBalance = res.body.data.balanceModel;
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

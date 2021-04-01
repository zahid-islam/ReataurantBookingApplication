import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrManager } from "ng6-toastr-notifications";

import { SettingService } from '../../../services/setting.service';
import { RefundPoliciesList, ParticularRefundPolicy } from '../../../models/setting.model';

declare var jQuery: any;

@Component({
  selector: 'app-refund-policy-list',
  templateUrl: './refund-policy-list.component.html',
  styles: []
})
export class RefundPolicyListComponent implements OnInit, OnDestroy {
  @ViewChild('RefundPolicieDetailsModal', { static: false }) FacilitiesModal: ElementRef;
  private subscription: Subscription;
  public isLoading: boolean;
  public refundPolicies: RefundPoliciesList[];
  public particularRefundPolicy: ParticularRefundPolicy = new ParticularRefundPolicy();

  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

  constructor(
    private settingService: SettingService,
    private toastr: ToastrManager,
  ) {
    this.isLoading = false;
  }

  ngOnInit() {
    this.getRefundPolicyList(this.offset.toString(), this.limit.toString());
  }

  private getRefundPolicyList(offset: string, limit: string, loading?: boolean) {
    this.isLoading = loading == false ? loading : true;
    this.subscription = this.settingService.getRefundPolicyList(offset, limit).subscribe(
      (res: any) => {
        this.refundPolicies = res.body.data.refundPolicies;
        this.totalCount = res.body.data.count;
      },
      err => {
        this.isLoading = false;
        this.toastr.errorToastr(err.error.message.en);
      },
      () => {
        this.isLoading = false;
      });
  }

  public paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.getRefundPolicyList(this.offset.toString(), this.limit.toString(), false);
  }

  public getParticularRefundPolicy(refundpolicieId: number) {

    if (refundpolicieId) {
      this.settingService.getParticularRefundPolicy(refundpolicieId).subscribe(
        (res: any) => {
          this.particularRefundPolicy = res.body.data.refundPolicy;

          jQuery(this.FacilitiesModal.nativeElement).modal('show');
        },
        (err: any) => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
    }
    jQuery(this.FacilitiesModal.nativeElement).modal('show');

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscription.unsubscribe();
  }

}

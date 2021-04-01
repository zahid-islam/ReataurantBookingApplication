import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ActivatedRoute } from '@angular/router';

import { AllNotification, Recipients } from '../../../shared/models/marketing.model';
import { MarketingService } from '../../../shared/services/marketing.service';


@Component({
  selector: 'app-notification-details',
  templateUrl: './notification-details.component.html',
  styles: []
})
export class NotificationDetailsComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  isLoading: boolean;
  notificationDetails: AllNotification = new AllNotification();
  recipients: Recipients[];
  notificationId: number;

  // paginator variable
  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

  constructor(
    private marketingService: MarketingService,
    private toastr: ToastrManager,
    private route: ActivatedRoute,
  ) {
    this.isLoading = false;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.notificationId = +params["id"];
      if (this.notificationId) {
        this.getMarketingPushNotificcationDetails(this.notificationId);
        this.getParticularNotificationRecipients(this.notificationId, this.offset.toString(), this.limit.toString());
      }
    });
  }

  private getParticularNotificationRecipients(notificationID: number, offset: string, limit: string, loading?: boolean) {
    this.isLoading = loading == false ? loading : true;
    this.subscription = this.marketingService.getParticularNotificationRecipients(notificationID, offset, limit).subscribe(
      (res: any) => {
        this.recipients = res.body.data.recipients;
        this.totalCount = res.body.data.count;
      },
      err => {
        this.isLoading = false;
        this.toastr.errorToastr(err.error.message.en);
      },
      () => {
        this.isLoading = false;
      }
    );
  }
  private getMarketingPushNotificcationDetails(notificationID: number) {
    this.subscription = this.marketingService.getMarketingPushNotificcationDetails(notificationID).subscribe(
      (res: any) => {
        this.notificationDetails = res.body.data.notification;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }


  public paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.getParticularNotificationRecipients(
      this.notificationId,
      this.offset.toString(),
      this.limit.toString(),
      false
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();

  }

}

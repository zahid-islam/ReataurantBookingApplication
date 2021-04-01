import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from "@angular/core";
import { Paginator } from "primeng/paginator";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { ToastrManager } from "ng6-toastr-notifications";

import { MarketingService } from "../../../shared/services/marketing.service";
import { AllNotification } from "../../../shared/models/marketing.model";
import { CommonType } from "../../../shared/models/common.model";

@Component({
  selector: "app-notification",
  templateUrl: "./notification.component.html",
  styles: []
})
export class NotificationComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  @ViewChild("paginator", { static: false }) dataTable: ElementRef<Paginator>;
  allNotification: AllNotification[];
  notificationStatuses: CommonType[];
  notificationStatus: string = '';
  isLoading: boolean;
  // for filter table data based on status
  statusForFilter: any = 0;

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
    private router: Router
  ) {
    this.isLoading = false;
  }

  ngOnInit() {
    this.getMarketingNotificationStatus();
    this.subscription = this.route.queryParams.subscribe(params => {
      this.offset = +params["offset"] || 0;
      this.limit = +params["limit"] || 10;
    });
    this.getAllMarketingPush(this.offset.toString(), this.limit.toString());
  }

  getAllMarketingPush(
    offset: string,
    limit: string,
    status?: string,
    loading?: boolean
  ) {
    this.isLoading = loading == false ? loading : true;
    this.subscription = this.subscription = this.marketingService
      .getAllMarketingPush(offset, limit, status)
      .subscribe(
        (res: any) => {
          this.allNotification = res.body.data.notifications;
          this.totalCount = res.body.data.count;
          let paginatorRef: any = this.dataTable;
          paginatorRef.first = this.offset;
          paginatorRef.rows = this.limit;
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

  getMarketingNotificationStatus() {
    this.subscription = this.subscription = this.marketingService
      .getMarketingNotificationStatus()
      .subscribe(
        (res: any) => {
          this.notificationStatuses = res.body.data.publicNotificationStatuses;
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
  }

  public filterNotificationOnStatusChange(statusId: number) {
    this.statusForFilter = statusId;
    if (statusId != 0) {
      this.notificationStatus = this.notificationStatuses.find(item => {
        return item.id == statusId;
      }).name;
    }

    this.getAllMarketingPush(
      this.offset.toString(),
      this.limit.toString(),
      this.notificationStatus
    );
  }

  public paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.router.navigate(["/admin/marketing/notifications"], {
      queryParams: { offset: this.offset, limit: this.limit }
    });
    if (this.statusForFilter != 0) {
      this.notificationStatus = this.notificationStatuses.find(item => {
        return item.id == this.statusForFilter;
      }).name;
    }
    this.getAllMarketingPush(
      this.offset.toString(),
      this.limit.toString(),
      this.notificationStatus,
      false
    );
  }

  public cancelPendingNotification(notificationId: number) {
    this.marketingService.cancelPendingNotification(notificationId).subscribe(
      (res: any) => {
        this.toastr.successToastr(res.message.en);
        this.getAllMarketingPush(this.offset.toString(), this.limit.toString(), this.notificationStatus, false);
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

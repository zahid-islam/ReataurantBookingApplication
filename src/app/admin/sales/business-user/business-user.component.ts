import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { ToastrManager } from "ng6-toastr-notifications";
import { Paginator } from "primeng/paginator";

import { CreateBusinessService } from "./../../services/create-business.service";
import { BusinessStatuses } from "../../models/business.model";
import { UserModel } from "./../../../user/models/user.model";

@Component({
  selector: "app-business-user",
  templateUrl: "./business-user.component.html",
  styles: []
})
export class BusinessUserComponent implements OnInit, OnDestroy {
  @ViewChild("paginator", { static: false }) dataTable: ElementRef<Paginator>;
  private subscription: Subscription;
  isLoading: boolean;
  allBusinessUsers: UserModel[];
  businessUserStatuses: BusinessStatuses[];
  businessUserStatus: any = {};
  statusOfBusinessUser: {};
  businessUserModel: any = {};
  businesId: number;

  offset: any = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: any = 10;
  pageLink: number = 5;

  // for filter table data based on status
  statusForFilter: any = 0;
  queryParamsString: string;
  paramsaa: any;

  constructor(
    private businessService: CreateBusinessService,
    private toastr: ToastrManager,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.isLoading = false;
  }

  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {
      this.businesId = +params["id"];
    });

    this.subscription = this.route.queryParams.subscribe(params => {
      this.offset = +params["offset"] || 0;
      this.limit = +params["limit"] || 10;
    });

    if (this.businesId) {
      this.getBusinesseUserListById(
        this.businesId,
        this.offset.toString(),
        this.limit.toString()
      );
    }

    this.getBusinessesUserStatusList();
  }

  getBusinesseUserListById(
    businessId: number,
    offset: string,
    limit: string,
    status?: string,
    loading?: boolean
  ) {
    this.isLoading = loading == false ? loading : true;
    this.subscription = this.businessService
      .getBusinesseUsers(businessId, offset, limit, status)
      .subscribe(
        (res: any) => {
          this.allBusinessUsers = res.body.data.users;
          this.totalCount = res.body.data.count;
          let paginatorRef: any = this.dataTable;
          paginatorRef.first = this.offset;
          paginatorRef.rows = this.limit;
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

  getBusinessesUserStatusList() {
    this.subscription = this.businessService
      .getBusinessesUserStatus()
      .subscribe(
        (res: any) => {
          this.businessUserStatuses = res.body.data.statuses;
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
  }

  statusChangesAction(statusId, businessUser: any) {
    let businessUserStatus = this.businessUserStatuses.find(item => {
      return item.id == parseInt(statusId);
    }).name;

    if (businessUserStatus) {
      this.businessUserModel.userStatus = businessUserStatus;
      this.businessService
        .updateUserUnderBusiness(
          this.businessUserModel,
          this.businesId,
          businessUser.id
        )
        .subscribe(
          (res: any) => {
            businessUser.userStatus.name = businessUserStatus;
            this.toastr.successToastr(res.body.message.en);
          },
          err => {
            businessUser.userStatus.name = businessUser.userStatus.name;
            this.toastr.errorToastr(err.error.message.en);
          }
        );
    }
  }

  paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.router.navigate([`/admin/sales/business-user/${this.businesId}/`], {
      queryParams: {
        offset: this.offset,
        limit: this.limit
      }
    });
    let businessUserStatus;
    if (this.statusForFilter != 0) {
      businessUserStatus = this.businessUserStatuses.find(item => {
        return item.id == this.statusForFilter;
      }).name;
    }

    this.getBusinesseUserListById(
      this.businesId,
      this.offset.toString(),
      this.limit.toString(),
      businessUserStatus,
      false
    );
  }

  filterBusinessUsersOnStatusChange(statusId: number) {
    this.statusForFilter = statusId;
    let businessUserStatus;
    if (statusId != 0) {
      businessUserStatus = this.businessUserStatuses.find(item => {
        return item.id == statusId;
      }).name;
    }

    this.getBusinesseUserListById(
      this.businesId,
      this.offset.toString(),
      this.limit.toString(),
      businessUserStatus
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

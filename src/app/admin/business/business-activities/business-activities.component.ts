import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from "@angular/core";
import { ToastrManager } from "ng6-toastr-notifications";
import { PlatformLocation } from "@angular/common";
import { Paginator } from "primeng/paginator";
import { Router, ActivatedRoute } from "@angular/router";
import { forkJoin, Subscription } from "rxjs";

import { OrdersService } from "../../../shared/services/orders.service";
import { Orders } from "../../../shared/models/orders.model";
import { CommonType } from "../../../shared/models/common.model";
import { SharedDataService } from "../../../shared/services/shared-data.service";
import { UtilityService } from "../../../shared/services/utility.service";

@Component({
  selector: "app-business-activities",
  templateUrl: "./business-activities.component.html",
  styles: []
})
export class BusinessActivitiesComponent implements OnInit, OnDestroy {
  @ViewChild("paginator", { static: false }) dataTable: ElementRef<Paginator>;
  private subscription: Subscription;
  public allReservation: Orders[] = [];
  reservationStatus: CommonType[] = [];
  reservationSearch: any = {};
  reservationStatusName: string;
  isLoading: boolean = false;
  isApiSubmit: boolean = false;

  // paginator variable
  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;
  status: any = null;
  search: any = null;

  // for filter table data based on status
  statusForFilter: any = 0;
  businessId: number = 0;

  constructor(
    private orderService: OrdersService,
    private toastr: ToastrManager,
    private sharedService: SharedDataService,
    private platformLocation: PlatformLocation,
    private utility: UtilityService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.getReservationStatus();
  }

  ngOnInit() {
    const fullPath = this.platformLocation.href;
    this.businessId = this.sharedService.getBusinessIdFromUrl(fullPath);

    this.subscription = this.route.queryParams.subscribe(params => {
      this.offset = +params["offset"] || 0;
      this.limit = +params["limit"] || 10;
      this.status = params["status"] || null;
      this.search = params["search"] || null;

      // Decode search object
      if (this.search) {
        this.reservationSearch = JSON.parse(atob(this.search));
      } else {
        this.reservationSearch = {};
      }
      this.reservationStatusName = this.status ? this.status : null;
      this.statusForFilter = this.status && this.reservationStatus.length ? this.getStatusIdByName(this.status) : 0;

      if (Object.keys(this.reservationSearch).length) {
        this.getSearchResultInAllOrderUnderABusiness(
          this.businessId,
          this.reservationSearch,
          this.offset.toString(),
          this.limit.toString(),
          this.reservationStatusName
        );
      } else {
        this.getSearchResultInAllOrderUnderABusiness(
          this.businessId,
          this.reservationSearch,
          this.offset.toString(),
          this.limit.toString(),
          this.reservationStatusName
        );
      }
    });
  }

  getReservationStatus() {
    this.orderService.getOrdersStatus().subscribe(
      (res: any) => {
        this.reservationStatus = res.body.data.orderStatuses;
        this.statusForFilter = this.status ? this.getStatusIdByName(this.status) : 0;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  getStatusIdByName(name: string) {
    let statusId = 0;
    if (name) {
      statusId = this.reservationStatus.find(item => {
        return item.name === name;
      }).id;
    }
    return statusId;
  }

  public filterReservationOnStatusChange(statusId: number) {
    this.isLoading = false;
    this.setPagingAtOne();
    this.reservationStatusName = this.utility.getStatusNameById(
      this.reservationStatus,
      this.statusForFilter
    );

    if (Object.keys(this.reservationSearch).length) {
      this.setQueryParams(
        this.offset,
        this.limit,
        this.reservationStatusName,
        btoa(JSON.stringify(this.reservationSearch))
      );
    } else {
      this.setQueryParams(
        this.offset,
        this.limit,
        this.reservationStatusName,
        null
      );
    }
  }

  public paginate(event) {
    this.isLoading = false;
    this.offset = event.first;
    this.limit = event.rows;
    if (Object.keys(this.reservationSearch).length) {
      this.setQueryParams(
        this.offset,
        this.limit,
        this.reservationStatusName,
        btoa(JSON.stringify(this.reservationSearch))
      );
    } else {
      this.setQueryParams(
        this.offset.toString(),
        this.limit.toString(),
        this.reservationStatusName
      );
    }
  }

  // Search
  reservationSearchForm() {
    this.reservationSearch = this.utility.deleteEmptyPropertyFromObject(
      this.reservationSearch
    );

    if (Object.keys(this.reservationSearch).length) {
      this.setPagingAtOne();
      this.isApiSubmit = this.allReservation.length ? true : false;
      this.setQueryParams(
        this.offset.toString(),
        this.limit.toString(),
        this.reservationStatusName,
        btoa(JSON.stringify(this.reservationSearch))
      );
    } else {
      this.toastr.errorToastr("Please enter data to search");
    }
  }

  getSearchResultInAllOrderUnderABusiness(
    businessId: number,
    reservationObj: any,
    offset: string,
    limit: string,
    status?: string
  ) {
    this.isLoading = this.isLoading === false ? this.isLoading : true;
    this.orderService.getSearchResultInAllOrderUnderABusiness(
      businessId,
      reservationObj,
      offset,
      limit,
      status
    ).subscribe(
      (res: any) => {
        this.allReservation = res.body.data.orders;
        this.totalCount = res.body.data.count;

        // Set pagination on exact offset number.
        const paginatorRef: any = this.dataTable;
        paginatorRef.first = this.offset;
      },
      err => {
        this.isLoading = false;
        this.isApiSubmit = false;
        this.toastr.errorToastr(err.error.message.en);
      },
      () => {
        this.isLoading = false;
        this.isApiSubmit = false;
      }
    );
  }

  invokeOnChnagingSearchData() {
    this.reservationSearch = this.utility.deleteEmptyPropertyFromObject(
      this.reservationSearch
    );
    if (!Object.keys(this.reservationSearch).length) {
      this.clearSearchingForm();
    }
  }

  clearSearchingForm() {
    this.setPagingAtOne();
    this.reservationStatusName = this.reservationStatusName
      ? this.reservationStatusName
      : null;
    this.reservationSearch = {};
    this.setQueryParams(
      this.offset.toString(),
      this.limit.toString(),
      this.reservationStatusName,
      null
    );
  }

  private setPagingAtOne() {
    const paginatorRef: any = this.dataTable;
    this.offset = 0;
    this.limit = this.limit;
    paginatorRef.first = this.offset;
    paginatorRef.rows = this.limit;
  }

  private setQueryParams(
    queryOffset: any,
    queryLimit: any,
    queryStatus?: any,
    searchObj?: any
  ) {
    this.router.navigate(
      ["/admin/business/manage-business/" + this.businessId + "/activities"],
      {
        queryParams: {
          offset: queryOffset,
          limit: queryLimit,
          status: queryStatus,
          search: searchObj
        }
      }
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

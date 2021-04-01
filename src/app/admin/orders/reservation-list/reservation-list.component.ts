import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from "@angular/core";
import { ToastrManager } from "ng6-toastr-notifications";
import { Subscription, forkJoin } from "rxjs";
import { Router, ActivatedRoute } from "@angular/router";
import { Paginator } from "primeng/paginator";

import { CreateBusinessService } from "./../../services/create-business.service";
import { OrdersService } from "../../../shared/services/orders.service";
import { Orders, ReservationSearch } from "../../../shared/models/orders.model";
import { CommonType } from "../../../shared/models/common.model";
import { UtilityService } from '../../../shared/services/utility.service';

@Component({
  selector: "app-reservation-list",
  templateUrl: "./reservation-list.component.html"
})
export class ReservationListComponent implements OnInit, OnDestroy {
  @ViewChild("paginator", { static: false }) dataTable: ElementRef<Paginator>;
  private subscription: Subscription;
  public allReservation: Orders[] = [];
  reservationStatus: CommonType[];
  reservationSearch: any = {};
  isLoading: boolean;
  isApiSubmit: boolean;

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
  typeForFilter: any = 1;
  // for business type
  businessTypeList: CommonType[] = [];
  businessType: CommonType = new CommonType();
  // User type
  userType: string;
  businessId: number = 0;
  reservationStatusName: string;

  constructor(
    private orderService: OrdersService,
    private toastr: ToastrManager,
    private businessService: CreateBusinessService,
    private router: Router,
    private route: ActivatedRoute,
    private utility: UtilityService,

  ) {
    this.isLoading = true;
    this.isApiSubmit = false;
  }

  ngOnInit() {
    this.getBusinessTypes();
    this.subscription = this.route.queryParams.subscribe(params => {
      this.offset = +params["offset"] || 0;
      this.limit = +params["limit"] || 10;
      this.status = params['status'] || null;
      this.search = params['search'] || null;

      // Decode search object
      if (this.search) {
        this.reservationSearch = JSON.parse(atob(this.search));
      } else {
        this.reservationSearch = {};
      }

      this.reservationStatusName = this.status ? this.status : null;
      if (Object.keys(this.reservationSearch).length) {
        this.getSearchResultOfAllOrders(this.reservationSearch, this.offset.toString(), this.limit.toString(), this.reservationStatusName);
      } else {
        this.getSearchResultOfAllOrders(this.reservationSearch, this.offset.toString(), this.limit.toString(), this.reservationStatusName);
      }
    });
  }

  public filterReservationOnStatusChange(statusId: number) {
    this.isLoading = false;
    this.setPagingAtOne();
    this.reservationStatusName = this.getReservationStatusNameById(this.statusForFilter);

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

  private getBusinessTypes() {
    this.subscription = this.businessService.getBusinessType().subscribe(
      (res: any) => {
        this.businessTypeList = res.body.data.types;
        this.businessTypeList.forEach(value => {
          value.name = value.name.charAt(0).toUpperCase() + value.name.slice(1);
        });
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  getSearchResultOfAllOrders(searchObj: any, offset: string, limit: string, status?: string) {
    this.isLoading = this.isLoading === false ? this.isLoading : true;
    forkJoin([this.orderService
      .getSearchResultOfAllOrders(
        searchObj,
        offset,
        limit,
        status
      ), this.orderService.getOrdersStatus()]).subscribe(
      (res: any) => {
        this.allReservation = res[0].body.data.orders;
        this.totalCount = res[0].body.data.count;
        this.reservationStatus = res[1].body.data.orderStatuses;

        if (this.reservationStatusName) {
          this.setStatusIdByName();
        }
        // Set pagination on exact offset number.
        let paginatorRef: any = this.dataTable;
        paginatorRef.first = this.offset;
        paginatorRef.rows = this.limit;

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

  // Reservation Form search

  reservationSearchForm() {
    this.reservationSearch = this.utility.deleteEmptyPropertyFromObject(
      this.reservationSearch
    );

    if (Object.keys(this.reservationSearch).length) {
      this.setPagingAtOne();
      this.isApiSubmit = true;
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


  invokeOnChnagingSearchData() {
    this.reservationSearch = this.utility.deleteEmptyPropertyFromObject(this.reservationSearch);
    if (!Object.keys(this.reservationSearch).length) {
      this.clearSearchingForm();
    }
  }

  clearSearchingForm() {
    this.setPagingAtOne();
    this.reservationStatusName = this.reservationStatusName ? this.reservationStatusName : null;
    this.reservationSearch = {} ;
    this.setQueryParams(this.offset.toString(), this.limit.toString(), this.reservationStatusName, null);
  }

  private setStatusIdByName() {
    if (this.reservationStatusName) {
      this.statusForFilter = this.getReservationStatusIdByName(this.reservationStatusName);
    }
  }

  private  setQueryParams(
    queryOffset: any,
    queryLimit: any,
    queryStatus?: any,
    searchObj?: any
  ) {
    this.router.navigate(["/admin/orders/reservation"], {
      queryParams: {
        offset: queryOffset,
        limit: queryLimit,
        status: queryStatus,
        search: searchObj
      }
    });
  }

  private setPagingAtOne() {
    const paginatorRef: any = this.dataTable;
    this.offset = 0;
    this.limit = this.limit;
    paginatorRef.first = this.offset;
    paginatorRef.rows = this.limit;
  }

  private getReservationStatusIdByName(name: string) {
    let reservationStatusId = 0;
    if (name) {
      reservationStatusId = this.reservationStatus.find(item => {
        return item.name == name;
      }).id;
    }
    return reservationStatusId;
  }

  private getReservationStatusNameById(selectedStatusId: number) {
    let reservationStatus = null;
    if (selectedStatusId !== 0) {
      reservationStatus = this.reservationStatus.find(item => {
        return item.id == selectedStatusId;
      }).name;
    }
    return reservationStatus;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

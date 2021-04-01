import { AppConstants } from "./../../../shared/constants/app-constants";
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastrManager } from "ng6-toastr-notifications";
import { Subscription } from "rxjs";
import { NgForm } from "@angular/forms";

declare var jQuery: any;

import { CreateBusinessService } from "./../../services/create-business.service";
import {
  Business,
  BusinessStatuses,
  BusinessSalesUser
} from "../../models/business.model";
import { SharedDataService } from "../../../shared/services/shared-data.service";
import { UserModel } from "../../../user/models/user.model";
import { UtilityService } from "../../../shared/services/utility.service";
import { Paginator } from "primeng/paginator";

@Component({
  selector: "app-create-business",
  templateUrl: "./create-business.component.html"
})
export class CreateBusinessComponent implements OnInit, OnDestroy {
  @ViewChild("paginator", { static: false }) dataTable: ElementRef<Paginator>;
  @ViewChild("AssignSalesUserModal", { static: false })
  AssignSalesUserModal: ElementRef;

  private subscription: Subscription;
  isLoading: boolean = true;
  isApiSubmitForSalesUser: boolean = false;
  isLoadingSalesUser: boolean = false;
  allBusinesses: Business[];
  particularBusinessToAssignSalesUser: Business = new Business();
  businessStatuses: BusinessStatuses[];
  salesUsers: UserModel[] = [];
  isApiSubmit: boolean;
  searchBusinessCopied: any[] = [];
  businessSalesUser: BusinessSalesUser = new BusinessSalesUser();

  statusOfBusiness: {};
  businessModel: any = {};

  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;
  status: any = null;
  search: any = null;

  // Sales User
  salesUserOffset: number = 0;
  salesUserLimit: number = 10;
  salesUserTotalCount: number;
  salesUserItemPerPage: number = 10;
  salesUserPageLink: number = 5;
  salesUserType: string = "SALES";
  salesUserStatus: string = "ACTIVE";

  // for filter table data based on status
  statusForFilter: number = 0;
  businessStatusName: string;
  defaultSelectedStatus: string = "PENDING";
  assignedSales: string[] = [];

  // model for searching business
  businessSearchModel: any = {};

  selectedSales: any = [];
  businessID: number;
  salesUserIds: number[] = [];
  internalUser: UserModel = new UserModel();

  constructor(
    private businessService: CreateBusinessService,
    private toastr: ToastrManager,
    private sharedData: SharedDataService,
    private route: ActivatedRoute,
    private router: Router,
    private utility: UtilityService
  ) {
    this.isApiSubmit = false;
    this.isApiSubmitForSalesUser = false;
    this.getBusinessStatus();
  }

  ngOnInit() {
    this.internalUser = this.utility.getUserPayload();

    this.subscription = this.route.queryParams.subscribe(params => {
      this.offset = +params["offset"] || 0;
      this.limit = +params["limit"] || 10;
      this.itemPerPage = +params["limit"] || 10;
      this.status = params["status"] || null;
      this.search = params["search"] || null;

      // Decode search object
      if (this.search) {
        this.businessSearchModel = JSON.parse(atob(this.search));
      }

      this.businessStatusName = this.status ? this.status : null;

      if (Object.keys(this.businessSearchModel).length) {
        this.getSearchedData(
          this.businessSearchModel,
          this.offset,
          this.limit,
          this.businessStatusName
        );
      } else {
        this.getBusiness(
          this.offset.toString(),
          this.limit.toString(),
          this.businessStatusName,
          this.isLoading
        );
      }
    });
  }

  setStatusIdByName() {
    if (this.businessStatusName) {
      this.statusForFilter = this.getBusinessStatusIdByName(
        this.businessStatusName
      );
    }
  }

  setQueryParams(
    queryOffset: any,
    queryLimit: any,
    queryStatus?: any,
    searchObj?: any
  ) {
    this.router.navigate(["/admin/sales/create-business"], {
      queryParams: {
        offset: queryOffset,
        limit: queryLimit,
        status: queryStatus,
        search: searchObj
      }
    });
  }

  statusChangesAction(statusId: any, business: any) {
    let businessStatus = this.businessStatuses.find(item => {
      return item.id === parseInt(statusId);
    }).name;

    if (businessStatus) {
      this.businessModel.businessStatus = businessStatus;
      this.businessService
        .updateBusinessEntity(this.businessModel, business.id)
        .subscribe(
          (res: any) => {
            business.businessStatus.name = businessStatus;
            this.toastr.successToastr(res.body.message.en);
          },
          err => {
            business.businessStatus.name = business.businessStatus.name;
            this.toastr.errorToastr(err.error.message.en);
          }
        );
    }
  }

  getBusinessStatusNameById(selectedStatusId: number) {
    let businessStatus = null;
    if (selectedStatusId !== 0) {
      businessStatus = this.businessStatuses.find(item => {
        return item.id == selectedStatusId;
      }).name;
    }
    return businessStatus;
  }

  getBusinessStatusIdByName(name: string) {
    let businessStatusId = 0;
    if (name) {
      businessStatusId = this.businessStatuses.find(item => {
        return item.name == name;
      }).id;
    }
    return businessStatusId;
  }

  filterBusinessOnStatusChange(statusId: number) {
    this.isLoading = false;
    this.setPagingAtOne();

    this.businessStatusName = this.getBusinessStatusNameById(
      this.statusForFilter
    );

    if (Object.keys(this.businessSearchModel).length) {
      this.setQueryParams(
        this.offset,
        this.limit,
        this.businessStatusName,
        btoa(JSON.stringify(this.businessSearchModel))
      );
    } else {
      this.setQueryParams(
        this.offset,
        this.limit,
        this.businessStatusName,
        null
      );
    }
  }

  getBusiness(
    offset: string,
    limit: string,
    status?: string,
    loading?: boolean
  ) {
    this.isLoading = loading === false ? loading : true;
    this.subscription = this.businessService
      .getBusinesses(offset, limit, status)
      .subscribe(
        (res: any) => {
          this.allBusinesses = res.body.data.businesses;
          this.allBusinesses.forEach(value => {
            value.businessType.name = this.sharedData.capitalizeFirstLetter(
              value.businessType.name
            );
          });

          if (this.businessStatusName) {
            this.setStatusIdByName();
          }

          this.totalCount = res.body.data.count;
          // Set pagination on exact offset number when come from back button.
          let paginatorRef: any = this.dataTable;
          paginatorRef.first = offset;
        },
        err => {
          this.isLoading = false;
          this.isApiSubmit = false;
          this.toastr.errorToastr(err.error.message.en);
        },
        () => {
          this.isApiSubmit = false;
          this.isLoading = false;
        }
      );
  }

  getBusinessStatus() {
    this.subscription = this.businessService.getBusinessesStatus().subscribe(
      (res: any) => {
        this.businessStatuses = res.body.data.businessStatuses;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  getInternalUsers(
    offset: string,
    limit: string,
    status?: string,
    type?: string,
    loading?: boolean
  ) {
    this.isLoadingSalesUser = loading === false ? loading : true;
    this.businessService
      .getInternalUsers(offset.toString(), limit.toString(), status, type)
      .subscribe(
        (res: any) => {
          this.salesUsers = res.body.data.users;
          // If user checked earlier then set checkbox true
          if (this.businessSalesUser.salesUserIds.length > 0) {
            this.salesUsers.forEach(item => {
              let idsIndex = this.businessSalesUser.salesUserIds.indexOf(
                item.id
              );
              if (idsIndex !== -1) {
                item.checked = true;
              }
            });
          }
          this.salesUserTotalCount = res.body.data.count;
        },
        err => {
          this.isLoadingSalesUser = false;
          this.toastr.errorToastr(err.error.message.en);
        },
        () => {
          this.isLoadingSalesUser = false;
        }
      );
  }

  invokeOnChnagingSearchData() {
    this.businessSearchModel = this.utility.deleteEmptyPropertyFromObject(
      this.businessSearchModel
    );
    if (!Object.keys(this.businessSearchModel).length) {
      this.clearSearchingForm();
    }
  }

  paginate(event) {
    this.isLoading = false;
    this.offset = event.first;
    this.limit = event.rows;

    if (Object.keys(this.businessSearchModel).length) {
      this.setQueryParams(
        this.offset,
        this.limit,
        this.businessStatusName,
        btoa(JSON.stringify(this.businessSearchModel))
      );
    } else {
      this.setQueryParams(
        this.offset.toString(),
        this.limit.toString(),
        this.businessStatusName
      );
    }
  }

  paginateSalesUser(event) {
    this.salesUserOffset = event.first;
    this.salesUserLimit = event.rows;
    this.getInternalUsers(
      this.salesUserOffset.toString(),
      this.salesUserLimit.toString(),
      this.salesUserStatus,
      this.salesUserType,
      false
    );
  }

  getSearchedData(
    searchModel: any,
    offset: any,
    limit: any,
    businessStatusName?: string
  ) {
    this.businessService
      .searchBusiness(
        searchModel,
        offset.toString(),
        limit.toString(),
        businessStatusName
      )
      .subscribe(
        (res: any) => {
          this.allBusinesses = res.body.data.businesses;
          this.allBusinesses.forEach(value => {
            value.businessType.name = this.sharedData.capitalizeFirstLetter(
              value.businessType.name
            );
          });
          this.totalCount = res.body.data.count;

          if (this.businessStatusName) {
            this.setStatusIdByName();
          }

          // Set pagination on exact offset number.
          let paginatorRef: any = this.dataTable;
          paginatorRef.first = offset;
          paginatorRef.rows = limit;

          if (!this.allBusinesses.length && offset > 0) {
            this.setPagingAtOne();
            if (Object.keys(this.businessSearchModel).length) {
              this.setQueryParams(
                this.offset,
                this.limit,
                this.businessStatusName,
                btoa(JSON.stringify(this.businessSearchModel))
              );
            }
          }
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

  setPagingAtOne() {
    let paginatorRef: any = this.dataTable;
    this.offset = 0;
    this.limit = this.limit;
    paginatorRef.first = this.offset;
    paginatorRef.rows = this.limit;
  }

  searchBusiness() {
    this.businessSearchModel = this.utility.deleteEmptyPropertyFromObject(
      this.businessSearchModel
    );

    if (Object.keys(this.businessSearchModel).length) {
      this.setPagingAtOne();
      this.isApiSubmit = true;
      this.setQueryParams(
        this.offset.toString(),
        this.limit.toString(),
        this.businessStatusName,
        btoa(JSON.stringify(this.businessSearchModel))
      );
    } else {
      this.toastr.errorToastr("Please enter data to search");
    }
  }

  clearSearchingForm(businessSearchForm?: NgForm) {
    this.setPagingAtOne();
    this.businessStatusName = this.businessStatusName
      ? this.businessStatusName
      : null;
    this.businessSearchModel = {};
    this.setQueryParams(
      this.offset.toString(),
      this.limit.toString(),
      this.businessStatusName,
      null
    );
  }

  showSalesUserIntoModal(business: Business) {
    this.businessSalesUser.salesUserIds = [];
    this.businessID = business.id;
    this.particularBusinessToAssignSalesUser = business;
    this.particularBusinessToAssignSalesUser.assignedSalesUsers = business.assignedSalesUsers
      ? business.assignedSalesUsers
      : [];
    if (this.particularBusinessToAssignSalesUser.assignedSalesUsers.length) {
      this.particularBusinessToAssignSalesUser.assignedSalesUsers.forEach(
        item => {
          this.businessSalesUser.salesUserIds.push(item.id);
        }
      );
    }

    this.getInternalUsers(
      this.salesUserOffset.toString(),
      this.salesUserLimit.toString(),
      this.salesUserStatus,
      this.salesUserType
    );
    jQuery(this.AssignSalesUserModal.nativeElement).modal("show");
  }

  setSingleSalesUserChecked(value: any, salesUserID: number) {
    if (value.target.checked) {
      if (this.businessSalesUser.salesUserIds.length < 2) {
        this.businessSalesUser.salesUserIds.push(salesUserID);
      } else {
        value.target.checked = false;
        this.toastr.errorToastr("Can't assign more than two user.");
      }
    } else {
      const index = this.businessSalesUser.salesUserIds.indexOf(salesUserID);
      if (index !== -1) {
        this.businessSalesUser.salesUserIds.splice(index, 1);
      }
    }
  }

  assignToSalesUsers() {
    this.isApiSubmitForSalesUser = true;
    this.businessService
      .updateAssignedSalesPersonel(this.businessID, this.businessSalesUser)
      .subscribe(
        (res: any) => {
          this.toastr.successToastr(res.body.message.en);
        },
        err => {
          this.isApiSubmitForSalesUser = false;
          this.toastr.errorToastr(err.error.message.en);
          jQuery(this.AssignSalesUserModal.nativeElement).modal("hide");
        },
        () => {
          this.isApiSubmitForSalesUser = false;
          jQuery(this.AssignSalesUserModal.nativeElement).modal("hide");
          if (Object.keys(this.businessSearchModel).length) {
            this.getSearchedData(
              this.businessSearchModel,
              this.offset,
              this.limit,
              this.businessStatusName
            );
          } else {
            this.getBusiness(this.offset.toString(), this.limit.toString(), this.businessStatusName);
          }
        }
      );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from "@angular/core";
import { Paginator } from "primeng/paginator";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastrManager } from "ng6-toastr-notifications";

import { AppConstants } from "./../../../shared/constants/app-constants";
import { CreateBusinessService } from "./../../services/create-business.service";
import {
  Business,
  BusinessStatuses,
  BusinessSearch
} from "../../models/business.model";
import { SharedDataService } from "../../../shared/services/shared-data.service";
import { NgForm } from "@angular/forms";

@Component({
  selector: "app-business-info",
  templateUrl: "./business-info.component.html",
  styles: []
})
export class BusinessInfoComponent implements OnInit {
  @ViewChild("paginator", { static: false }) dataTable: ElementRef<Paginator>;
  businessGridLists: Business[];
  businessStatuses: BusinessStatuses[];
  businessStatus: any = {};
  statusOfBusiness: {};
  businessModel: any = {};
  isLoading: boolean = false;
  // for filter table data based on status
  statusForFilter: any = 2;
  defaultSelectedStatus: string = "APPROVED";

  // model for searching business
  businessSearchModel: BusinessSearch = new BusinessSearch();
  isApiSubmit: boolean;
  // paginator variable
  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

  constructor(
    private businessService: CreateBusinessService,
    private toastr: ToastrManager,
    private sharedData: SharedDataService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.offset = +params["offset"] || 0;
      this.limit = +params["limit"] || 10;
    });
    this.getBusiness(
      this.offset.toString(),
      this.limit.toString(),
      this.defaultSelectedStatus
    );
    this.getBusinessStatus();
  }

  public getBusiness(offset: string, limit: string, status?: string) {
    this.isLoading = true;
    this.businessService.getBusinesses(offset, limit, status).subscribe(
      (res: any) => {
        this.businessGridLists = res.body.data.businesses;
        this.businessGridLists.forEach(item => {
          item.businessType.name = this.sharedData.capitalizeFirstLetter(
            item.businessType.name
          );
        });
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

  statusChangesAction(statusId, business: any) {
    let businessStatus = this.businessStatuses.find(item => {
      return item.id == parseInt(statusId);
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

  public getBusinessStatus() {
    this.businessService.getBusinessesStatus().subscribe(
      (res: any) => {
        this.businessStatuses = res.body.data.businessStatuses;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  public filterBusinessOnStatusChange(statusId: number) {
    this.statusForFilter = statusId;
    let businessStatus;
    if (statusId != 0) {
      businessStatus = this.businessStatuses.find(item => {
        return item.id == statusId;
      }).name;
    }

    this.getBusiness(
      this.offset.toString(),
      this.limit.toString(),
      businessStatus
    );
  }

  public paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.router.navigate(["/admin/business"], {
      queryParams: { offset: this.offset, limit: this.limit }
    });
    let businessStatus;
    if (this.statusForFilter != 0) {
      businessStatus = this.businessStatuses.find(item => {
        return item.id == this.statusForFilter;
      }).name;
    }
    this.getBusiness(
      this.offset.toString(),
      this.limit.toString(),
      businessStatus
    );
  }

  public searchBusiness(businessInfoSearch: NgForm) {
    if (businessInfoSearch) {
      this.isApiSubmit = true;
      this.businessService
        .searchBusiness(
          this.businessSearchModel,
          this.offset.toString(),
          this.limit.toString()
        )
        .subscribe(
          (res: any) => {
            this.businessGridLists = res.body.data.businesses;
            this.businessGridLists.forEach(value => {
              value.businessType.name = this.sharedData.capitalizeFirstLetter(
                value.businessType.name
              );
            });
            this.totalCount = res.body.data.count;
            this.isApiSubmit = false;
          },
          err => {
            this.toastr.errorToastr(err.error.message.en);
            this.isApiSubmit = false;
          },
          () => {
            this.isApiSubmit = false;
          }
        );
    } else {
      this.toastr.errorToastr("Please enter data to search");
    }
  }

  searchReset(businessInfoSearch: NgForm) {
    businessInfoSearch.reset();
    this.getBusiness(this.offset.toString(), this.limit.toString());
  }
}

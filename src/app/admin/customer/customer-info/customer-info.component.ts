import { UtilityService } from "./../../../shared/services/utility.service";
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
import { NgForm } from "@angular/forms";

import { CustomerService } from "./../../services/customer.service";
import {
  UserModel,
  UserStatus,
  UserSearch
} from "../../../user/models/user.model";
import { AuthService } from "../../../user/services/auth.service";

@Component({
  selector: "app-customer-info",
  templateUrl: "./customer-info.component.html",
  styles: []
})
export class CustomerInfoComponent implements OnInit {
  @ViewChild("paginator", { static: false }) dataTable: ElementRef<Paginator>;
  customers: UserModel[];
  customerStatuses: UserStatus[];
  customerSearch: UserSearch = new UserSearch();
  isLoading: boolean;
  statusOfBusiness: {};
  businessModel: any = {};
  isApiSubmit: boolean;

  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

  statusForFilter: any = 0;
  emailFilterId: any = 0;
  phoneFilterId: any = 0;

  customerStatus: string = null;
  emailVerified: string;
  phoneVerified: string;

  emailFilteringList: any[] = [];
  phoneFilteringList: any[] = [];

  constructor(
    private customerService: CustomerService,
    private toastr: ToastrManager,
    private utilityService: UtilityService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.isApiSubmit = false;
  }

  ngOnInit() {
    this.phoneVerified = 'true';
    this.emailFilteringList = [
      { id: 1, name: "Verified Email" },
      { id: 2, name: "Unverified Email" }
    ];

    this.phoneFilteringList = [
      { id: 1, name: "Verified Phone" },
      { id: 2, name: "Unverified Phone" }
    ];

    this.route.queryParams.subscribe(params => {
      this.offset = +params["offset"] || 0;
      this.limit = +params["limit"] || 10;
    });
    this.getCustomer(this.offset.toString(), this.limit.toString(), this.customerStatus, true, this.phoneVerified);
    this.getAllCutomerStatus();
  }

  getCustomer(
    offset: string,
    limit: string,
    status?: string,
    loading?: boolean,
    phoneVerified?: string
  ) {
    this.isLoading = loading == false ? loading : true;
    this.customerService
      .getCustomer(offset, limit, status, phoneVerified )
      .subscribe(
        (res: any) => {
          this.customers = res.body.data.users;
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

  getAllCutomerStatus() {
    this.authService.getUsersStatus().subscribe(
      (res: any) => {
        this.customerStatuses = res.body.data.statuses;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  statusChangesAction(statusId, customer: any) {
    let userStatus = this.customerStatuses.find(item => {
      return item.id === parseInt(statusId);
    }).name;

    if (userStatus) {
      this.businessModel.userStatus = userStatus;
      this.customerService
        .updateCustomerEntity(customer.id, this.businessModel)
        .subscribe(
          (res: any) => {
            customer.userStatus.name = userStatus;
            this.toastr.successToastr(res.body.message.en);
          },
          err => {
            customer.userStatus.name = customer.userStatus.name;
            this.toastr.errorToastr(err.error.message.en);
          }
        );
    }
  }

  // filterCustomerOnPhone(phoneVerifyId: number) {
  //   this.phoneVerified =
  //     phoneVerifyId == 1 ? "true" : phoneVerifyId == 2 ? "false" : null;
  //   this.getCustomer(
  //     this.offset.toString(),
  //     this.limit.toString(),
  //     this.customerStatus,
  //     false,
  //     this.phoneVerified
  //   );
  // }

  // filterCustomerOnEmail(emailVerifyId: number) {
  //   this.emailVerified =
  //     emailVerifyId == 1 ? "true" : emailVerifyId == 2 ? "false" : null;
  //   this.getCustomer(
  //     this.offset.toString(),
  //     this.limit.toString(),
  //     this.customerStatus,
  //     false,
  //     this.phoneVerified
  //   );
  // }

  filterCustomerOnStatusChange(statusId: number) {
    this.statusForFilter = statusId;
    if (statusId != 0) {
      this.customerStatus = this.customerStatuses.find(item => {
        return item.id == statusId;
      }).name;
    } else {
      this.customerStatus = null;
    }
    this.getCustomer(
      this.offset.toString(),
      this.limit.toString(),
      this.customerStatus,
      false,
      this.phoneVerified
    );
  }

  searchCustomer(searchValue: NgForm) {
    if (searchValue) {
      this.isApiSubmit = true;
      this.customerSearch = this.utilityService.deleteEmptyPropertyFromObject(
        this.customerSearch
      );
      this.customerService
        .searchCustomer(
          this.customerSearch,
          this.offset.toString(),
          this.limit.toString()
        )
        .subscribe(
          (res: any) => {
            this.customers = res.body.data.users;
            this.totalCount = res.body.data.count;
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

  resetSearch(reset: NgForm) {
    reset.reset();
    this.getCustomer(this.offset.toString(), this.limit.toString(), this.customerStatus, false, this.phoneVerified);
  }

  paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.router.navigate(["/admin/customer"], {
      queryParams: { offset: this.offset, limit: this.limit }
    });

    this.getCustomer(
      this.offset.toString(),
      this.limit.toString(),
      this.customerStatus,
      false,
      this.phoneVerified
    );
  }

  public customerDetails(customeId: number) {
    this.router.navigate(["/admin/customer", customeId]);
  }
}

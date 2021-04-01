import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from "@angular/core";
import { Paginator } from "primeng/paginator";
import { ToastrManager } from "ng6-toastr-notifications";
import { Router, ActivatedRoute } from "@angular/router";
import { NgForm } from "@angular/forms";

import { UtilityService } from "./../../../shared/services/utility.service";
import { UserModel } from "./../../../user/models/user.model";
import { AuthService } from "./../../../user/services/auth.service";
import {
  UserType,
  UserStatus,
  UserSearch
} from "src/app/user/models/user.model";

@Component({
  selector: "app-manage-user",
  templateUrl: "./manage-user.component.html"
})
export class ManageUserComponent implements OnInit {
  @ViewChild("paginator", { static: false }) dataTable: ElementRef<Paginator>;
  isVisibleUserdModal: boolean = false;
  isLoading: boolean = false;
  userTypes: UserType[];
  userStatus: UserStatus[];
  allInternalUsers: any[];
  userSearch: UserSearch = new UserSearch();
  usersModel: any = {};
  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;
  isApiSubmit: boolean;

  statusForFilter: any = 0 ;
  userTypeForFilter: any = 0;
  userTypeName: string;

  usersStatus: string;
  usersType: string;

  superAdmin = {
    id: 3,
    name: "SUPER_ADMIN"
  };
  constructor(
    private authService: AuthService,
    private toastr: ToastrManager,
    private route: ActivatedRoute,
    private router: Router,
    private utility: UtilityService
  ) {
    this.isApiSubmit = false;
  }

  ngOnInit() {
    let user: UserModel = this.utility.getUserPayload();
    this.userTypeName = user.userType.name;
    this.route.queryParams.subscribe(params => {
      this.offset = +params["offset"] || 0;
      this.limit = +params["limit"] || 10;
    });
    this.getInternalUser(this.offset.toString(), this.limit.toString());
    this.getUsersStatus();
    this.getInternalUserTypes();
  }

  getInternalUser( offset: string,  limit: string, status?: string, type?: string,  loading?: boolean ) {
    this.isLoading = loading === false ? loading : true;
    this.authService.getInternalUsers(offset, limit, status, type).subscribe(
      (res: any) => {
        this.allInternalUsers = res.body.data.users;
        this.totalCount = res.body.data.count;
        if (status) {
          this.userTypeForFilter = 0;
        } else if (type) {
          this.statusForFilter = 0;
        }
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
  /**
   * Get Users Status
   */
  getUsersStatus() {
    this.authService.getUsersStatus().subscribe(
      (res: any) => {
        this.userStatus = res.body.data.statuses;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  /**
   * Get Internal User Types
   */
  getInternalUserTypes() {
    this.authService.getInternalsUserTypes().subscribe(
      res => {
        this.userTypes = res.body.data.userTypes;
        this.userTypes.push(this.superAdmin);
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  changesInternalUserStatusAction(statusId, user: any) {
    let userStatus = this.userStatus.find(item => {
      return item.id == parseInt(statusId);
    }).name;

    if (userStatus) {
      this.usersModel.userStatus = userStatus;
      this.authService.updateUserEntity(this.usersModel, user.id).subscribe(
        (res: any) => {
          user.userStatus.name = userStatus;
          this.toastr.successToastr(res.body.message.en);
        },
        err => {
          user.userStatus.name = user.userStatus.name;
          this.toastr.errorToastr(err.error.message.en);
        }
      );
    }
  }



  filterUserOnUserTypeChange(userTypesName: any) {
    this.userTypeForFilter = userTypesName;
    if (userTypesName != 0) {
      this.usersType = this.userTypes.find(item => {
        return item.name == userTypesName;
      }).name;
    }
    this.getInternalUser( this.offset.toString(), this.limit.toString(), this.usersStatus,  this.usersType, false);
  }

  /**
   * filter User On Status Change
   * @param statusId
   */
  filterUserOnStatusChange(statusId: number) {
    this.statusForFilter = statusId;
    if (statusId != 0) {
      this.usersStatus = this.userStatus.find(item => {
        return item.id == statusId;
      }).name;
    }

    this.getInternalUser(
      this.offset.toString(),
      this.limit.toString(),
      this.usersStatus,
      this.usersType,
      false
    );
  }




  paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.router.navigate(["/admin/manage-user/user"], {
      queryParams: { offset: this.offset, limit: this.limit }
    });
    if (this.statusForFilter != 0) {
      this.usersStatus = this.userStatus.find(item => {
        return item.id == this.statusForFilter;
      }).name;
    }
    if (this.userTypeForFilter != 0) {
      this.usersType = this.userTypes.find(item => {
        return item.name == this.userTypeForFilter;
      }).name;
    }
    this.getInternalUser(
      this.offset.toString(),
      this.limit.toString(),
      this.usersStatus,
      this.usersType,
      false
    );
  }

  editInternalUser(userId: number) {
    this.router.navigate(["/admin/manage-user/user", userId]);
  }

  searchUser(searchValue: NgForm) {
    if (searchValue) {
      this.isApiSubmit = true;
      this.userSearch = this.utility.deleteEmptyPropertyFromObject(
        this.userSearch
      );
      this.authService
        .searchInternalslUser(
          this.userSearch,
          this.offset.toString(),
          this.limit.toString()
        )
        .subscribe(
          (res: any) => {
            this.allInternalUsers = res.body.data.users;
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

  resetSearch(reset: NgForm) {
    reset.reset();
    this.getInternalUser(this.offset.toString(), this.limit.toString());
  }
}

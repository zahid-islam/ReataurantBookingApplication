import { UtilityService } from "./../../../shared/services/utility.service";
import { Paginator } from "primeng/paginator";
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription, forkJoin } from "rxjs";
import { ToastrManager } from "ng6-toastr-notifications";
import { NgForm } from "@angular/forms";

import { CustomerService } from "./../../services/customer.service";
import { UserModel, UserSearch } from "../../../user/models/user.model";
import { MarketingNotification } from "../../../shared/models/marketing.model";
import { MarketingService } from "../../../shared/services/marketing.service";

@Component({
  selector: "app-marketing-list",
  templateUrl: "./marketing-list.component.html"
})
export class MarketingListComponent implements OnInit, OnDestroy {
  @ViewChild("paginator", { static: false }) dataTable: ElementRef<Paginator>;
  private subscription: Subscription;
  isLoading: boolean;
  checkedAll: boolean;
  endUsers: UserModel[];
  notification: MarketingNotification = new MarketingNotification();
  customerSearch: any = {};
  notificationID: number;

  // For button action
  isActiveNotification: boolean;
  isActivepSMS: boolean;
  isActiveEmail: boolean;
  isApiSubmit: boolean;

  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

  // Variable declaration for csv
  fileData: File = null;
  fileName: string = "";
  csvResult: any;
  uploadedIds: any;
  fileUpload: any;
  fileUploadProgressBar: boolean;

  constructor(
    private toastr: ToastrManager,
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute,
    private marketingService: MarketingService,
    private utility: UtilityService
  ) {
    this.isLoading = false;
    this.checkedAll = false;
    this.isApiSubmit = false;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.offset = +params["offset"] || 0;
      this.limit = +params["limit"] || 10;
    });
    this.route.params.subscribe(params => {
      this.notificationID = +params["ntfId"];
      if (this.notificationID) {
        this.getRecipients();
      } else {
        this.getCustomer(this.offset.toString(), this.limit.toString());
      }
    });
  }

  private getCustomer(offset: string, limit: string, loading?: boolean) {
    this.isLoading = loading == false ? loading : true;
    this.customerService.getCustomer(offset, limit, null, 'true').subscribe(
      (res: any) => {
        this.endUsers = res.body.data.users;
        //If user checked earlier then set checkbox true
        if (this.notification.userIds.length > 0) {
          this.endUsers.forEach(item => {
            let idsIndex = this.notification.userIds.indexOf(item.id);
            if (idsIndex != -1) {
              item.checked = true;
            }
          });
        }
        //If clicked on all chcked input then set all check box true
        this.setAllCheckedControlTrueOrFalse();
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

  getRecipients() {
    forkJoin([
      this.customerService.getCustomer(
        this.offset.toString(),
        this.limit.toString(),
        null,
        'true'
      ),
      this.marketingService.getUsersIdsAssociatedWithAPublicNotificationId(
        this.notificationID
      )
    ]).subscribe(
      (res: any) => {
        this.notification.userIds = res[1].body.data.userIds;
        this.endUsers = res[0].body.data.users;
        //If user checked earlier then set checkbox true
        if (this.notification.userIds.length > 0) {
          this.endUsers.forEach(item => {
            let idsIndex = this.notification.userIds.indexOf(item.id);
            if (idsIndex != -1) {
              item.checked = true;
            }
          });
        }
        //If clicked on all chcked input then set all check box true
        this.setAllCheckedControlTrueOrFalse();
        this.totalCount = res[0].body.data.count;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  stateChangeAction() {
    if (this.notificationID) {
      this.router.navigate(
        [
          "/admin/marketing/notifications/notifications-list/notifications-update/",
          this.notificationID
        ],
        { state: { data: this.notification.userIds } }
      );
    } else {
      this.router.navigate(
        [
          "/admin/marketing/notifications/notifications-list/notifications-create"
        ],
        { state: { data: this.notification.userIds } }
      );
    }
  }

  paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.router.navigate(
      ["/admin/marketing/notifications/notifications-list"],
      {
        queryParams: { offset: this.offset, limit: this.limit }
      }
    );
    if (Object.keys(this.customerSearch).length) {
      this.getSearchedData();
    } else {
      this.getCustomer(this.offset.toString(), this.limit.toString(), false);
    }
  }

  getSearchedData() {
    this.customerService
      .searchCustomer(
        this.customerSearch,
        this.offset.toString(),
        this.limit.toString()
      )
      .subscribe(
        (res: any) => {
          this.endUsers = res.body.data.users;
          this.totalCount = res.body.data.count;
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
  }

  setSingleCustomerChecked(value: any, customerId: number) {
    if (value.target.checked) {
      this.notification.userIds.push(customerId);
      this.setAllCheckedControlTrueOrFalse();
    } else {
      let index = this.notification.userIds.indexOf(customerId);
      if (index != -1) {
        this.notification.userIds.splice(index, 1);
        this.setAllCheckedControlTrueOrFalse();
      }
    }
  }

  setAllCheckedControlTrueOrFalse() {
    let flag = 0;
    this.endUsers.forEach(item => {
      if (item.checked) {
        flag++;
      }
    });
    this.checkedAll = flag === this.endUsers.length ? true : false;
  }

  setAllCustomerChecked(value: any) {
    if (this.endUsers.length > 0) {
      if (value.target.checked) {
        this.endUsers.forEach(item => {
          item.checked = true;
          let idsIndex = this.notification.userIds.indexOf(item.id);
          if (idsIndex == -1) {
            this.notification.userIds.push(item.id);
          }
        });
      } else {
        this.endUsers.forEach(item => {
          let idsIndex = this.notification.userIds.indexOf(item.id);
          if (idsIndex != -1) {
            item.checked = false;
            this.notification.userIds.splice(idsIndex, 1);
          }
        });
      }
    }
  }

  searchCustomer() {
    if (Object.keys(this.customerSearch).length) {
      let paginatorRef: any = this.dataTable;
      this.offset = 0;
      this.limit = 10;
      paginatorRef.first = 0;
      paginatorRef.rows = 10;
      this.isApiSubmit = true;
      this.customerSearch = this.utility.deleteEmptyPropertyFromObject(
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
            this.endUsers = res.body.data.users;
            this.isApiSubmit = false;
            if (this.notification.userIds.length > 0) {
              this.endUsers.forEach(item => {
                let idsIndex = this.notification.userIds.indexOf(item.id);
                if (idsIndex != -1) {
                  item.checked = true;
                }
              });
              this.totalCount = res.body.data.count;
              paginatorRef.totalRecords = res.body.data.count;
            }
            // If clicked on all chcked input then set all check box true
            this.setAllCheckedControlTrueOrFalse();
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

  resetSearch(searchForm: NgForm) {
    searchForm.reset();
    this.customerSearch = {};
    this.getCustomer(this.offset.toString(), this.limit.toString());
  }

  handleFiles(event) {
    this.uploadedIds = "";
    this.fileUploadProgressBar = true;
    this.fileData = <File>event.files[0];
    this.fileName = event.files[0].name;
    const reader = new FileReader();
    reader.readAsText(this.fileData);
    reader.onload = _event => {
      this.csvResult = reader.result ? reader.result : null;
      if (!(this.csvResult == null)) {
        this.csvResult
          .replace(/[\n\r]/g, " ")
          .split(" ")
          .forEach(item => {
            if (parseInt(item)) {
              this.notification.userIds.push(Number(item));
            }
          });
      }
      if (
        this.notification.userIds.length > 0 &&
        this.notification.userIds[0]
      ) {
        this.uploadedIds = this.notification.userIds.join(", ");
        //Checked all user in user list by setting checkbox property to true.
        this.endUsers.forEach(item => {
          let idsIndex = this.notification.userIds.indexOf(item.id);
          if (idsIndex != -1) {
            item.checked = true;
          }
        });
        this.setAllCheckedControlTrueOrFalse();
        this.fileUploadProgressBar = false;
      } else {
        this.toastr.errorToastr(
          "Your CSV format is not correct, follow sample format!"
        );
        this.fileUploadProgressBar = false;
        this.notification.userIds = [];
      }
    };
  }

  downloadCSV() {
    const prefix = "data:text/csv;charset=utf-8,";
    const header = "User ID";
    let csvContent = header + "\r\n";
    csvContent += "233" + "\r\n";
    csvContent += "232" + "\r\n";
    csvContent += "231" + "\r\n";
    csvContent += "230" + "\r\n";
    csvContent += "229" + "\r\n";
    csvContent += "228" + "\r\n";
    csvContent += "227" + "\r\n";

    const encodedUri = prefix + encodeURIComponent(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "enduser.csv");
    document.body.appendChild(link);
    link.click();
  }

  ngOnDestroy() {}
}

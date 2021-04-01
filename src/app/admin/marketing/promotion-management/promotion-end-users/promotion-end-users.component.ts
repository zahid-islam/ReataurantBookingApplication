import { UtilityService } from './../../../../shared/services/utility.service';
import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription, forkJoin } from "rxjs";
import { ToastrManager } from "ng6-toastr-notifications";
import { NgForm } from "@angular/forms";
import { Paginator } from 'primeng/paginator';
declare var jQuery: any;

import { CustomerService } from "../../../services/customer.service";
import { UserModel, UserSearch } from "../../../../user/models/user.model";
import {
  CreatePromotion,
  UpdatePromotion,
  Promotions
} from "../../../../shared/models/marketing.model";
import { MarketingService } from "../../../../shared/services/marketing.service";

@Component({
  selector: "app-promotion-end-users",
  templateUrl: "./promotion-end-users.component.html",
  styles: []
})
export class PromotionEndUsersComponent implements OnInit {
  @ViewChild("ParticularPromotionView", { static: false }) ParticularPromotionView: ElementRef;;
  @ViewChild('paginator', { static: false }) dataTable: ElementRef<Paginator>;


  private subscription: Subscription;
  isLoading: boolean;
  isApiSubmit: boolean;
  checkedAll: boolean;
  endUsers: UserModel[];
  viewParticularPromotion: Promotions = new Promotions();

  promotion: CreatePromotion = new CreatePromotion();
  customerSearch: any = {};
  updatePromotion: UpdatePromotion = new UpdatePromotion();
  promotionID: number;

  uploadedIds: any;
  fileData: File = null;
  fileName: string = "";
  csvResult: any;
  fileUpload: any;
  fileUploadProgressBar: boolean;

  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

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
    this.updatePromotion.newUserIds = [];
    this.subscription = this.route.queryParams.subscribe(params => {
      this.offset = +params['offset'] || 0;
      this.limit = +params['limit'] || 10;
    });
    this.route.params.subscribe(params => {
      this.promotionID = +params["promotionID"];
      if (this.promotionID) {
        this.getCustomer(this.offset.toString(), this.limit.toString());
      } else {
        this.toastr.errorToastr(
          "Promotion id is required for Personal Promotion"
        );
      }
    });
  }

  private getCustomer(offset: string, limit: string, loading?: boolean) {
    this.isLoading = loading == false ? loading : true;
    this.customerService.getCustomer(offset, limit, null, 'true').subscribe(
      (res: any) => {
        this.endUsers = res.body.data.users;
        //If user checked earlier then set checkbox true
        if (this.updatePromotion.newUserIds.length > 0) {
          this.endUsers.forEach(item => {
            let idsIndex = this.updatePromotion.newUserIds.indexOf(item.id);
            if (idsIndex != -1) {
              item.checked = true;
            }
          });
        }
        //If clicked on all chcked input then set all check box true
        this.setAllCheckedControlTrueOrFalse();
        this.totalCount = res.body.data.count;
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

  public paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.router.navigate([`/admin/marketing/promotion/${this.promotionID}/newuser`], {
      queryParams: { offset: this.offset, limit: this.limit }
    });
    if (Object.keys(this.customerSearch).length) {
      this.getSearchedData();
    } else {
      this.getCustomer(this.offset.toString(), this.limit.toString(), false);
    }
  }

  getSearchedData() {
    this.customerService.searchCustomer(this.customerSearch, this.offset.toString(), this.limit.toString()).subscribe(
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
      this.updatePromotion.newUserIds.push(customerId);
      this.setAllCheckedControlTrueOrFalse();
    } else {
      let index = this.updatePromotion.newUserIds.indexOf(customerId);
      if (index != -1) {
        this.updatePromotion.newUserIds.splice(index, 1);
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
    this.checkedAll = flag == this.endUsers.length ? true : false;
  }

  setAllCustomerChecked(value: any) {
    if (this.endUsers.length > 0) {
      if (value.target.checked) {
        this.endUsers.forEach(item => {
          item.checked = true;
          let idsIndex = this.updatePromotion.newUserIds.indexOf(item.id);
          if (idsIndex == -1) {
            this.updatePromotion.newUserIds.push(item.id);
          }
        });
      } else {
        this.endUsers.forEach(item => {
          let idsIndex = this.updatePromotion.newUserIds.indexOf(item.id);
          if (idsIndex != -1) {
            item.checked = false;
            this.updatePromotion.newUserIds.splice(idsIndex, 1);
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
      this.customerSearch = this.utility.deleteEmptyPropertyFromObject(this.customerSearch);
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
            if (this.updatePromotion.newUserIds.length > 0 && this.updatePromotion.newUserIds[0]) {
              // Checked all user in user list by setting checkbox property to true.
              this.endUsers.forEach(item => {
                let idsIndex = this.updatePromotion.newUserIds.indexOf(item.id);
                if (idsIndex != -1) {
                  item.checked = true;
                }
              });
              this.setAllCheckedControlTrueOrFalse();
            }
            this.totalCount = res.body.data.count;
            paginatorRef.totalRecords = res.body.data.count;
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
    this.customerSearch = {};
    this.getCustomer(this.offset.toString(), this.limit.toString());
  }

  /**
   * CSV
   */

  handleFiles(event) {
    this.uploadedIds = "";
    this.fileUploadProgressBar = true;
    this.updatePromotion.newUserIds = [];
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
              this.updatePromotion.newUserIds.push(Number(item));
            }
          });
      }

      if (this.updatePromotion.newUserIds.length > 0 && this.updatePromotion.newUserIds[0]) {
        // console.log(this.updatePromotion);
        this.uploadedIds = this.updatePromotion.newUserIds.join(", ");
        //Checked all user in user list by setting checkbox property to true.
        this.endUsers.forEach(item => {
          let idsIndex = this.updatePromotion.newUserIds.indexOf(item.id);
          if (idsIndex != -1) {
            item.checked = true;
          }
        });
        this.setAllCheckedControlTrueOrFalse();
        this.fileUploadProgressBar = false;
      } else {
        this.toastr.errorToastr("Your CSV format is not correct, follow sample format!");
        this.fileUploadProgressBar = false;
        this.updatePromotion.newUserIds = [];
      }
    };
  }

  public createByContact() {
    this.getParticularPromotion(this.promotionID);
  }

  public createByCSV() {
    this.getParticularPromotion(this.promotionID);
  }

  public addEndUserToParticularPromoCode() {
    this.addNewUserToPersonalPromotion(this.promotionID, this.updatePromotion);
  }

  public tabToggle() {
    this.updatePromotion.newUserIds = [];
  }

  private addNewUserToPersonalPromotion(promotionId: number, newUserIds: any) {
    this.isApiSubmit = true;
    this.marketingService
      .addNewUserToPersonalPromotion(promotionId, newUserIds)
      .subscribe(
        (res: any) => {
          this.toastr.successToastr(res.body.message.en);
          this.router.navigate([`admin/marketing/promotion`]);
        },
        (err: any) => {
          this.isApiSubmit = false;
          jQuery(this.ParticularPromotionView.nativeElement).modal("hide");
          this.toastr.errorToastr(err.error.message.en);
        },
        () => {
          this.isApiSubmit = false;
          jQuery(this.ParticularPromotionView.nativeElement).modal("hide");
        }
      );
  }

  /**
   * Get particular promotion
   * @PromotionsId
   */
  private getParticularPromotion(promotionsID: number) {
    this.marketingService.getParticularPromotion(promotionsID).subscribe(
      (res: any) => {
        this.viewParticularPromotion = res.body.data.promotion;
        jQuery(this.ParticularPromotionView.nativeElement).modal("show");
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  // Demo CSV file
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
}

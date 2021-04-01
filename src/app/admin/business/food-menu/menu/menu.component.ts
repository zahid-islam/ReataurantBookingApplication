import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from "@angular/core";
import { Paginator } from "primeng/paginator";
import { Router, ActivatedRoute } from "@angular/router";
import { PlatformLocation } from "@angular/common";
import { Subscription } from "rxjs";
import { ToastrManager } from "ng6-toastr-notifications";

import { SharedDataService } from "./../../../../shared/services/shared-data.service";
import { CommonType } from "./../../../../shared/models/common.model";
import { FoodMenuService } from "./../foodMenuServices/food-menu.service";
import { FoodMenu } from "./../foodMenuModels/food-menu.model";
import { NgForm } from "@angular/forms";
declare var jsPDF: any;

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html"
})
export class MenuComponent implements OnInit, OnDestroy {
  @ViewChild("paginator", { static: false }) dataTable: ElementRef<Paginator>;
  private subscription: Subscription;
  isVisibleMenuModal: boolean = false;
  menuId: number;
  businessId: number;

  allFoodMenus: FoodMenu[];
  foodMenuStatuses: CommonType[];
  foodMenuModel: any = {};
  statusForFilter: any = 0;

  isLoading: boolean = false;
  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

  isApiSubmit: boolean;
  menuSearch: any = {};

  constructor(
    private menuService: FoodMenuService,
    private toastr: ToastrManager,
    private route: ActivatedRoute,
    private router: Router,
    private sharedData: SharedDataService,
    private platformLocation: PlatformLocation
  ) { }

  ngOnInit() {
    this.isApiSubmit = false;
    this.menuSearch.name = "";

    let pathIdList: number[] = [];
    const fullPath = this.platformLocation.href;
    pathIdList = this.sharedData.getFillPathIDList(fullPath);
    this.subscription = this.route.queryParams.subscribe(params => {
      this.offset = +params["offset"] || 0;
      this.limit = +params["limit"] || 10;
    });
    if (pathIdList.length == 1) {
      this.businessId = pathIdList[0];
      this.getAllFoodMenus(
        this.offset.toString(),
        this.limit.toString(),
        this.businessId
      );
    }

    this.getAllFoodMenuStatus();
  }

  getAllFoodMenus(offset: string, limit: string, businessId, status?: string) {
    this.isLoading = true;
    this.subscription = this.menuService
      .getFoodMenuUnderBusiness(offset, limit, businessId, status)
      .subscribe(
        (res: any) => {
          this.allFoodMenus = res.body.data.foodMenus;
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

  getAllFoodMenuStatus() {
    this.subscription = this.menuService.getAllFoodMenuStatus().subscribe(
      (res: any) => {
        this.foodMenuStatuses = res.body.data;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  filterFoodMenuOnStatusChange(statusId: number) {
    this.statusForFilter = statusId;
    let foodMenuStatus;
    if (statusId != 0) {
      foodMenuStatus = this.foodMenuStatuses.find(item => {
        return item.id == statusId;
      }).name;
    }

    this.getAllFoodMenus(
      this.offset.toString(),
      this.limit.toString(),
      this.businessId,
      foodMenuStatus
    );
  }

  updateOnStatusChanges(statusId, menu: any) {
    let menuStatus = this.foodMenuStatuses.find(item => {
      return item.id == statusId;
    }).name;

    if (menuStatus) {
      this.foodMenuModel.foodMenuStatus = menuStatus;
      this.menuService
        .updateFoodMenu(this.foodMenuModel, this.businessId, menu.id)
        .subscribe(
          (res: any) => {
            menu.foodMenuStatus.name = menuStatus;
            this.toastr.successToastr(res.body.message.en);
          },
          err => {
            menu.foodMenuStatus.name = menu.foodMenuStatus.name;
            this.toastr.errorToastr(err.error.message.en);
          }
        );
    }
  }

  getStatusesByFilter() {
    let foodMenuStatus;
    if (this.statusForFilter != 0) {
      foodMenuStatus = this.foodMenuStatuses.find(item => {
        return item.id == this.statusForFilter;
      }).name;
    }
    return foodMenuStatus;
  }

  paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.router.navigate(
      [`/admin/business/manage-business/${this.businessId}/food-menu`],
      {
        queryParams: { offset: this.offset, limit: this.limit }
      }
    );
    let menuStatus = this.getStatusesByFilter();

    this.getAllFoodMenus(
      this.offset.toString(),
      this.limit.toString(),
      this.businessId,
      menuStatus
    );
  }

  public closeMenuModal() {
    this.isVisibleMenuModal = false;
    this.menuId = null;
    this.getAllFoodMenus(
      this.offset.toString(),
      this.limit.toString(),
      this.businessId
    );
  }

  editMenu(menuId: number) {
    this.isVisibleMenuModal = true;
    this.menuId = menuId;
  }


  searchCustomer(searchValue: NgForm) {
    if (searchValue) {
      this.isApiSubmit = true;
      this.menuService
        .searchFoodMenuUnderBusinss(
          this.menuSearch,
          this.businessId,
          this.offset.toString(),
          this.limit.toString()
        )
        .subscribe(
          (res: any) => {
            this.allFoodMenus = res.body.data.foodMenus;
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
    this.getAllFoodMenus(
      this.offset.toString(),
      this.limit.toString(),
      this.businessId
    );
  }

  //Download pdf from this function
  convert() {
    this.isLoading = true;
    let offset = 0;
    let menuStatus = this.getStatusesByFilter();
    this.menuService
      .getFoodMenuUnderBusiness(
        offset.toString(),
        this.totalCount.toString(),
        this.businessId,
        menuStatus
      )
      .subscribe(
        (res: any) => {
          let allMenu = res.body.data.foodMenus;
          if (Array.isArray(allMenu) && allMenu.length > 0) {
            let doc = new jsPDF("l", "pt"); //oreientation, unit, formate
            doc.setFontSize(18);
            doc.text("Menu List", 350, 50);
            doc.setFontSize(8);
            doc.setTextColor(100);
            const col = [
              "SL No.",
              "Menu Category",
              "Menu Name",
              "Price",
              "About Item",
              "Status"
            ];
            const rows = [];
            let count = 0;
            allMenu.forEach(item => {
              const temp = [
                ++count,
                item.foodType ? item.foodType.name : "",
                item.itemName,
                item.price,
                item.itemDescription,
                item.foodMenuStatus ? item.foodMenuStatus.name : ""
              ];
              rows.push(temp);
            });

            doc.autoTable(col, rows,
              {
                margin: { top: 70 },
                styles: { overflow: 'linebreak' },
                columnStyles: {
                  0: { cellWidth: 50 },
                  1: { cellWidth: 150 },
                  2: { cellWidth: 150 },
                  3: { cellWidth: 100 },
                  4: { cellWidth: 'auto' },
                  5: { cellWidth: 100 }
                }
              });
            doc.save("MenuList.pdf");
          }
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

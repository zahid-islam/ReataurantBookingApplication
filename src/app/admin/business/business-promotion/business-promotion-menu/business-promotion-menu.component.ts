import { CreateBusinessService } from './../../../services/create-business.service';
import { UpdateRestaurantOffer } from './../../../models/business.model';
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
import { Subscription, forkJoin } from "rxjs";
import { ToastrManager } from "ng6-toastr-notifications";
import { NgForm } from "@angular/forms";

import { SharedDataService } from "./../../../../shared/services/shared-data.service";
import { CommonType } from "./../../../../shared/models/common.model";
import { FoodMenuService } from "../../food-menu/foodMenuServices/food-menu.service";
import { FoodMenu } from "../../food-menu/foodMenuModels/food-menu.model";

@Component({
  selector: 'app-business-promotion-menu',
  templateUrl: './business-promotion-menu.component.html',
  styles: []
})
export class BusinessPromotionMenuComponent implements OnInit, OnDestroy {
  @ViewChild("paginator", { static: false }) dataTable: ElementRef<Paginator>;
  private subscription: Subscription;
  menuId: number;
  businessId: number;
  businessPromotionId: number;

  allFoodMenus: FoodMenu[];
  isLoading: boolean;
  checkedAll: boolean;
  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

  isApiSubmit: boolean;
  menuSearch: any = {};
  existingMenuIds: number[] = [];
  newFoodMenuIds: number[] = [];

  constructor(
    private menuService: FoodMenuService,
    private toastr: ToastrManager,
    private route: ActivatedRoute,
    private router: Router,
    private sharedData: SharedDataService,
    private platformLocation: PlatformLocation,
    private businessService: CreateBusinessService,
  ) { }

  ngOnInit() {
    this.checkedAll = false;
    this.isApiSubmit = false;
    this.menuSearch.name = "";

    let pathIdList: number[] = [];
    const fullPath = this.platformLocation.href;
    pathIdList = this.sharedData.getFillPathIDList(fullPath);
    this.subscription = this.route.queryParams.subscribe(params => {
      this.offset = +params["offset"] || 0;
      this.limit = +params["limit"] || 10;
    });
    if (pathIdList.length === 2) {
      this.businessId = pathIdList[0];
      this.businessPromotionId = pathIdList[1];
      this.getParticularBusinessPromotion();
    }
  }

  getParticularBusinessPromotion() {
    this.businessService.getParticularRestaurantOffer(this.businessPromotionId).subscribe(
      (res: any) => {
        let particularRestaurantOffer = res.body.data.restaurantOffer;
        this.newFoodMenuIds = particularRestaurantOffer.foodMenuIds || [];
        this.existingMenuIds = particularRestaurantOffer.foodMenuIds.length ?
          [...particularRestaurantOffer.foodMenuIds] : [];

        this.getAllFoodMenus(
          this.offset.toString(),
          this.limit.toString(),
          this.businessId
        );
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  getAllFoodMenus(offset: string, limit: string, businessId, status?: string) {
    this.isLoading = true;
    this.subscription = this.menuService
      .getFoodMenuUnderBusiness(offset, limit, businessId, status)
      .subscribe(
        (res: any) => {
          this.allFoodMenus = res.body.data.foodMenus;

          //If user checked earlier then set checkbox true
          this.checkedMenuIfSelectedEarlier();

          //If checked all chckbox input then set all check box true
          this.setAllCheckedControlTrueOrFalse();

          this.totalCount = res.body.data.count;
          const paginatorRef: any = this.dataTable;
          paginatorRef.first = this.offset;
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

  checkedMenuIfSelectedEarlier() {
    if (this.newFoodMenuIds.length > 0) {
      this.allFoodMenus.forEach(item => {
        let idsIndex = this.newFoodMenuIds.indexOf(item.id);
        if (idsIndex !== -1) {
          item.checked = true;
        }
      });
    }
  }

  paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.getAllFoodMenus(
      this.offset.toString(),
      this.limit.toString(),
      this.businessId,
    );
  }

  setAllMenuChecked(value: any) {
    if (this.allFoodMenus.length > 0) {
      if (value.target.checked) {
        this.allFoodMenus.forEach(item => {
          item.checked = true;
          let idsIndex = this.newFoodMenuIds.indexOf(item.id);
          if (idsIndex === -1) {
            this.newFoodMenuIds.push(item.id);
          }
        });
      } else {
        this.allFoodMenus.forEach(item => {
          let idsIndex = this.newFoodMenuIds.indexOf(item.id);
          if (idsIndex !== -1) {
            item.checked = false;
            this.newFoodMenuIds.splice(idsIndex, 1);
          }
        });
      }
    }
  }

  setSingleMenuChecked(value: any, menuId: number) {
    if (value.target.checked) {
      this.newFoodMenuIds.push(menuId);
      this.setAllCheckedControlTrueOrFalse();
    } else {
      let index = this.newFoodMenuIds.indexOf(menuId);
      if (index !== -1) {
        this.newFoodMenuIds.splice(index, 1);
        this.setAllCheckedControlTrueOrFalse();
      }
    }
  }

  setAllCheckedControlTrueOrFalse() {
    let flag = 0;
    this.allFoodMenus.forEach(item => {
      if (item.checked) {
        flag++;
      }
    });
    this.checkedAll = flag === this.allFoodMenus.length ? true : false;
  }

  updateRestaurantOffer() {
    let restaurantOffer = new UpdateRestaurantOffer();

    this.newFoodMenuIds.forEach(id => {
      let idIndex = this.existingMenuIds.indexOf(id);
      if (idIndex === -1) {
        restaurantOffer.newFoodMenuIds.push(id);
      }
    });

    if (this.existingMenuIds.length) {
      this.existingMenuIds.forEach(id => {
        let idIndex = this.newFoodMenuIds.indexOf(id);
        if (idIndex === -1) {
          restaurantOffer.removeFoodMenuIds.push(id);
        }
      });
    }

    this.businessService.updateRestaurantOffer(restaurantOffer, this.businessPromotionId).subscribe(
      (res: any) => {
        this.toastr.successToastr(res.body.message.en);
        this.router.navigate(["/admin/business/manage-business/" + this.businessId + "/business-promotion"]);
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
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

            //If user checked earlier then set checkbox true
            this.checkedMenuIfSelectedEarlier();

            //If checked all chckbox input then set all check box true
            this.setAllCheckedControlTrueOrFalse();

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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}



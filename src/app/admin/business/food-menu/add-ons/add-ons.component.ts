import { ToastrManager } from 'ng6-toastr-notifications';
import { CommonType } from './../../../../shared/models/common.model';
import { AppConstants } from './../../../../shared/constants/app-constants';
import { FoodMenuService } from './../foodMenuServices/food-menu.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from "@angular/core";
import { PlatformLocation } from '@angular/common';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: "app-add-ons",
  templateUrl: "./add-ons.component.html",
  styles: []
})
export class AddOnsComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  addonsGridLists: any[];
  private subscribeParam: any;
  menuId: number;
  businessId: number;
  addOnsStatuses: CommonType[];
  addonsModel: any = {};
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private foodMenuService: FoodMenuService,
    private router: Router,
    private toastr: ToastrManager,
    private platformLocation: PlatformLocation,
    private sharedDataService: SharedDataService,

  ) { }

  ngOnInit() {
    let pathIdList: number[] = [];
    const fullPath = this.platformLocation.href;
    pathIdList = this.sharedDataService.getFillPathIDList(fullPath);
    if (pathIdList.length == 1) {
      this.businessId = pathIdList[0];
    } else if (pathIdList.length == 2) {
      this.businessId = pathIdList[0];
      this.menuId = pathIdList[1];
      this.getAddonsList(this.menuId);
    }
    this.getAllAddonStatus();
  }


  private getAddonsList(menuId: number) {
    this.isLoading = true;
    this.subscription = this.foodMenuService.getAddOnsByMenuId(this.businessId, menuId).subscribe(
      (res: any) => {
        this.addonsGridLists = res.body.data.addons;
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

  private getAllAddonStatus() {
    this.subscription = this.foodMenuService.getAllAddonStatus().subscribe(
      (res: any) => {
        this.addOnsStatuses = res.body.data.addonStatuses;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  public updateOnStatusChanges(statusId, addOnsItem: any) {
    let addonStatus = this.addOnsStatuses.find(item => {
      return item.id == statusId;
    }).name;
    if (addonStatus) {
      this.addonsModel.status = addonStatus;
      this.foodMenuService.updateAddons(this.addonsModel, this.businessId, this.menuId, addOnsItem.id)
        .subscribe(
          (res: any) => {
            addOnsItem.addonStatus.name = addonStatus;
            this.toastr.successToastr(res.body.message.en);
          },
          err => {
            addOnsItem.addonStatus.name = addOnsItem.addonStatus.name;
            this.toastr.errorToastr(err.error.message.en);
          }
        );
    }
  }

  // editAddons(addonId: number) {
  //   this.router.navigate([
  //     `/admin/business/manage-business/${this.businessId}/food-menu/${this.menuId}/create`,
  //     addonId
  //   ]);
  // }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

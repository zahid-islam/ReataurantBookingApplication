import { ToastrManager } from 'ng6-toastr-notifications';
import { FoodMenuService } from './../foodMenuServices/food-menu.service';
import { CommonType } from './../../../../shared/models/common.model';
import { Router } from '@angular/router';
import { Component, OnInit, Input } from "@angular/core";
import { PlatformLocation } from '@angular/common';
import { SharedDataService } from '../../../../shared/services/shared-data.service';

export class AddonsFormModel {
  name: string;
  type: string;
  options: any[] = [];
}

export class AddonModel {
  name: string;
  price: number;
}

@Component({
  selector: "app-add-ons-form",
  templateUrl: "./add-ons-form.component.html",
  styles: []
})
export class AddOnsFormComponent implements OnInit {
  @Input() isSubmitDisabled?: boolean = false;
  addons: AddonModel = new AddonModel();
  addOnsList: any[] = [];
  isApiSubmit: boolean;
  addonsId: number;
  businessId: number;
  menuId: number;

  addonTypes: CommonType[];
  addonType: any = {};

  public addonsModel: AddonsFormModel = new AddonsFormModel();
  addonsEditModel: any = {};
  deleteOptionIds: any[] = [];

  constructor(
    private foodMneuServie: FoodMenuService,
    private router: Router,
    private toastr: ToastrManager,
    private platformLocation: PlatformLocation,
    private sharedDataService: SharedDataService,

  ) {
    this.isApiSubmit = false;
  }

  ngOnInit() {
    let pathIdList: number[] = [];
    const fullPath = this.platformLocation.href;
    pathIdList = this.sharedDataService.getFillPathIDList(fullPath);
    if (pathIdList.length == 1) {
      this.businessId = pathIdList[0];
    } else if (pathIdList.length == 2) {
      this.businessId = pathIdList[0];
      this.menuId = pathIdList[1];
    } else if (pathIdList.length == 3) {
      this.businessId = pathIdList[0];
      this.menuId = pathIdList[1];
      this.addonsId = pathIdList[2];
      this.getAddonsById(this.addonsId);
    }
    this.getAddonTypes();

  }

  getAddonsById(addonId: number) {
    this.foodMneuServie.getAddonsById(this.businessId, this.menuId, addonId)
      .subscribe((res: any) => {
        const addonItem: any = {};
        const addondata = res.body.data.addon;
        addonItem.name = addondata.name;

        if (addondata.addonOptions.length > 0) {
          addonItem.options = addondata.addonOptions;
        }
        this.addonsModel = addonItem;
        addonItem.type = addondata.addonType.name;
        this.addonType = addondata.addonType;
      }, err => {
        this.toastr.errorToastr(err.error.message.en);
      });
  }

  changeAddonType(addon: any) {
    this.addonType = addon;
    this.addonsModel.type = addon.name;
  }

  addAddons() {
    if (this.addons.name) {
      let copy = Object.assign({}, this.addons);
      copy.price = copy.price ? copy.price : 0;
      this.addonsModel.options.push(copy);
      this.addons.name = "";
      this.addons.price = null;
    }
    else {
      this.toastr.warningToastr('For adding addon you need to insert name.');
    }
  }

  getAddonTypes() {
    this.foodMneuServie.getAddonTypeUnderMenu().subscribe(
      (res: any) => {
        this.addonTypes = res.body.data.addonTypes;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  submitAddons() {
    if (!this.addonsId) {
      this.isApiSubmit = true;
      this.foodMneuServie.submitAddons(this.addonsModel, this.businessId, this.menuId).subscribe(
        (res: any) => {
          this.toastr.successToastr(res.body.message.en);
          this.isApiSubmit = false;
          this.router.navigate([
            `/admin/business/manage-business/${this.businessId}/food-menu`,
            this.menuId
          ]);
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
      let addonArr: any = [];
      if (this.addonsModel.options != undefined) {
        this.addonsModel.options.forEach(item => {
          if (!item.id) {
            let addon: any = {};
            addon.name = item.name;
            addon.price = item.price;
            addonArr.push(addon);
          }
        });
      } else {
        this.toastr.errorToastr("Insert at least one addon by name and price!");
        return;
      }

      if (addonArr.length) {
        this.addonsEditModel.addOptions = addonArr;
      }
      if (this.deleteOptionIds.length) {
        this.addonsEditModel.deleteOptionIds = this.deleteOptionIds;
      }

      this.addonsEditModel.name = this.addonsModel.name;
      // this.addonsEditModel.type = this.addonType.name;
      this.isApiSubmit = true;
      this.foodMneuServie.updateAddons(this.addonsEditModel, this.businessId, this.menuId, this.addonsId)
        .subscribe(
          (res: any) => {
            this.toastr.successToastr(res.body.message.en);
            this.isApiSubmit = false;
            this.router.navigate([
              `/admin/business/manage-business/${this.businessId}/food-menu`,
              this.menuId
            ]);
          },
          err => {
            this.toastr.errorToastr(err.error.message.en);
            this.isApiSubmit = false;
          },
          () => {
            this.isApiSubmit = false;
          }
        );
    }
  }

  deleteAddons(addon) {
    if (this.addonsModel.options.length) {
      let index = this.addonsModel.options.indexOf(addon);
      if (addon.id) {
        this.deleteOptionIds.push(addon.id);
        this.addonsModel.options.splice(index, 1);
      }
      else {
        this.addonsModel.options.splice(index, 1);
      }
    }
  }

}

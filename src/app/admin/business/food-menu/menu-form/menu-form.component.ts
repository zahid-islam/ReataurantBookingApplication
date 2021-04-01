import { SharedDataService } from './../../../../shared/services/shared-data.service';
import { AddOnsFormComponent } from './../add-ons-form/add-ons-form.component';
import { ToastrManager } from 'ng6-toastr-notifications';
import { FoodMenuService } from './../foodMenuServices/food-menu.service';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonType } from './../../../../shared/models/common.model';
import { forkJoin, of } from 'rxjs';
declare var jQuery: any;
import { PlatformLocation } from '@angular/common';

interface ICategory {
  name: string;
}

interface IAvailableTime {
  availableFromTime: string;
  availableToTime: string;
}

@Component({
  selector: 'app-menu-form',
  templateUrl: './menu-form.component.html',
  styleUrls: ['./menu-form.component.scss']
})
export class MenuFormComponent implements OnInit {

  @Output() closeModal = new EventEmitter();
  @ViewChild('primaryPhoto', { static: false }) photo: ElementRef;
  @ViewChild('categoryModal', { static: false }) categoryModal: ElementRef;
  @ViewChild(AddOnsFormComponent, { static: false }) addonsFormComp: AddOnsFormComponent;

  foodMenuId: number;
  @Input('menuId')
  set getMenuInfo(value) {
    if (value) {
      this.isApiSubmit = true;
      this.foodMenuId = value;
      this.getAllVatStatus();
    }
  }
  businessId: number;
  isApiSubmit: boolean;
  fileData: File = null;

  menuItem: any = {};
  foodType: CommonType = new CommonType();
  vatStatusType: CommonType = new CommonType();

  menuTypes: CommonType[];
  vatStatuses: CommonType[];

  categotyModel: ICategory = {} as ICategory;

  availableTimes: IAvailableTime[] = [];
  availTimeModel: IAvailableTime = {} as IAvailableTime;
  minTime: Date = null;

  constructor(
    private foodMneuServie: FoodMenuService,
    private toastr: ToastrManager,
    private router: Router,
    private sharedService: SharedDataService,
    private platformLocation: PlatformLocation) {

    let fullPath = this.platformLocation.href;
    this.businessId = this.sharedService.getBusinessIdFromUrl(fullPath);
  }

  ngOnInit() {
    this.isApiSubmit = false;
    this.getMenuCategories();
    if (!this.foodMenuId) {
      //Get food menu called in below method.
      this.getAllVatStatus();
    }

    this.menuItem.isAlwaysAvailable = true;
  }

  changeIsAlwaysAvailable(value: any) {
    this.menuItem.isAlwaysAvailable = value.target.checked ? true : false;
  }

  // this is used in (onBlur)="setMinValForAvaiToTime()" in html page
  setMinValForAvaiToTime() {
    let today = new Date();
    let date = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate();
    let minDate = new Date(date + ' ' + this.availTimeModel.availableFromTime);
    this.minTime = new Date(minDate.setSeconds(minDate.getSeconds() + 5));
    this.availTimeModel.availableToTime = `${this.minTime.getHours()}:${this.minTime.getMinutes()}:${this.minTime.getSeconds()}`;
  }

  isOverlapped(arr: any) {
    arr.sort((a: any, b: any): any => (a.availableFromTime > b.availableFromTime) ? 1 : -1);
    for (let index = 0; index < arr.length - 1; index++) {
      if (arr[index].availableToTime >= arr[index + 1].availableFromTime) {
        return true;
      }
    }
    return false;
  }

  emptyAvailTimeModelAfterInsert() {
    let copyObj = Object.assign({}, this.availTimeModel);
    this.availableTimes.push(copyObj);
    this.availTimeModel.availableFromTime = null;
    this.availTimeModel.availableToTime = null;
  }

  addAvailableTime() {
    if (this.availTimeModel.availableFromTime && this.availTimeModel.availableToTime &&
      (this.availTimeModel.availableFromTime < this.availTimeModel.availableToTime)) {
      let copyArray = [...this.availableTimes];
      copyArray.push(this.availTimeModel);
      if (copyArray.length > 1) {
        let isOverlapped = this.isOverlapped(copyArray);
        if (!isOverlapped) {
          this.emptyAvailTimeModelAfterInsert();
        }
        else {
          this.toastr.warningToastr('Given time slot overlapped.');
        }
      }
      else {
        this.emptyAvailTimeModelAfterInsert();
      }
    }
    else {
      this.toastr.warningToastr('availableFrom must be less than availableTo time and both field required.');
    }
  }

  deleteAvailableTime(time: any) {
    if (this.availableTimes.length) {
      let index = this.availableTimes.indexOf(time);
      if (index !== -1) {
        this.availableTimes.splice(index, 1);
      }
    }
  }

  getFoodMenuById(menuId: number) {
    this.foodMneuServie.getFoodMenuById(this.businessId, menuId)
      .subscribe(
        (res: any) => {
          let data = res.body.data;
          let menu: any = {};
          menu.itemName = data.foodMenu.itemName;
          menu.itemDescription = data.foodMenu.itemDescription;
          menu.price = data.foodMenu.price;
          menu.foodTypeId = data.foodMenu.foodType.id;
          menu.vatStatusId = data.foodMenu.vatStatus.id;
          menu.primaryPhoto = data.foodMenu.primaryPhoto;
          menu.itemName = data.foodMenu.itemName;
          menu.removePrimaryPhoto = "false";
          menu.isAlwaysAvailable = data.foodMenu.isAlwaysAvailable;
          this.availableTimes = data.foodMenu.foodMenuAvailabilityTimes;
          this.foodType = data.foodMenu.foodType;
          this.vatStatusType = data.foodMenu.vatStatus;
          this.vatStatusType.name = data.foodMenu.vatStatus.name;
          this.menuItem = menu;
          this.isApiSubmit = false;
        },
        err => {
          this.isApiSubmit = false;
          this.toastr.errorToastr(err.error.message.en);
        });
  }

  deleteThisImage() {
    if (!this.foodMenuId) {
      this.menuItem.removePrimaryPhoto = "true";
    }
    delete this.menuItem["primaryPhoto"];
    this.fileData = null;
  }

  fileProcess(primaryPhoto: any) {
    this.fileData = <File>primaryPhoto.files[0];
    var reader = new FileReader();
    reader.onload = (_event) => {
      this.menuItem.primaryPhoto = reader.result ? reader.result : null;
      this.photo.nativeElement.value = "";
    }
    reader.readAsDataURL(this.fileData);
  }

  createFoodType() {
    this.foodMneuServie.createFoodType(this.categotyModel).subscribe(
      (res: any) => {
        this.getMenuCategories();
        jQuery(this.categoryModal.nativeElement).modal('hide');
        this.categotyModel.name = '';
        this.toastr.successToastr(res.body.message.en);
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  getMenuCategories() {
    this.foodMneuServie.getMenuCategories().subscribe(
      (res: any) => {
        this.menuTypes = res.body.data;
      },
      err => { }
    );
  }

  getAllVatStatus() {
    this.foodMneuServie.getAllVatStatus().subscribe(
      (res: any) => {
        this.vatStatuses = res.body.data.vatStatuses;
        if (this.foodMenuId) {
          this.getFoodMenuById(this.foodMenuId);
        }
        else {
          let excludedVatStatus = this.vatStatuses[1];
          if (excludedVatStatus) {
            this.vatStatusType = excludedVatStatus;
            this.menuItem.vatStatusId = excludedVatStatus.id;
          }
        }
      },
      err => { }
    );
  }

  changeCategory(category: any) {
    this.foodType = category;
    this.menuItem.foodTypeId = category.id;
  }

  changeVatStatuses(vatStatus: any) {
    this.vatStatusType = vatStatus;
    this.menuItem.vatStatusId = vatStatus.id;
  }

  addCategory() {
    jQuery(this.categoryModal.nativeElement).modal('show');
  }

  submitMenu() {
    this.isApiSubmit = true;
    let formData = new FormData();

    if (this.fileData) {
      formData.append("files", this.fileData);
    }

    forkJoin([
      this.fileData ? this.foodMneuServie.uploadImage(formData) : of(null)
    ]).subscribe(
      (res: any) => {
        const imageUploadedResult = res[0];
        if (imageUploadedResult) {
          this.menuItem.primaryPhoto = imageUploadedResult.body.data.results[0].Location;
        }

        if (!this.foodMenuId) {
          if (this.menuItem.isAlwaysAvailable) { // check fully available or not.
            if (this.menuItem.availableTimes) {
              delete this.menuItem["availableTimes"];
            }
            this.submitFoodMenu(this.menuItem, this.businessId);
          }
          else { // If menu not fully available then check availableTimes length that is mandatory.
            if (this.availableTimes.length) {
              this.menuItem.availableTimes = this.availableTimes;
              this.submitFoodMenu(this.menuItem, this.businessId);
            }
            else {
              this.toastr.infoToastr("Available time list can not empty!");
            }
          }
        } else {
          this.menuItem.removePrimaryPhoto = this.menuItem.primaryPhoto ? "false" : "true";

          if (this.menuItem.isAlwaysAvailable) {
            if (this.menuItem.availableTimes) {
              delete this.menuItem["availableTimes"];
            }
            this.updateFoodMenu(this.menuItem, this.businessId, this.foodMenuId);
          }
          else {
            if (this.availableTimes.length) {
              this.menuItem.availableTimes = this.availableTimes;
              this.updateFoodMenu(this.menuItem, this.businessId, this.foodMenuId);
            }
            else {
              this.toastr.infoToastr("Available time list can not empty!");
            }
          }
        }
        this.isApiSubmit = false;
      },
      (err: any) => {
        this.isApiSubmit = false;
        this.toastr.errorToastr("Image upload failed");
      }
    );
  }

  submitFoodMenu(menuItem: any, businessId: number) {
    this.foodMneuServie.submitFoodMenu(menuItem, businessId).subscribe(
      (res: any) => {
        let menuId = res.body.data.foodMenu.id;
        let addons = this.addonsFormComp.addonsModel || null;
        if (menuId && addons && addons.options.length && addons.type && addons.name) {
          this.sumbitAddons(addons, businessId, menuId);
        }
        else {
          this.toastr.successToastr("Menu created successfully but addon data missing.");
          this.isApiSubmit = false;
          this.router.navigate([`/admin/business/manage-business/${this.businessId}/food-menu`]);
        }
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
        this.isApiSubmit = false;
      }
    );
  }

  sumbitAddons(addonsModel: any, businessId: number, menuId: number) {
    this.foodMneuServie.submitAddons(addonsModel, businessId, menuId).subscribe(
      (res: any) => {
        this.toastr.successToastr("Menu with addons created successfully.");
        this.router.navigate([`/admin/business/manage-business/${this.businessId}/food-menu`]);
      },
      err => {
        this.toastr.errorToastr("Menu created successfully but can't create Addons.");
        this.isApiSubmit = false;
      },
      () => {
        this.isApiSubmit = false;
      }
    );
  }

  updateFoodMenu(menuItem: any, businessId: number, foodMenuId: number) {
    this.foodMneuServie.updateFoodMenu(menuItem, businessId, foodMenuId)
      .subscribe(
        (res: any) => {
          this.toastr.successToastr(res.body.message.en);
          this.closePasswordModal();
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
          this.isApiSubmit = false;
        },
        () => {
          this.isApiSubmit = false;
        });
  }

  closePasswordModal() {
    this.closeModal.emit();
  }

}

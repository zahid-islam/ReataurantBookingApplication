import { SharedDataService } from './../../../../shared/services/shared-data.service';
import { Component, OnInit } from "@angular/core";
import { ToastrManager } from "ng6-toastr-notifications";
import { Router, ActivatedRoute } from "@angular/router";

import { CreateBusinessService } from "src/app/admin/services/create-business.service";
import { CommonType } from "src/app/shared/models/common.model";
import { CreateRestaurantOffer, UpdateRestaurantOffer } from "src/app/admin/models/business.model";
import { PlatformLocation } from "@angular/common";

interface IAvailableTime {
  availableFromTime: string;
  availableToTime: string;
}

@Component({
  selector: "app-business-promotion-form",
  templateUrl: "./business-promotion-form.component.html"
})
export class BusinessPromotionFormComponent implements OnInit {
  activeFromMinDate: Date = null;
  expiredAtMinDate: Date = null;
  restaurantOfferTypeId: number = 0;
  restaurantOfferTypes: CommonType[] = [];
  createRestaurantOffer: CreateRestaurantOffer = new CreateRestaurantOffer();
  selectedRestaurantOfferTypeName: string;

  isPercentageContain: boolean;
  isStartFromNow: boolean;
  togglePersonalPublicPromotion: boolean;
  isUpdateMode: boolean;
  isApiSubmit: boolean;
  businessPromotionId: number = null;
  businessId: number = null;

  availableTimes: IAvailableTime[] = [];
  availTimeModel: IAvailableTime = {} as IAvailableTime;

  constructor(
    private businessService: CreateBusinessService,
    private toastr: ToastrManager,
    private sharedService: SharedDataService,
    private platformLocation: PlatformLocation,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    let pathIdList: number[] = [];
    const fullPath = this.platformLocation.href;
    pathIdList = this.sharedService.getFillPathIDList(fullPath);

    if (pathIdList.length === 1) {
      this.businessId = pathIdList[0];
    } else if (pathIdList.length === 2) {
      this.businessId = pathIdList[0];
      this.businessPromotionId = pathIdList[1];
    }

    if (this.businessPromotionId) {
      this.isUpdateMode = true;
      this.getParticularBusinessPromotion(this.businessPromotionId);
    }
    else {
      this.selectedRestaurantOfferTypeName = "PERCENTAGE";
      this.getAllRestaurantOfferStatus();

      this.createRestaurantOffer.businessId = this.businessId;
      this.createRestaurantOffer.restaurantOfferType = "PERCENTAGE";
      this.createRestaurantOffer.shouldStartFromNow = "false";
      this.createRestaurantOffer.isAlwaysAvailable = true;

      let currentDate = new Date();
      this.activeFromMinDate = currentDate;
      this.expiredAtMinDate = currentDate;
    }
  }

  changeIsAlwaysAvailable(value: any) {
    this.createRestaurantOffer.isAlwaysAvailable = value.target.checked ? true : false;
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

  deleteAvailableTime(time: any) {
    if (this.availableTimes.length) {
      let index = this.availableTimes.indexOf(time);
      if (index !== -1) {
        this.availableTimes.splice(index, 1);
      }
    }
  }

  getParticularBusinessPromotion(promotionsID: number) {
    this.businessService.getParticularRestaurantOffer(promotionsID).subscribe(
      (res: any) => {
        let businessPromotion = res.body.data.restaurantOffer;

        this.createRestaurantOffer.businessId = businessPromotion.businessId;
        this.createRestaurantOffer.activeFrom =
          !businessPromotion.shouldStartFromNow ? new Date(businessPromotion.activeFrom) : null;

        this.createRestaurantOffer.expiredAt = new Date(businessPromotion.expiredAt);
        this.createRestaurantOffer.title = businessPromotion.title;
        this.createRestaurantOffer.description = businessPromotion.description;
        this.createRestaurantOffer.isAlwaysAvailable = businessPromotion.isAlwaysAvailable;
        this.availableTimes = businessPromotion.restaurantOfferAvailableTimes || [];

        this.createRestaurantOffer.shouldStartFromNow =
          businessPromotion.shouldStartFromNow ? "true" : "false";

        this.createRestaurantOffer.percentage = businessPromotion.percentage || null;
        this.createRestaurantOffer.flatAmount = businessPromotion.flatAmount || null;
        this.createRestaurantOffer.buyOneGetCount = businessPromotion.buyOneGetCount || null;

        this.createRestaurantOffer.restaurantOfferType = businessPromotion.restaurantOfferType.name;
        this.selectedRestaurantOfferTypeName = businessPromotion.restaurantOfferType.name;
        this.getAllRestaurantOfferStatus();
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  getAllRestaurantOfferStatus() {
    this.businessService.getAllRestaurantOfferTypes().subscribe(
      (res: any) => {
        this.restaurantOfferTypes = res.body.data.restaurantOfferTypes;
        this.restaurantOfferTypeId = this.getRestaurantOfferTypesIdByName(this.selectedRestaurantOfferTypeName);
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  updateBusinessPromotion(restaurantOffer: any) {
    this.businessService.updateRestaurantOffer(restaurantOffer, this.businessPromotionId).subscribe(
      (res: any) => {
        this.toastr.successToastr(res.body.message.en);
        this.router.navigate(["/admin/business/manage-business/" + this.businessId + "/business-promotion"]);
      },
      err => {
        this.isApiSubmit = false;
        this.toastr.errorToastr(err.error.message.en);
      },
      () => {
        this.isApiSubmit = false;
      }
    );
  }

  createBusinessPromotion(createModel: any) {
    this.businessService.createRestaurantOffer(createModel).subscribe(
      (res: any) => {
        this.toastr.successToastr(res.body.message.en);
        this.router.navigate(["/admin/business/manage-business/" + this.businessId + "/business-promotion"]);
      },
      err => {
        this.isApiSubmit = false;
        this.toastr.errorToastr(err.error.message.en);
      },
      () => {
        this.isApiSubmit = false;
      }
    );
  }

  submitBusinessPromotion() {
    this.isApiSubmit = true;
    if (this.isUpdateMode) { // Update business portion
      let restaurantOffer = new UpdateRestaurantOffer();
      restaurantOffer.title = this.createRestaurantOffer.title;
      restaurantOffer.description = this.createRestaurantOffer.description;
      restaurantOffer.isAlwaysAvailable = this.createRestaurantOffer.isAlwaysAvailable;

      if (restaurantOffer.isAlwaysAvailable) { // check fully available or not.
        restaurantOffer.availableTimes = [];
        this.updateBusinessPromotion(restaurantOffer);
      }
      else { // If offer not fully available then check availableTimes length that is mandatory.
        restaurantOffer.availableTimes = this.availableTimes;
        if (restaurantOffer.availableTimes.length) {
          this.updateBusinessPromotion(restaurantOffer);
        }
        else {
          this.toastr.infoToastr("Available time list can not empty!");
          this.isApiSubmit = false;
        }
      }
    }
    else { // Create business portion
      let createModel: CreateRestaurantOffer = Object.assign({}, this.createRestaurantOffer)
      if (this.createRestaurantOffer.shouldStartFromNow === "false") {
        createModel.activeFrom = new Date(this.createRestaurantOffer.activeFrom).getTime() + 300000;
      }

      createModel.expiredAt = new Date(this.createRestaurantOffer.expiredAt).getTime();

      if (createModel.isAlwaysAvailable) { // check fully available or not.
        createModel.availableTimes = [];
        this.createBusinessPromotion(createModel);
      }
      else { // If offer not fully available then check availableTimes length that is mandatory.
        createModel.availableTimes = this.availableTimes;
        if (createModel.availableTimes.length) {
          this.createBusinessPromotion(createModel);
        }
        else {
          this.toastr.infoToastr("Available time list can not empty!");
          this.isApiSubmit = false;
        }
      }
    }
  }

  shouldStartFromNowRadioChange(isChange: boolean) {
    this.isStartFromNow = isChange;
    this.createRestaurantOffer.shouldStartFromNow = isChange ? "true" : "false";
    if (isChange) {
      this.createRestaurantOffer.activeFrom = null;
      this.expiredAtMinDate = new Date();
    }
  }

  checkActiveFrom(activeDate: any) {
    this.expiredAtMinDate = new Date(activeDate);
  }

  restaurantOfferTypeChange() {
    this.selectedRestaurantOfferTypeName = this.getRestaurantOfferTypesNameById(
      this.restaurantOfferTypeId
    );
    this.createRestaurantOffer.restaurantOfferType = this.getRestaurantOfferTypesNameById(
      this.restaurantOfferTypeId
    );

    if (this.selectedRestaurantOfferTypeName === "PERCENTAGE") {
      this.createRestaurantOffer.flatAmount = null;
      this.createRestaurantOffer.buyOneGetCount = null;
    }
    else if (this.selectedRestaurantOfferTypeName === "FLAT") {
      this.createRestaurantOffer.percentage = null;
      this.createRestaurantOffer.buyOneGetCount = null;
    }
    else {
      this.createRestaurantOffer.flatAmount = null;
      this.createRestaurantOffer.percentage = null;
    }
  }

  private getRestaurantOfferTypesNameById(selectedTypeId: number) {
    let restaurantOfferType = null;
    if (selectedTypeId !== 0) {
      restaurantOfferType = this.restaurantOfferTypes.find(item => {
        return item.id === selectedTypeId;
      }).name;
    }
    return restaurantOfferType;
  }

  private getRestaurantOfferTypesIdByName(name: string) {
    let restaurantOfferTypeId = 0;
    if (name) {
      restaurantOfferTypeId = this.restaurantOfferTypes.find(item => {
        return item.name === name;
      }).id;
    }
    return restaurantOfferTypeId;
  }
}

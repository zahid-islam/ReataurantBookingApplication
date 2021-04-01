import { SettingService } from './../services/setting.service';
import { CreateBusinessService } from './../services/create-business.service';
import { ActivityService } from './../../shared/services/activity.service';
import { Activity } from './../models/activity.model';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ToastrManager } from 'ng6-toastr-notifications';
declare var jQuery: any;
import { Paginator } from "primeng/paginator";

interface IActivityDetail {
  attribute: string;
  previousValue?: any;
  currentValue: any;
  image?: any;
  imageArray?: any;
}

interface IActivityDateRangeModel {
  fromDate: Date;
  toDate: Date;
}

@Component({
  selector: 'app-activity-logs',
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.scss']
})
export class ActivityLogsComponent implements OnInit {
  @ViewChild('activityModal', { static: false }) activityModal: ElementRef;
  @ViewChild("activityPaginator", { static: false }) dataTable: ElementRef<Paginator>;
  activityDateRangeModel: IActivityDateRangeModel = {} as IActivityDateRangeModel;
  allActivity: Activity[];
  particularActivity: Activity = new Activity();
  activityDetails: IActivityDetail[] = [];
  isLoading: boolean;

  // paginator variable
  offset: number = 0;
  totalCount: number = 0;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;
  today: any = new Date();
  activityLogUpdateApi: any;
  activityResource: any = {};

  fromDate: any = null;
  toDate: any = null;

  constructor(
    private activityService: ActivityService,
    private toastr: ToastrManager,
    private businessService: CreateBusinessService,
    private settingService: SettingService) { }

  ngOnInit() {
    this.activityLogUpdateApi = {
      BUSINESS: {
        service: this.businessService,
        serviceFunction: this.businessService.getBusinessesById
      },
      BUSINESS_USER: {
        service: this.activityService,
        serviceFunction: this.activityService.getBusinessUserWithoutBusinessById
      },
      BANK: {
        service: this.activityService,
        serviceFunction: this.activityService.getBankWithoutBusinessById
      },
      FOOD_MENU: {
        service: this.activityService,
        serviceFunction: this.activityService.getFoodMenuWithoutBusinessById
      },
      FOOD_MENU_ADDON: {
        service: this.activityService,
        serviceFunction: this.activityService.getAddonWithoutBusinessAndMenuById
      },
      FLOOR_PLAN: {
        service: this.activityService,
        serviceFunction: this.activityService.getFloorPlanWithoutBusinessById
      },
      INTERNAL_USER: {
        service: this.activityService,
        serviceFunction: this.activityService.getInternalUserById
      },
      PROMOTION: {
        service: this.activityService,
        serviceFunction: this.activityService.getPrticularPromotionById
      },
      FACILITY_GROUP: {
        service: this.settingService,
        serviceFunction: this.settingService.getParticularFacilityGroup
      },
      FACILITY: {
        service: this.settingService,
        serviceFunction: this.settingService.getParticularFacility
      }
    }

    this.isLoading = false;
    this.getAllActivity(this.offset.toString(), this.limit.toString());
  }

  getAllActivity(offset: string, limit: string) {
    this.isLoading = true;
    this.activityService.getAllActivity(offset, limit).subscribe(
      (res: any) => {
        this.allActivity = res.body.data.activityLogs;
        this.totalCount = res.body.data.count;
        this.isLoading = false;
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

  viewParticularActivityDetails(activityId: number, resource: string, resourceId: number, action: string) {
    const { service, serviceFunction } = this.activityLogUpdateApi[resource];
    // serviceFunction.call(service, resourceId)
    service[serviceFunction.name](resourceId).subscribe(
      (res: any) => {
        this.dataMapperForActivity(res.body.data, resource, action);
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );

    this.activityService.getActivityById(activityId).subscribe(
      (res: any) => {
        this.particularActivity = res.body.data.activityLog;
        this.particularActivity.finalValue = JSON.parse(this.particularActivity.finalValue);
        this.particularActivity.previousValue = JSON.parse(this.particularActivity.previousValue);
        let previousValuLength = Object.keys(this.particularActivity.previousValue).length;

        if (previousValuLength == 0) {
          this.makingActivityDetailsWhenPreValueEmpty(this.particularActivity.finalValue);
        }
        else {
          this.makingActivityDetailsWhenPreValue(this.particularActivity.finalValue, this.particularActivity.previousValue);
        }

        jQuery(this.activityModal.nativeElement).modal('show');
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  dataMapperForActivity(data: any, source: string, action: string) {
    this.activityResource = {};
    switch (source) {
      case 'BUSINESS': {
        let business = data.business;
        this.activityResource.name = `<b>${action}</b> perform on business <b>${business.name}</b>`;
        break;
      }
      case 'BUSINESS_USER': {
        let user = data.user;
        this.activityResource.name = `<b>${action}</b> perform on business user <b>${user.email}</b> 
        of business <b>${user.business.name}</b>`;
        break;
      }
      case 'INTERNAL_USER': {
        let user = data.user;
        this.activityResource.name = `<b>${action}</b> perform on internal user <b>${user.email}</b>`;
        break;
      }
      case 'BANK': {
        let bankInfo = data.bankInfo;
        let businesses = bankInfo.businesses.length ? bankInfo.businesses.map(e => e.name).join(" ") : "";
        this.activityResource.name = `<b>${action}</b> perform on bank <b>${bankInfo.bankName}</b>
         of businesses <b>${businesses}</b>`;
        break;
      }
      case 'FOOD_MENU': {
        let foodMenu = data.foodMenu;
        this.activityResource.name = `<b>${action}</b> perform on food menu <b>${foodMenu.itemName}</b> 
        of business <b>${foodMenu.business.name}</b>`;
        break;
      }
      case 'FOOD_MENU_ADDON': {
        let addon = data.addon;
        this.activityResource.name = `<b>${action}</b> perform on addon <b>${addon.name}</b>  under food menu 
        <b>${addon.foodMenu.itemName}</b> of business <b>${addon.foodMenu.business.name}</b>`;
        break;
      }
      case 'FLOOR_PLAN': {
        let floorPlan = data.floorPlan;
        this.activityResource.name = `<b>${action}</b> perform on floor <b>${floorPlan.floorName}</b> of business 
        <b>${floorPlan.business.name}</b>`;
        break;
      }
      case 'PROMOTION': {
        let promotion = data.promotion;
        this.activityResource.name = `<b>${action}</b> perform on promotion <b>${promotion.promoCode}</b>`;
        break;
      }
      case 'FACILITY_GROUP': {
        let facilityGroup = data.facilityGroup;
        this.activityResource.name = `<b>${action}</b> perform on facility group <b>${facilityGroup.name}</b>`;
        break;
      }
      case 'FACILITY': {
        let facility = data.facility;
        this.activityResource.name = `<b>${action}</b> perform on facility <b>${facility.name}</b>`;
        break;
      }
      default: {
        this.activityResource.name = "";
        break;
      }
    }
  }

  makingActivityDetailsWhenPreValueEmpty(finalValue: any) {
    this.activityDetails = [];
    for (let key of Object.keys(finalValue)) {
      let activity = {} as IActivityDetail;
      let value = finalValue[key];
      if (!value) {
        delete finalValue[key];
      }
      else if (typeof value === 'object' && value.constructor === Object) {
        let keyName = Object.keys(value).find(val => { return val == 'name' });
        value = value[keyName];
      }
      else if (typeof value === 'object' && value.constructor === Array) {
        value = value.map(obj => obj.name || obj.photo);
      }

      if (value) {
        activity.attribute = key;
        activity.currentValue = value;

        if (typeof value === 'string') {
          let checkImageOfValue = this.matchIfValueIsImage(value);
          activity.image = checkImageOfValue ? true : false;
        }
        else if (typeof value === 'object' && value.constructor === Array) {
          let isImage = this.matchIfValueIsImage(value[0]);
          activity.imageArray = isImage ? true : false;
        }

        this.activityDetails.push(activity);
      }
    }
  }

  makingActivityDetailsWhenPreValue(finalValue: any, preValue: any) {
    let finalValueKeys = Object.keys(finalValue);
    let prevValueKeys = Object.keys(preValue);

    for (let key of finalValueKeys) {
      let fValue = finalValue[key];
      let pValueKeyExist = prevValueKeys.indexOf(key);
      let pValue = pValueKeyExist != -1 ? preValue[key] : null;

      if (fValue && pValue && pValueKeyExist != -1) {
        if (typeof fValue === 'string' || typeof fValue === 'number') {
          if (fValue == pValue) {
            delete finalValue[key];
            delete preValue[key];
          }
        }
        else if (typeof fValue === 'object' && fValue.constructor === Array) {
          let arrfValue = fValue.map(obj => obj.name || obj.photo);
          let arrpValue = pValue.map(obj => obj.name || obj.photo);
          let intersetValue = this.compareTwoArray(arrfValue, arrpValue);
          if ((intersetValue == arrfValue.length) && (intersetValue == arrpValue.length)) {
            delete finalValue[key];
            delete preValue[key];
          }
        }
        else if (typeof fValue === 'object' && fValue.constructor === Object) {
          let objfValue = Object.values(fValue);
          let objpValue = Object.values(pValue);
          let intersetValue = this.compareTwoArray(objfValue, objpValue);
          if ((intersetValue == objfValue.length) && (intersetValue == objpValue.length)) {
            delete finalValue[key];
            delete preValue[key];
          }
        }
      }
    }//End for loop

    this.makingOriginalDetailsByTwoValue(finalValue, preValue);
  }

  makingOriginalDetailsByTwoValue(finalValue: any, preValue: any) {
    this.activityDetails = [];
    for (let key of Object.keys(finalValue)) {
      let activity = {} as IActivityDetail;

      let fValue = finalValue[key];
      let pValue = preValue[key];
      if (!fValue) {
        delete finalValue[key];
      }
      else if (typeof fValue === 'object' && fValue.constructor === Object) {
        let keyName = Object.keys(fValue).find(val => { return val == 'name' });
        fValue = fValue[keyName];
      }
      else if (typeof fValue === 'object' && fValue.constructor === Array) {
        fValue = fValue.map(obj => obj.name || obj.photo);
      }

      if (!pValue) {
        delete preValue[key];
      }
      else if (typeof pValue === 'object' && pValue.constructor === Object) {
        let keyName = Object.keys(pValue).find(val => { return val == 'name' });
        pValue = pValue[keyName];
      }
      else if (typeof pValue === 'object' && pValue.constructor === Array) {
        pValue = pValue.map(obj => obj.name || obj.photo);
      }

      if (fValue) {
        activity.attribute = key;
        activity.currentValue = fValue;

        if (typeof fValue === 'string') {
          let checkImageOfValue = this.matchIfValueIsImage(fValue);
          activity.image = checkImageOfValue ? true : false;
        }
        else if (typeof fValue === 'object' && fValue.constructor === Array && fValue.length > 0) {
          let isImage = this.matchIfValueIsImage(fValue[0]);
          activity.imageArray = isImage ? true : false;
        }
      }

      if (pValue) {
        activity.previousValue = pValue;

        if (typeof pValue === 'string') {
          let checkImageOfValue = this.matchIfValueIsImage(pValue);
          activity.image = checkImageOfValue ? true : false;
        }
        else if (typeof pValue === 'object' && pValue.constructor === Array && pValue.length > 0) {
          let isImage = this.matchIfValueIsImage(pValue[0]);
          activity.imageArray = isImage ? true : false;
        }
      }

      this.activityDetails.push(activity);
    }
  }

  compareTwoArray(arrOne: any, arrTwo: any) {
    const intersection = arrOne.filter((element: any) => arrTwo.includes(element));
    return intersection.length;
  }

  matchIfValueIsImage(value: any) {
    let matchResult = value ? value.match(/(JPG|PNG|GIF|jpg|png|gif)/) : false;
    return matchResult ? true : false;
  }

  paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    if (this.fromDate) {
      this.getAllActivityByDatePaginatedly();
    }
    else {
      this.getAllActivity(
        this.offset.toString(),
        this.limit.toString()
      );
    }
  }

  resetDateProperty() {
    this.activityDateRangeModel = {} as IActivityDateRangeModel;
    let paginatorRef: any = this.dataTable;
    this.offset = 0;
    this.limit = 10;
    paginatorRef.first = this.offset;
    paginatorRef.rows = this.limit;
    this.fromDate = null;
    this.toDate = null;
    this.getAllActivity(
      this.offset.toString(),
      this.limit.toString()
    );
  }

  getAllActivityByDatePaginatedly() {
    let currentDate = new Date().getTime();
    this.fromDate = this.activityDateRangeModel.fromDate
      ? new Date(this.activityDateRangeModel.fromDate).getTime() - (new Date().getTimezoneOffset() * 60 * 1000)
      : null;
    this.toDate = this.activityDateRangeModel.toDate
      ? new Date(this.activityDateRangeModel.toDate).getTime() - (new Date().getTimezoneOffset() * 60 * 1000)
      : this.activityDateRangeModel.fromDate ? currentDate : null;

    if (this.fromDate && this.fromDate <= this.toDate && this.toDate <= currentDate) {
      this.allActivity = [];
      this.isLoading = true;
      this.activityService.getAllActivityByDatePaginatedly(this.offset.toString(), this.limit.toString(), this.fromDate, this.toDate).subscribe(
        (res: any) => {
          this.allActivity = res.body.data.activityLogs;
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
    else {
      this.toastr.infoToastr('From date is required to filter and DateFrom not greater than DateTo');
      this.activityDateRangeModel.toDate = null;
      this.isLoading = false;
    }
  }

}

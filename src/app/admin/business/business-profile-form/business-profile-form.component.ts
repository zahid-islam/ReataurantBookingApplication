import { AppConstants } from './../../../shared/constants/app-constants';
import { ToastrManager } from "ng6-toastr-notifications";
import { Component, OnInit, AfterViewInit } from "@angular/core";
import { PlatformLocation } from "@angular/common";
import { forkJoin, of } from 'rxjs';

import { CommonType } from "./../../../shared/models/common.model";
import { CreateBusinessService } from "./../../services/create-business.service";
import { SharedDataService } from "./../../../shared/services/shared-data.service";
import { BusinessClassifications } from '../../models/setting.model';
import { SettingService } from '../../services/setting.service';


@Component({
  selector: "app-business-profile-form",
  templateUrl: "./business-profile-form.component.html"
})
export class BusinessProfileFormComponent implements OnInit, AfterViewInit {
  fileData: File = null;
  fileDataList: File[] = [];
  imageUrls: any[] = [];
  businessId: number;
  businessModel: any = {};
  primaryPhotoUrl: any;
  isLoadingTags = false;
  isLoadingFacilities = false;
  isMinMaxValue: boolean;
  isProfileImgLoading: boolean;
  isImgLoading: boolean;

  activeTags: any[] = [];
  activeFacilities: any[] = [];
  priceRangeValues: number[] = [];

  tags: any[] = [];
  facilities: any[] = [];
  isApiSubmit: boolean;
  phone: string;
  email: string;

  businessTypeList: CommonType[] = [];
  businessType: CommonType = new CommonType();
  public businessClass: BusinessClassifications = new BusinessClassifications();
  public businessClassifications: BusinessClassifications[] = [];

  constructor(
    private toastr: ToastrManager,
    private sharedService: SharedDataService,
    private businessService: CreateBusinessService,
    private platformLocation: PlatformLocation,
    private settingService: SettingService,

  ) {
    this.isProfileImgLoading = true;
    this.isImgLoading = true;
    this.isApiSubmit = false;
    this.isLoadingTags = false;
    this.isLoadingFacilities = false;

  }

  ngOnInit() {
    this.businessModel.timeZoneOffsetInMillis = new Date().getTimezoneOffset() * 60 * 1000;
    const fullPath = this.platformLocation.href;
    this.businessId = this.sharedService.getBusinessIdFromUrl(fullPath);
    if (this.businessId) {
      this.businessModel.emails = [];
      this.businessModel.phones = [];
      this.getBusinessById(this.businessId);
    }
  }

  onLoad() {
    this.isImgLoading = false;
  }
  onLoadProfile() {
    this.isProfileImgLoading = false;
  }

  ngAfterViewInit() { }

  setPriceRangeOnModelChanges() {
    this.businessModel.priceRangeLower = this.priceRangeValues[0];
    this.businessModel.priceRangeUpper = this.priceRangeValues[1];
  }

  getBusinessById(id: number) {
    this.isLoadingFacilities = true;
    this.isLoadingTags = true;
    forkJoin([
      this.businessService.getBusinessesById(id),
      this.businessService.getBusinessType(),
      this.businessService.getAllFacilitiesTags(),
      this.businessService.getBusinessesTags(),
      this.settingService.getClassifications(null, null, "ACTIVE", "false")
    ]).subscribe(
      (res: any) => {
        const business = res[0].body.data.business;
        this.businessTypeList = res[1].body.data.types;
        this.businessTypeList.forEach(value => {
          value.name = value.name.charAt(0).toUpperCase() + value.name.slice(1);
        });
        this.facilities = res[2].body.data.facilities;
        this.tags = res[3].body.data.tags;

        this.businessClassifications = res[4].body.data.classifications;

        if (this.businessClassifications && this.businessClassifications.length && business.classificationId) {
          this.businessClassifications.forEach(item => {
            if (item.id === business.classificationId) {
              this.businessClass = item;
            }
          });
        }

        // Stop Facilities and Tags loading
        this.isLoadingTags = false;
        this.isLoadingFacilities = false;

        // Processing business Email
        for (let i = 0; i <= business.emails.length; i++) {
          let item = business.emails[i];
          if (item) {
            this.businessModel.emails.push(item.email);
          }
        }

        // Processing business Phone
        for (let j = 0; j <= business.phones.length; j++) {
          let item = business.phones[j];
          if (item) {
            this.businessModel.phones.push(item.phone);
          }
        }

        this.businessModel.name = business.name;
        this.businessModel.vatPercentage = Number(business.vatPercentage);
        this.businessModel.serviceChargePercentage = Number(business.serviceChargePercentage);
        this.businessModel.address = business.address;
        this.businessModel.latitude = business.latitude;
        this.businessModel.longitude = business.longitude;
        this.businessModel.details = business.details;
        this.businessModel.location = business.location;
        this.businessModel.capacity = business.capacity;

        this.businessModel.priceRangeLower = business.priceRangeLower;
        this.businessModel.priceRangeUpper = business.priceRangeUpper;
        this.priceRangeValues = [business.priceRangeLower ? business.priceRangeLower : 100,
        business.priceRangeUpper ? business.priceRangeUpper : 5000];

        this.businessModel.defaultOpeningTime = business.defaultOpeningTime;
        this.businessModel.defaultClosingTime = business.defaultClosingTime;
        this.businessModel.primaryPhoto = business.primaryPhoto;
        this.businessModel.prefeexSharedPercentage = business.prefeexSharedPercentage;
        this.businessModel.vatPercentage = business.vatPercentage;
        this.businessModel.serviceChargePercentage = business.serviceChargePercentage;
        business.businessType.name =
          business.businessType.name.charAt(0).toUpperCase() + business.businessType.name.slice(1);
        this.businessType = business.businessType;

        this.businessModel.facilities = business.facilities;
        this.activeFacilities = [];
        if (business.facilities.length) {
          this.businessModel.facilities.forEach(obj => {
            this.activeFacilities.push(obj.id);
            let facility = this.facilities.find(item => item.id === obj.id);
            if (facility) {
              facility.isActive = true;
            }
          });
        }

        this.businessModel.tags = business.tags;
        this.activeTags = [];
        if (business.tags.length) {
          this.businessModel.tags.forEach(obj => {
            this.activeTags.push(obj.id);
            let tag = this.tags.find(item => item.id === obj.id);
            if (tag) {
              tag.isActive = true;
            }
          });
        }

        if (business.photos.length > 0) {
          this.businessModel.photos = business.photos;
          this.businessModel.photos.forEach(photoItem => {
            const image: any = {};
            image.id = photoItem.id;
            image.photo = photoItem.photo;
            this.imageUrls.push(image);
          });
        }
      },
      (err: any) => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  chipsAdd(item: any) {
    item.isActive = !item.isActive;
    if (item.isActive) {
      this.activeTags.push(item.id);
    } else {
      const index = this.activeTags.indexOf(item.id);
      if (index !== -1) {
        this.activeTags.splice(index, 1);
      }
    }
    if (this.activeTags.length > 0) {
      this.businessModel.tags = this.activeTags;
    }
  }

  facilitiesChipsAdd(item: any) {
    item.isActive = !item.isActive;
    if (item.isActive) {
      this.activeFacilities.push(item.id);
    } else {
      const index = this.activeFacilities.indexOf(item.id);
      if (index !== -1) {
        this.activeFacilities.splice(index, 1);
      }
    }
    if (this.activeFacilities.length > 0) {
      this.businessModel.facilities = this.activeFacilities;
    }
  }



  onSelectedFiles(photo: any) {
    if (photo.files.length > 0) {
      for (const file of photo.files) {
        this.fileDataList.push(file as File);
        const reader = new FileReader();
        const newImage: any = {};
        reader.onload = (event: any) => {
          newImage.id = 0;
          newImage.photo = event.target.result;
          this.imageUrls.push(newImage);
        };
        reader.readAsDataURL(file as File);
      }
    }
  }

  fileProcess(photo: any) {
    this.fileData = photo.files[0] as File;
    const reader = new FileReader();
    reader.onload = (_event) => {
      this.primaryPhotoUrl = reader.result ? reader.result : null;
    };
    reader.readAsDataURL(this.fileData);
  }

  updateBusinessProfile() {
    this.isApiSubmit = true;
    let formData = new FormData();
    let formDataMultiple = new FormData();

    if (this.fileData) {
      formData.append("files", this.fileData);
    }

    if (this.fileDataList.length) {
      this.fileDataList.forEach(item => {
        formDataMultiple.append("files", item);
      });
    }

    forkJoin([
      this.fileData ? this.sharedService.uploadMultipleImages(formData) : of(null),
      this.fileDataList.length ? this.sharedService.uploadMultipleImages(formDataMultiple) : of(null)
    ]).subscribe(
      (res: any) => {
        const singleFile = res[0];
        const multipleFile = res[1];
        if (singleFile) {
          this.businessModel.primaryPhoto = singleFile.body.data.results[0].Location;
        }

        if (multipleFile) {
          for (let i = 0; i < this.imageUrls.length; i++) {
            let item = this.imageUrls[i];
            if (item.id == 0) {
              this.imageUrls.splice(i, 1);
              i--;
            }
          }

          multipleFile.body.data.results.forEach(item => {
            let savedImage: any = {};
            savedImage.id = 0;
            savedImage.photo = item.Location;
            this.imageUrls.push(savedImage);
          });
        }

        this.setImagesUrlForUpdate();
        this.setBusinessTagFacilities();
        this.updateBusinessEntity(this.businessModel, this.businessId);
      },
      (err: any) => {
        this.toastr.errorToastr("Image upload failed");
      }
    );
  }

  setBusinessTagFacilities() {
    this.businessModel.tags = this.activeTags;
    this.businessModel.facilities = this.activeFacilities;
  }

  updateBusinessEntity(businessModel: any, businessId: number) {
    this.businessService
      .updateBusinessEntity(businessModel, businessId)
      .subscribe(
        (res: any) => {
          this.toastr.successToastr(res.body.message.en);
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

  validateMaxAndMinLength(value) {
    if (value) {
      value = Math.round(value);
      if (value < 0 || value > 100) {
        this.isMinMaxValue = true;
      } else {
        this.isMinMaxValue = false;
      }
    }
  }


  setImagesUrlForUpdate() {
    if (this.imageUrls.length) {
      this.businessModel.photos = [];
      this.imageUrls.forEach(item => {
        this.businessModel.photos.push(item.photo);
      });
    }
  }

  setBusinessTypeId(businesType) {
    this.businessModel.businessTypeId = businesType.id;
  }

  setBusinessClassificationId(businesClass) {
    this.businessModel.classificationId = businesClass.id;
  }

  deleteThisImage(index: any) {
    const exsitingItem = this.imageUrls[index];
    if (exsitingItem.id == 0) {
      this.fileDataList.splice(index, 1);
    }
    this.imageUrls.splice(index, 1);
  }

  addEmailAddress() {
    if (this.email) {
      let isEmailValid = AppConstants.emailIsValid(this.email);
      let index: number = -1;
      if (this.businessModel.emails.length) {
        index = this.businessModel.emails.indexOf(this.email);
      }

      if (isEmailValid) {
        if (index === -1) {
          this.businessModel.emails.push(this.email);
          this.email = null;
        } else {
          this.email = null;
          this.toastr.warningToastr("Can't insert duplicate Email!");
        }

      } else {
        this.email = null;
        this.toastr.errorToastr("Invalid Email Address");
      }
    }
  }

  addPhone() {
    if (this.phone) {
      let isPhoneValid = AppConstants.phoneIsValid(this.phone);
      let index: number = -1;
      if (this.businessModel.phones.length) {
        index = this.businessModel.phones.indexOf(this.phone);
      }

      if (isPhoneValid) {
        if (index === -1) {
          this.businessModel.phones.push(this.phone);
          this.phone = null;
        } else {
          this.phone = null;
          this.toastr.warningToastr("Can't insert duplicate Phone!");
        }

      } else {
        this.phone = null;
        this.toastr.errorToastr("Invalid Phone");
      }
    }
  }

  removeEmailAddress(email: string) {
    if (this.businessModel.emails.length) {
      const index = this.businessModel.emails.indexOf(email);
      if (index !== -1) {
        this.businessModel.emails.splice(index, 1);
      }
    }
  }

  removePhone(phone: any) {
    if (this.businessModel.phones.length) {
      const index = this.businessModel.phones.indexOf(phone);
      if (index !== -1) {
        this.businessModel.phones.splice(index, 1);
      }
    }
  }

}

import {
  Component,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import { Location } from '@angular/common';
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrManager } from "ng6-toastr-notifications";
import { forkJoin, of } from "rxjs";

import { CommonType } from "./../../../shared/models/common.model";
import { CreateBusinessService } from "./../../services/create-business.service";
import { SharedDataService } from "./../../../shared/services/shared-data.service";
import { AppConstants } from "src/app/shared/constants/app-constants";
import { SettingService } from "../../services/setting.service";
import { BusinessClassifications } from "../../models/setting.model";

@Component({
  selector: "app-create-business-form",
  templateUrl: "./create-business-form.component.html"
})
export class CreateBusinessFormComponent
  implements OnInit, OnDestroy, OnChanges {
  @ViewChild("businessProfileForm", { static: false })
  businessProfileForm: NgForm;

  isLoadingTags: boolean;
  isLoadingFacilities: boolean;
  fileData: File = null;
  fileDataList: File[] = [];
  imageUrls: any[] = [];
  businessId: number;
  businessModel: any = {};
  primaryPhotoUrl: any;
  isApiSubmit: boolean;
  isMinMaxValue: boolean;
  priceRangeValues: number[] = [];

  activeTags: any[] = [];
  activeFacilities: any[] = [];
  tags: any[] = [];
  facilities: any[] = [];
  phone: string;
  email: string;

  businessTypeList: CommonType[] = [];
  businessType: CommonType = new CommonType();
  public businessClass: BusinessClassifications = new BusinessClassifications();
  public businessClassifications: BusinessClassifications[] = [];

  constructor(
    private toastr: ToastrManager,
    private sharedService: SharedDataService,
    private route: ActivatedRoute,
    private businessService: CreateBusinessService,
    private settingService: SettingService,
    private router: Router,
    private location: Location
  ) {
    this.isApiSubmit = false;
    this.isLoadingTags = false;
    this.isLoadingFacilities = false;
    this.priceRangeValues = [100, 5000];
  }

  ngOnInit() {
    this.businessModel.timeZoneOffsetInMillis =
      new Date().getTimezoneOffset() * 60 * 1000;

    this.route.params.subscribe(params => {
      this.businessId = +params["id"];
      this.businessModel.emails = [];
      this.businessModel.phones = [];

      // if business ID is exist this time Update mode. Other wise create business mode.
      if (this.businessId) {
        this.getBusinessById(this.businessId);
      } else {
        this.businessModel.defaultOpeningTime = "09:30:00";
        this.businessModel.defaultClosingTime = "22:30:00";
        this.getAllBusinessTags();
        this.getAllFacilitiesTags();
        this.getBusinessTypes();
        this.setPriceRangeOnModelChanges();
        this.getClassifications(null, null, "ACTIVE", "false");
      }
    });
  }

  setPriceRangeOnModelChanges(event?: any) {
    this.businessModel.priceRangeLower = this.priceRangeValues[0];
    this.businessModel.priceRangeUpper = this.priceRangeValues[1];
  }

  ngOnChanges(changes: SimpleChanges) { }

  chipsAdd(item: any) {
    item.isActive = !item.isActive;
    if (item.isActive) {
      this.activeTags.push(item.id);
    } else {
      let index = this.activeTags.indexOf(item.id);
      if (index != -1) {
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
      let index = this.activeFacilities.indexOf(item.id);
      if (index != -1) {
        this.activeFacilities.splice(index, 1);
      }
    }

    if (this.activeFacilities.length > 0) {
      this.businessModel.facilities = this.activeFacilities;
    }
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

        //Stop Facilities and Tags loading
        this.isLoadingTags = false;
        this.isLoadingFacilities = false;

        //Processing business Email
        for (let i = 0; i <= business.emails.length; i++) {
          let item = business.emails[i];
          if (item) {
            this.businessModel.emails.push(item.email);
          }
        }

        //Processing business Phone
        for (let j = 0; j <= business.phones.length; j++) {
          let item = business.phones[j];
          if (item) {
            this.businessModel.phones.push(item.phone);
          }
        }

        this.businessModel.name = business.name;
        this.businessModel.vatPercentage = Number(business.vatPercentage);
        this.businessModel.serviceChargePercentage = Number(
          business.serviceChargePercentage
        );

        this.businessModel.address = business.address;
        this.businessModel.latitude = business.latitude;
        this.businessModel.longitude = business.longitude;
        this.businessModel.details = business.details;
        this.businessModel.location = business.location;
        this.businessModel.capacity = business.capacity;

        this.businessModel.priceRangeLower = business.priceRangeLower;
        this.businessModel.priceRangeUpper = business.priceRangeUpper;
        this.priceRangeValues = [
          business.priceRangeLower ? business.priceRangeLower : 100,
          business.priceRangeUpper ? business.priceRangeUpper : 5000
        ];

        this.businessModel.defaultOpeningTime = business.defaultOpeningTime;
        this.businessModel.defaultClosingTime = business.defaultClosingTime;
        this.businessModel.primaryPhoto = business.primaryPhoto;
        this.businessModel.prefeexSharedPercentage =
          business.prefeexSharedPercentage;
        this.businessModel.vatPercentage = business.vatPercentage;
        this.businessModel.serviceChargePercentage =
          business.serviceChargePercentage;

        business.businessType.name = business.businessType.name.charAt(0).toUpperCase() + business.businessType.name.slice(1);
        this.businessType = business.businessType;

        this.businessModel.facilities = business.facilities;
        this.activeFacilities = [];
        if (business.facilities.length) {
          this.businessModel.facilities.forEach(obj => {
            this.activeFacilities.push(obj.id);
            const facility = this.facilities.find(item => item.id === obj.id);
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
            const tag = this.tags.find(item => item.id === obj.id);
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

  getBusinessTypes() {
    this.businessService.getBusinessType().subscribe(
      (res: any) => {
        this.businessTypeList = res.body.data.types;

        this.businessTypeList.forEach(value => {
          value.name = value.name.charAt(0).toUpperCase() + value.name.slice(1);
        });
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  private getClassifications(
    offset: string,
    limit: string,
    status?: string,
    paginate?: any
  ) {
    this.settingService
      .getClassifications(offset, limit, status, paginate)
      .subscribe(
        (res: any) => {
          this.businessClassifications = res.body.data.classifications;
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
  }

  getAllBusinessTags() {
    this.isLoadingTags = true;
    this.businessService.getBusinessesTags().subscribe(
      (res: any) => {
        res.body.data.tags.forEach(obj => {
          obj.isActive = false;
        });
        this.tags = res.body.data.tags;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
        this.isLoadingTags = false;
      },
      () => {
        this.isLoadingTags = false;
      }
    );
  }

  getAllFacilitiesTags() {
    this.isLoadingFacilities = true;
    this.businessService.getAllFacilitiesTags().subscribe(
      (res: any) => {
        res.body.data.facilities.forEach(obj => {
          obj.isActive = false;
        });
        this.facilities = res.body.data.facilities;
      },
      err => {
        this.isLoadingFacilities = false;
        this.toastr.errorToastr(err.error.message.en);
      },
      () => {
        this.isLoadingFacilities = false;
      }
    );
  }

  onSelectedFiles(photo: any) {
    if (photo.files.length > 0) {
      for (let file of photo.files) {
        this.fileDataList.push(<File>file);
        let reader = new FileReader();
        let newImage: any = {};
        reader.onload = (event: any) => {
          newImage.id = 0;
          newImage.photo = event.target.result;
          this.imageUrls.push(newImage);
        };
        reader.readAsDataURL(<File>file);
      }
    }
  }

  fileProcess(photo: any) {
    this.fileData = <File>photo.files[0];
    var reader = new FileReader();
    reader.onload = _event => {
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
      this.fileData
        ? this.sharedService.uploadMultipleImages(formData)
        : of(null),
      this.fileDataList.length
        ? this.sharedService.uploadMultipleImages(formDataMultiple)
        : of(null)
    ]).subscribe(
      (res: any) => {
        const singleFile = res[0];
        const multipleFile = res[1];
        if (singleFile) {
          this.businessModel.primaryPhoto =
            singleFile.body.data.results[0].Location;
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
        if (!this.businessId) {
          this.submitBusinessEntity(this.businessModel);
        } else {
          this.updateBusinessEntity(this.businessModel, this.businessId);
        }
      },
      (err: any) => {
        this.toastr.errorToastr("Image upload failed");
      }
    );
  }

  submitBusinessEntity(businessModel: any) {
    this.businessService.submitBusinessEntity(businessModel).subscribe(
      (res: any) => {
        this.succesMethodForUpdatingBusiness(res);
      },
      err => {
        this.errorMethodForUpdatingBusiness(err);
      },
      () => {
        this.isApiSubmit = false;
      }
    );
  }

  succesMethodForUpdatingBusiness(res) {
    this.toastr.successToastr(res.body.message.en);
    this.location.back();
  }

  errorMethodForUpdatingBusiness(err) {
    this.toastr.errorToastr(err.error.message.en);
    this.isApiSubmit = false;
  }

  updateBusinessEntity(businessModel: any, businessId: number) {
    this.businessService
      .updateBusinessEntity(businessModel, businessId)
      .subscribe(
        (res: any) => {
          this.succesMethodForUpdatingBusiness(res);
        },
        err => {
          this.errorMethodForUpdatingBusiness(err);
        },
        () => {
          this.isApiSubmit = false;
        }
      );
  }

  setBusinessTagFacilities() {
    this.businessModel.tags = this.activeTags;
    this.businessModel.facilities = this.activeFacilities;
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
    let exsitingItem = this.imageUrls[index];
    if (exsitingItem.id == 0) {
      this.fileDataList.splice(index, 1);
    }
    this.imageUrls.splice(index, 1);
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

  ngOnDestroy() { }
}

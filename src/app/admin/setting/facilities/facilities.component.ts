import { CommonType } from './../../../shared/models/common.model';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrManager } from "ng6-toastr-notifications";

import { SettingService } from '../../services/setting.service';
import { FacilitiesList, CreateFacilities, FacilityStatuses, UpdateFaciliyStatus } from '../../models/setting.model';


declare var jQuery: any;

@Component({
  selector: 'app-facilities',
  templateUrl: './facilities.component.html',
  styles: []
})
export class FacilitiesComponent implements OnInit {

  @ViewChild('FacilitiesModal', { static: false }) FacilitiesModal: ElementRef;
  subscription: Subscription;
  isLoading: boolean;
  isApiSubmit: boolean;

  allFacilities: FacilitiesList[];
  allFacilityStatuses: FacilityStatuses[];

  facilitiesModel: CreateFacilities = new CreateFacilities();
  updateFacilities: CreateFacilities = new CreateFacilities();

  updateFaciliyStatus: UpdateFaciliyStatus = new UpdateFaciliyStatus();
  facilitiesId: number;

  facilityGroup: CommonType = new CommonType();
  allFacilityGroup: CommonType[] = [];

  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

  constructor(
    private settingService: SettingService,
    private toastr: ToastrManager,
  ) {
    this.isLoading = false;
    this.isApiSubmit = false;
  }

  ngOnInit() {
    this.getAllFacilities(this.offset.toString(), this.limit.toString());
    this.getAllFacilityStatuses();
    this.getAllFacilityGroup();
  }

  getAllFacilities(offset: string, limit: string, loading?: boolean) {
    this.isLoading = loading == false ? loading : true;
    this.subscription = this.settingService.getAllFacilities(offset, limit).subscribe(
      (res: any) => {
        this.allFacilities = res.body.data.facilities;
        this.totalCount = res.body.data.count;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      });
  }

  getAllFacilityGroup() {
    this.settingService.getAllFacilityGroup(null, null, 'ACTIVE', 'false').subscribe(
      (res: any) => {
        res.body.data.facilityGroups.forEach(item => {
          let obj = {} as CommonType;
          obj.id = item.id;
          obj.name = item.name;
          this.allFacilityGroup.push(obj);
        });
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      });
  }

  getAllFacilityStatuses() {
    this.subscription = this.settingService.getAllFacilityStatuses().subscribe(
      (res: any) => {
        this.allFacilityStatuses = res.body.data.facilityStatuses;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      },
      () => { }
    );
  }

  updateFacilityModal(facilityId: any) {
    if (facilityId) {
      this.settingService.getParticularFacility(facilityId).subscribe(
        (res: any) => {
          const facility = res.body.data.facility;
          this.facilitiesId = facility.id;
          this.facilitiesModel.name = facility.name;
          this.facilitiesModel.facilityGroupId = facility.facilityGroupId;
          jQuery(this.FacilitiesModal.nativeElement).modal('show');
        },
        (err: any) => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
    }
  }

  createFacilityModal() {
    this.facilitiesModel = new CreateFacilities();
    jQuery(this.FacilitiesModal.nativeElement).modal('show');
  }

  statusChangesAction(statusId, facility: FacilitiesList) {
    let facilityStatus = this.allFacilityStatuses.find(item => {
      return item.id === parseInt(statusId);
    }).name;

    if (facilityStatus) {
      this.updateFaciliyStatus.facilityStatus = facilityStatus;
      this.settingService
        .updateFacility(facility.id, this.updateFaciliyStatus)
        .subscribe(
          (res: any) => {
            facility.facilityStatus.name = facilityStatus;
            this.toastr.successToastr(res.body.message.en);
          },
          err => {
            facility.facilityStatus.name = facility.facilityStatus.name;
            this.toastr.errorToastr(err.error.message.en);
          }
        );
    }
  }

  paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.getAllFacilities(this.offset.toString(), this.limit.toString(), false);
  }


  submitFacilities(facilities: NgForm) {
    if (!this.facilitiesId) {
      if (facilities.valid) {
        this.facilitiesModel.name = facilities.value.name;
        this.isApiSubmit = true;
        this.settingService.createNewFacility(this.facilitiesModel).subscribe(
          (res: any) => {
            this.toastr.successToastr(res.body.message.en);
            this.getAllFacilities(this.offset.toString(), this.limit.toString());
            jQuery(this.FacilitiesModal.nativeElement).modal('hide');
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
    } else {
      if (facilities.valid) {
        this.isApiSubmit = true;
        this.settingService.updateFacility(this.facilitiesId, this.facilitiesModel).subscribe(
          (res: any) => {
            this.toastr.successToastr(res.body.message.en);
            this.getAllFacilities(this.offset.toString(), this.limit.toString());
            jQuery(this.FacilitiesModal.nativeElement).modal('hide');
          },
          (err: any) => {
            this.isApiSubmit = false;
            this.facilitiesId = null;
            this.toastr.errorToastr(err.error.message.en);
          },
          () => {
            this.isApiSubmit = false;
            this.facilitiesId = null;
          }
        );
      }
    }
  }

  setGroupId(groupId: number) {
    this.facilitiesModel.facilityGroupId = groupId;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}

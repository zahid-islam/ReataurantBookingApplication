import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrManager } from "ng6-toastr-notifications";

import { SettingService } from '../../services/setting.service';
import { FacilityGroupItem, CreateFacilityGroup, FacilityGroupStatuses, UpdateFacilityGroupStatus } from '../../models/setting.model';
declare var jQuery: any;

@Component({
  selector: 'app-facility-group',
  templateUrl: './facility-group.component.html',
  styles: []
})
export class FacilityGroupComponent implements OnInit {

  @ViewChild('facilityGrooupModal', { static: false }) facilityGrooupModal: ElementRef;
  subscription: Subscription;
  isLoading: boolean;
  isApiSubmit: boolean;

  allFacilityGroup: FacilityGroupItem[];
  allFacilityGroupStatuses: FacilityGroupStatuses[];

  facilityGroupModel: CreateFacilityGroup = new CreateFacilityGroup();
  updateFacilities: CreateFacilityGroup = new CreateFacilityGroup();

  updateFacilityGroupStatus: UpdateFacilityGroupStatus = new UpdateFacilityGroupStatus();
  facilityGroupId: number;

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
    this.getAllFacilityGroup(this.offset.toString(), this.limit.toString());
    this.getAllFacilityGroupStatuses();
  }

  getAllFacilityGroup(offset: string, limit: string, loading?: boolean) {
    this.isLoading = loading == false ? loading : true;
    this.subscription = this.settingService.getAllFacilityGroup(offset, limit).subscribe(
      (res: any) => {
        this.allFacilityGroup = res.body.data.facilityGroups;
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

  getAllFacilityGroupStatuses() {
    this.subscription = this.settingService.getAllFacilityGroupStatuses().subscribe(
      (res: any) => {
        this.allFacilityGroupStatuses = res.body.data.facilityGroupStatuses;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  updateFacilityModal(facilityGroupId: any) {
    if (facilityGroupId) {
      this.settingService.getParticularFacilityGroup(facilityGroupId).subscribe(
        (res: any) => {
          const facilityGrp = res.body.data.facilityGroup;
          this.facilityGroupId = facilityGrp.id;
          this.facilityGroupModel.name = facilityGrp.name;
          jQuery(this.facilityGrooupModal.nativeElement).modal('show');
        },
        (err: any) => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
    }
  }

  createFacilityGroupModal() {
    this.facilityGroupId = null;
    this.facilityGroupModel = new CreateFacilityGroup();
    jQuery(this.facilityGrooupModal.nativeElement).modal('show');
  }

  statusChangesAction(statusId, facility: FacilityGroupItem) {
    let facilityGrpStatusName = this.allFacilityGroupStatuses.find(item => {
      return item.id === parseInt(statusId);
    }).name;

    if (facilityGrpStatusName) {
      this.updateFacilityGroupStatus.status = facilityGrpStatusName;
      this.settingService
        .updateFacilityGroup(facility.id, this.updateFacilityGroupStatus)
        .subscribe(
          (res: any) => {
            facility.facilityGroupStatus.name = facilityGrpStatusName;
            this.toastr.successToastr(res.body.message.en);
          },
          err => {
            facility.facilityGroupStatus.name = facility.facilityGroupStatus.name;
            this.toastr.errorToastr(err.error.message.en);
          }
        );
    }
  }

  paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.getAllFacilityGroup(this.offset.toString(), this.limit.toString(), false);
  }


  submitFacilityGroup(facilityGroup: NgForm) {
    if (!this.facilityGroupId) {
      if (facilityGroup.valid) {
        this.facilityGroupModel.name = facilityGroup.value.name;
        this.isApiSubmit = true;
        this.settingService.createNewFacilityGroup(this.facilityGroupModel).subscribe(
          (res: any) => {
            this.toastr.successToastr(res.body.message.en);
            this.getAllFacilityGroup(this.offset.toString(), this.limit.toString());
            jQuery(this.facilityGrooupModal.nativeElement).modal('hide');
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
      if (facilityGroup.valid) {
        this.isApiSubmit = true;
        this.settingService.updateFacilityGroup(this.facilityGroupId, facilityGroup.value).subscribe(
          (res: any) => {
            this.toastr.successToastr(res.body.message.en);
            this.getAllFacilityGroup(this.offset.toString(), this.limit.toString());
            jQuery(this.facilityGrooupModal.nativeElement).modal('hide');
          },
          (err: any) => {
            this.isApiSubmit = false;
            this.facilityGroupId = null;
            this.toastr.errorToastr(err.error.message.en);
          },
          () => {
            this.isApiSubmit = false;
            this.facilityGroupId = null;
          }
        );
      }
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}

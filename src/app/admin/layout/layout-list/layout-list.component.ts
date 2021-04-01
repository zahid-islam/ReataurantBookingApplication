import { CommonType } from './../../../shared/models/common.model';
import { Component, OnInit } from '@angular/core';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ShapeService } from './../service/shape.service';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { SharedDataService } from './../../../shared/services/shared-data.service';

interface ILayout {
  id: number;
  floorName: string;
  svgUrl: string;
  businessFloorPlanStatus: CommonType;
}
@Component({
  selector: 'app-layout-list',
  templateUrl: './layout-list.component.html',
  styles: []
})
export class LayoutListComponent implements OnInit {

  public businessId: number;
  floorPlans: ILayout[] = [];
  floorStatuses: any = [];
  floorStatusBody: any = {};

  constructor(public shapeService: ShapeService,
    private toastr: ToastrManager,
    private router: Router,
    private platformLocation: PlatformLocation,
    private sharedService: SharedDataService) { }

  ngOnInit() {
    this.getFloorPlanStatuses();
    let fullPath = this.platformLocation.href;
    this.businessId = this.sharedService.getBusinessIdFromUrl(fullPath);
    if (this.businessId) {
      this.getAllFloorPlanUnderBusiness();
    }
  }

  getAllFloorPlanUnderBusiness() {
    this.shapeService.getAllFloorPlanUnderBusiness(this.businessId).subscribe(
      (res: any) => {
        res.floorPlans.forEach(item => {
          let floor: ILayout = {} as ILayout;
          floor.floorName = item.floorName;
          floor.id = item.id;
          floor.svgUrl = item.svgUrl;
          floor.businessFloorPlanStatus = item.businessFloorPlanStatus;
          this.floorPlans.push(floor);
        });
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  getFloorPlanStatuses() {
    this.shapeService.getFloorPlanStatuses().subscribe(
      (res: any) => {
        this.floorStatuses = res.body.data.businessFloorPlanStatuses;
      },
      err => {
        this.toastr.errorToastr(err.error);
      }
    );
  }

  statusChangesAction(statusId, floor: any) {
    let floorStatus = this.floorStatuses.find(item => {
      return item.id === parseInt(statusId);
    }).name;

    if (floorStatus) {
      this.floorStatusBody.status = floorStatus;
      this.shapeService.updateBusinessFloorPlanStatuses(this.floorStatusBody, this.businessId, floor.id).subscribe(
        (res: any) => {
          this.toastr.successToastr(res.body.message.en);
        },
        err => {
          let id = this.floorStatuses.find(item => {
            return item.name === floor.businessFloorPlanStatus.name;
          }).id;
          floor.businessFloorPlanStatus.id = Number(id);
          this.toastr.errorToastr(err.error.message.en);
        }
      );
    }
  }

  goToFloorUpdatePage(actionData: string, floorId: number) {
    if (actionData) {
      this.router.navigate([`/admin/business/manage-business/${this.businessId}/layout/layout-list/floor/`,
      btoa(JSON.stringify({ floorId: floorId, action: actionData }))]);
    }
  }

  goToFloorCreatePage(actionData: string) {
    if (actionData) {
      this.router.navigate([`/admin/business/manage-business/${this.businessId}/layout/layout-list/floor/create`,
      btoa(JSON.stringify({ action: actionData }))]);
    }
  }

}

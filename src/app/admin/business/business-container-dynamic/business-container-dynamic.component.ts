import { PlatformLocation } from "@angular/common";
import { Component, OnInit } from "@angular/core";

import { SharedDataService } from "../../../shared/services/shared-data.service";

import { ProfileContainerDynamicComponent } from "./profile-container-dynamic.component";
import { LayoutContainerDynamicComponent } from "./layout-container-dynamic.component";
import { MenuContainerDynamicComponent } from "./menu-container-dynamic.component";
import { ReviewsComponent } from "../reviews/reviews.component";
import { BusinessActivitiesComponent } from "../business-activities/business-activities.component";

@Component({
  selector: "app-business-container-dynamic",
  templateUrl: "./business-container-dynamic.component.html"
})
export class BusinessContainerDynamicComponent implements OnInit {
  businessId: number;

  constructor(
    private platformLocation: PlatformLocation,
    private sharedService: SharedDataService
  ) {}

  ngOnInit() {
    const fullPath = this.platformLocation.href;
    this.businessId = this.sharedService.getBusinessIdFromUrl(fullPath);
  }
}

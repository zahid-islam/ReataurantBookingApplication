import { UtilityService } from './../../../shared/services/utility.service';
import { UserModel } from './../../../user/models/user.model';
import { Component, OnInit } from "@angular/core";
import { ToastrManager } from "ng6-toastr-notifications";
import { Router, ActivatedRoute } from "@angular/router";
import {
  CreateBusiness,
  BusinessType,
  Business
} from "./../../models/business.model";
import { CreateBusinessService } from "./../../services/create-business.service";

@Component({
  selector: "app-business-profile",
  templateUrl: "./business-profile.component.html",
  styles: []
})
export class BusinessProfileComponent implements OnInit {
  businesId: number;
  businessProfile: Business = new Business();
  isBusinessMainImgLoading: boolean;
  isImgLoading: boolean;
  internalUser: UserModel = new UserModel();

  constructor(
    private businessService: CreateBusinessService,
    private toastr: ToastrManager,
    private route: ActivatedRoute,
    private utility: UtilityService,
    private router: Router
  ) {
    this.isBusinessMainImgLoading = true;
    this.isImgLoading = true;
  }

  ngOnInit() {
    this.internalUser = this.utility.getUserPayload();
    this.route.params.subscribe(params => {
      this.businesId = +params["id"];
      if (this.businesId) {
        this.getBusinessById(this.businesId);
      }
    });
  }
  onLoadMainImage() {
    this.isBusinessMainImgLoading = false;
  }

  onLoad() {
    this.isImgLoading = false;
  }
  /**
   * getBusinessById
   */
  public getBusinessById(id: number) {
    this.businessService.getBusinessesById(id).subscribe(
      (res: any) => {
        this.businessProfile = res.body.data.business;
        if (this.businessProfile.photos.length == 0) {
          this.isImgLoading = false;
        }
      },
      err => {
        this.isImgLoading = false;
        if (this.internalUser.userType.name === 'SALES') {
          this.router.navigate(["/admin/sales/create-business"]);
        }
        else {
          this.router.navigate(["/admin/business"]);
        }
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }
}

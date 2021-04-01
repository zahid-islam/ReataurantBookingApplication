import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { Subscription, forkJoin } from "rxjs";
import { ToastrManager } from "ng6-toastr-notifications";

import { SettingService } from "../../services/setting.service";
import {
  BusinessClassificationsModel,
  BusinessClassifications
} from "../../models/setting.model";
import { SharedDataService } from "../../../shared/services/shared-data.service";
import { CommonType } from "../../../shared/models/common.model";
import { UtilityService } from "../../../shared/services/utility.service";

declare var jQuery: any;

@Component({
  selector: "app-business-classification",
  templateUrl: "./business-classification.component.html",
  styles: []
})
export class BusinessClassificationComponent implements OnInit, OnDestroy {
  @ViewChild("BusinessClassificationsModal", { static: false })
  BusinessClassificationsModal: ElementRef;
  private subscription: Subscription;
  public isLoading: boolean;
  public isApiSubmit: boolean;
  public businessClassifications: BusinessClassifications[] = [];
  public businessClassificationsStatuses: CommonType[] = [];
  public businessClassificationsModel: BusinessClassificationsModel = new BusinessClassificationsModel();
  public UpdatebusinessClassificationsModel: BusinessClassificationsModel = new BusinessClassificationsModel();
  public statusForFilter: number;
  public statusName: string;
  public businessClassificationsID: number;

  // paginate
  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

  constructor(
    private settingService: SettingService,
    private toastr: ToastrManager,
    private sharedService: SharedDataService,
    private utility: UtilityService
  ) {}

  ngOnInit() {
    this.isLoading = false;
    this.isApiSubmit = false;
    this.statusForFilter = 0;

    this.getClassifications(this.offset.toString(), this.limit.toString());
  }

  private getClassifications(
    offset: string,
    limit: string,
    status?: string,
    paginate?: any
  ) {
    this.isLoading = this.isLoading === false ? this.isLoading : true;

    this.subscription = forkJoin([
      this.settingService.getClassifications(offset, limit, status, paginate),
      this.settingService.getClassificationStatuses()
    ]).subscribe(
      (res: any) => {
        this.businessClassifications = res[0].body.data.classifications;
        this.totalCount = res[0].body.data.count;

        this.businessClassificationsStatuses = res[1].body.data.statuses;
      },
      err => {
        this.isLoading = false;
        this.toastr.errorToastr(err.error.message.en);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  filterBusinessClassificationsOnStatusChange(statusID: number) {
    this.statusForFilter = statusID;
    this.statusName = this.utility.getStatusNameById(
      this.businessClassificationsStatuses,
      statusID
    );

    this.getClassifications(
      this.offset.toString(),
      this.limit.toString(),
      this.statusName
    );
  }

  paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.getClassifications(
      this.offset.toString(),
      this.limit.toString(),
      this.statusName
    );
  }

  popupBusinessClassCreateModal() {
    this.businessClassificationsModel = new BusinessClassificationsModel();
    jQuery(this.BusinessClassificationsModal.nativeElement).modal("show");
  }

  popupBusinessClassUpdateModal(
    businessClassifications: BusinessClassifications
  ) {
    this.businessClassificationsID = businessClassifications.id;
    this.businessClassificationsModel.name = businessClassifications.name;
    this.businessClassificationsModel.status =
      businessClassifications.classificationStatus.name;
    jQuery(this.BusinessClassificationsModal.nativeElement).modal("show");
  }

  submitBusinessClassification(businessClassModel: NgForm) {
    if (this.businessClassificationsID) {
      this.isApiSubmit = true;
      this.settingService
        .updateClassification(
          this.businessClassificationsID,
          this.businessClassificationsModel
        )
        .subscribe(
          (res: any) => {
            this.toastr.successToastr(res.body.message.en);
            this.businessClassificationsID = null;
            this.businessClassificationsModel = new BusinessClassificationsModel();
            jQuery(this.BusinessClassificationsModal.nativeElement).modal(
              "hide"
            );
            this.getClassifications(
              this.offset.toString(),
              this.limit.toString(),
              this.statusName
            );
          },
          (err: any) => {
            this.isApiSubmit = false;
            this.toastr.errorToastr(err.error.message.en);
          },
          () => {
            this.isApiSubmit = false;
          }
        );
    } else {
      this.isApiSubmit = true;
      this.settingService
        .createClassification(this.businessClassificationsModel)
        .subscribe(
          (res: any) => {
            this.toastr.successToastr(res.body.message.en);
            this.businessClassificationsID = null;
            jQuery(this.BusinessClassificationsModal.nativeElement).modal(
              "hide"
            );
            this.getClassifications(
              this.offset.toString(),
              this.limit.toString(),
              this.statusName
            );
          },
          (err: any) => {
            this.isApiSubmit = false;
            this.toastr.errorToastr(err.error.message.en);
          },
          () => {
            this.isApiSubmit = false;
          }
        );
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

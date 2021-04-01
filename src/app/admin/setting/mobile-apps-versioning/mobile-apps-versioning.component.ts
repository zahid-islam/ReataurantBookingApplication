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
  AppVersionings,
  CreateAppVersioning,
  UpdateAppVersioningStatus
} from "../../models/setting.model";
import { SharedDataService } from "../../../shared/services/shared-data.service";
import { CommonType } from "src/app/shared/models/common.model";
import { UtilityService } from "src/app/shared/services/utility.service";

declare var jQuery: any;

@Component({
  selector: "app-mobile-apps-versioning",
  templateUrl: "./mobile-apps-versioning.component.html",
  styles: []
})
export class MobileAppsVersioningComponent implements OnInit, OnDestroy {
  @ViewChild("CreateAppsVersionModal", { static: false })
  CreateAppsVersionModal: ElementRef;
  private subscription: Subscription;
  public isLoading: boolean;
  public isApiSubmit: boolean;
  public appVersionings: AppVersionings[] = [];
  public appVersioningStatuses: CommonType[] = [];
  public appVersionModel: CreateAppVersioning = new CreateAppVersioning();
  public UpdateAppVersioningStatus: UpdateAppVersioningStatus = new UpdateAppVersioningStatus();
  public appVersioningStatusName: string;
  public clientPlatformName: string;

  statusForFilter: number;
  clientPlatformForFilter: string;
  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;
  sortedString: string;

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
    this.clientPlatformForFilter = "All";
    this.sortedString = "buildNumber:desc";

    this.getAllAppVersioning(this.offset.toString(), this.limit.toString(), this.appVersioningStatusName, this.clientPlatformName, this.sortedString);
  }

  private getAllAppVersioning(
    offset: string,
    limit: string,
    status?: string,
    clientPlatform?: any,
    sort?: any,
    forced?: any
  ) {
    this.isLoading = this.isLoading === false ? this.isLoading : true;

    this.subscription = forkJoin([
      this.settingService.getAllAppVersioning(
        offset,
        limit,
        status,
        clientPlatform,
        sort,
        forced
      ),
      this.settingService.getAllAppVersioningStatuses()
    ]).subscribe(
      (res: any) => {
        this.appVersionings = res[0].body.data.appVersionings;
        this.totalCount = res[0].body.data.count;

        this.appVersioningStatuses = res[1].body.data.appVersioningStatuses;
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

  updateAppVersioningStatus(statusID: number, appVersioning: AppVersionings) {
    this.appVersioningStatusName = this.utility.getStatusNameById(
      this.appVersioningStatuses,
      statusID
    );
    if (this.appVersioningStatusName) {
      this.UpdateAppVersioningStatus.status = this.appVersioningStatusName;
      this.settingService
        .updateAppVersioningStatus(
          appVersioning.id,
          this.UpdateAppVersioningStatus
        )
        .subscribe(
          (res: any) => {
            appVersioning.appVersioningStatus.name = this.appVersioningStatusName;
            this.toastr.successToastr(res.body.message.en);
          },
          err => {
            appVersioning.appVersioningStatus.name = this.appVersioningStatusName;
            this.toastr.errorToastr(err.error.message.en);
          }
        );
    }
  }

  filterAppVersioningOnStatusChange(statusID: number) {
    this.statusForFilter = statusID;
    this.appVersioningStatusName = this.utility.getStatusNameById(
      this.appVersioningStatuses,
      statusID
    );

    this.getAllAppVersioning(
      this.offset.toString(),
      this.limit.toString(),
      this.appVersioningStatusName,
      this.clientPlatformName,
      this.sortedString
    );
  }

  filterAppVersioningOnClientPlatformChange(clientPlatformChange: string) {
    this.clientPlatformForFilter = clientPlatformChange;
    this.clientPlatformName =
      clientPlatformChange !== "All" ? clientPlatformChange : null;
    this.getAllAppVersioning(
      this.offset.toString(),
      this.limit.toString(),
      this.appVersioningStatusName,
      this.clientPlatformName,
      this.sortedString
    );
  }

  paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.getAllAppVersioning(
      this.offset.toString(),
      this.limit.toString(),
      this.appVersioningStatusName,
      this.clientPlatformName,
      this.sortedString
    );
  }

  // Create

  popupAppVersioningCreateModal() {
    this.appVersionModel = new CreateAppVersioning();
    this.appVersionModel.forced = "forcedNoVal";
    jQuery(this.CreateAppsVersionModal.nativeElement).modal("show");
  }

  createAppVersioning(appVersioning: NgForm) {
    if (appVersioning.valid) {
      const forcedValue = appVersioning.value.forced;
      this.isApiSubmit = true;
      this.appVersionModel.forced =
        appVersioning.value.forced === "forcedYesVal" ? true : false;

      console.log(this.appVersionModel);
      this.settingService.createAppVersioning(this.appVersionModel).subscribe(
        (res: any) => {
          this.toastr.successToastr(res.body.message.en);
        },
        err => {
          this.isApiSubmit = false;
          this.appVersionModel.forced = forcedValue;
          this.toastr.errorToastr(err.error.message.en);
        },
        () => {
          this.isApiSubmit = false;
          jQuery(this.CreateAppsVersionModal.nativeElement).modal("hide");
          this.getAllAppVersioning(
            this.offset.toString(),
            this.limit.toString(),
            this.appVersioningStatusName,
            this.clientPlatformName,
            this.sortedString
          );
        }
      );
    } else {
      this.toastr.warningToastr("Invalid App Versioning Form");
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

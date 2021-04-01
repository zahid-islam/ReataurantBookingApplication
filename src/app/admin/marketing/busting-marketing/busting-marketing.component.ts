import { ToastrManager } from "ng6-toastr-notifications";
import { MarketingService } from "./../../../shared/services/marketing.service";
import { SharedDataService } from "./../../../shared/services/shared-data.service";
import { MarketingNotification } from "./../../../shared/models/marketing.model";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
@Component({
  selector: "app-busting-marketing",
  templateUrl: "./busting-marketing.component.html",
  styles: []
})
export class BustingMarketingComponent implements OnInit {

  @ViewChild("myCalendar", { static: false }) datePicker;

  private subscribeParam: any;
  isApiSubmit: boolean;
  isApiSubmitSchedule: boolean;
  fileData: File = null;
  imagePath: any;
  imgURL: any;
  notification: MarketingNotification = new MarketingNotification();

  description: string = "";
  bustingTab: string = "";

  notificationID: number;

  isActiveNotification: boolean;
  isActivepSMS: boolean;
  isActiveEmail: boolean;

  isVisibleScheduleAtModal: boolean = false;
  minDate: Date = new Date();
  scheduledAt: Date;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sharedService: SharedDataService,
    private marketingService: MarketingService,
    private toastr: ToastrManager
  ) {
    this.isApiSubmit = false;
    this.isApiSubmitSchedule = false;
  }

  ngOnInit() {
    if (history.state.data) {
      this.notification.userIds = history.state.data;
      this.route.params.subscribe(params => {
        this.notificationID = +params["ntfId"];
        if (this.notificationID) {
          this.getMarketingPushNotificcationDetails(this.notificationID);
        }
      });
    } else {
      this.route.params.subscribe(params => {
        this.notificationID = +params["ntfId"];
        if (this.notificationID) {
          this.router.navigate([
            `admin/marketing/notifications/notifications-list/${this.notificationID}/update`
          ]);
        } else {
          this.router.navigate([
            `admin/marketing/notifications/notifications-list`
          ]);
        }
      });
    }
  }

  hideCalendarSelector() {
    this.datePicker.overlayVisible = false;
  }

  private getMarketingPushNotificcationDetails(notificationID: number) {
    this.marketingService
      .getMarketingPushNotificcationDetails(notificationID)
      .subscribe(
        (res: any) => {
          const notificationDetails = res.body.data.notification;
          this.notification.title = notificationDetails.title;
          this.notification.body = notificationDetails.body;
          this.description = notificationDetails.data.description;
          this.notification.scheduledAt = notificationDetails.scheduledAt;
          this.imgURL = notificationDetails.data.image;

          if (notificationDetails.scheduledAt) {
            let date = new Date(notificationDetails.scheduledAt);
            let schedDate =
              date.getTime() - date.getTimezoneOffset() * 60 * 1000;
            this.scheduledAt = new Date(schedDate);
          }
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
  }

  fileProcess(photo: any) {
    this.fileData = <File>photo.files[0];
    var reader = new FileReader();
    this.imagePath = <File>photo.files;
    reader.readAsDataURL(this.fileData);
    reader.onload = _event => {
      this.imgURL = reader.result ? reader.result : null;
    };
  }

  createMarketingPushNotification() {
    if (!this.notificationID) {
      if (this.fileData) {
        this.isApiSubmit = true;
        const formData = new FormData();
        formData.append("files", this.fileData);
        this.sharedService.uploadMultipleImages(formData).subscribe(
          (res: any) => {
            this.notification.data.image = res.body.data.results[0].Location;
            this.notification.data.description = this.description;
            if (this.scheduledAt) {
              let dat = this.scheduledAt;
              let date = new Date(dat);
              this.notification.scheduledAt = date.getTime();
            }
            this.marketingService
              .createMarketingPushNotification(this.notification)
              .subscribe(
                (res: any) => {
                  this.toastr.successToastr(res.body.message.en);
                  this.isApiSubmit = false;
                  this.router.navigate(["/admin/marketing/notifications"]);
                },
                (err: any) => {
                  this.isApiSubmit = false;
                  this.toastr.errorToastr(err.error.message.en);
                },
                () => {
                  this.isApiSubmit = false;
                }
              );
          },
          (err: any) => {
            this.toastr.errorToastr("Image upload failed");
          }
        );
        this.isVisibleScheduleAtModal = false;
      } else {
        this.isApiSubmit = true;
        if (this.scheduledAt) {
          let dat = this.scheduledAt;
          let date = new Date(dat);
          this.notification.scheduledAt = date.getTime();
        }
        this.notification.data.description = this.description;
        this.marketingService
          .createMarketingPushNotification(this.notification)
          .subscribe(
            (res: any) => {
              this.toastr.successToastr(res.body.message.en);
              this.isApiSubmit = false;
              this.router.navigate(["/admin/marketing/notifications"]);
            },
            (err: any) => {
              this.isApiSubmit = false;
              this.toastr.errorToastr(err.error.message.en);
            },
            () => {
              this.isApiSubmit = false;
            }
          );
        this.isVisibleScheduleAtModal = false;
      }
    } else {
      if (this.fileData) {
        this.isApiSubmitSchedule = true;
        const formData = new FormData();
        formData.append("files", this.fileData);
        this.sharedService.uploadMultipleImages(formData).subscribe(
          (res: any) => {
            this.notification.data.image = res.body.data.results[0].Location;
            this.notification.data.description = this.description;
            if (this.scheduledAt) {
              let dat = this.scheduledAt;
              let date = new Date(dat);
              this.notification.scheduledAt = date.getTime();
            }
            this.marketingService
              .updatePendingNotification(this.notificationID, this.notification)
              .subscribe(
                (res: any) => {
                  this.toastr.successToastr(res.body.message.en);
                  this.isApiSubmitSchedule = false;
                  this.router.navigate(["/admin/marketing/notifications"]);
                },
                (err: any) => {
                  this.isApiSubmitSchedule = false;
                  this.toastr.errorToastr(err.error.message.en);
                },
                () => {
                  this.isApiSubmitSchedule = false;
                }
              );
          },
          (err: any) => {
            this.toastr.errorToastr("Image upload failed");
          }
        );
        this.isVisibleScheduleAtModal = false;
      } else {
        this.isApiSubmitSchedule = true;
        if (this.scheduledAt) {
          let dat = this.scheduledAt;
          let date = new Date(dat);
          this.notification.scheduledAt = date.getTime();
        }
        this.notification.data.description = this.description;
        this.notification.data.image = this.imgURL;

        this.marketingService
          .updatePendingNotification(this.notificationID, this.notification)
          .subscribe(
            (res: any) => {
              this.toastr.successToastr(res.body.message.en);
              this.isApiSubmitSchedule = false;
              this.router.navigate(["/admin/marketing/notifications"]);
            },
            (err: any) => {
              this.isApiSubmitSchedule = false;
              this.toastr.errorToastr(err.error.message.en);
            },
            () => {
              this.isApiSubmitSchedule = false;
            }
          );
        this.isVisibleScheduleAtModal = false;
      }
    }
  }

  showDialogueForSubmitPushNotification() {
    this.isVisibleScheduleAtModal = true;
  }
}

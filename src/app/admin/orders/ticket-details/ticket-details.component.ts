import { UtilityService } from './../../../shared/services/utility.service';
import { UserModel } from './../../../user/models/user.model';
import { AppConstants } from './../../../shared/constants/app-constants';
import { Activitiy, Orders, FoodItem } from './../../../shared/models/orders.model';
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ToastrManager } from "ng6-toastr-notifications";
import { Router, ActivatedRoute } from "@angular/router";
import { OrdersService } from "../../../shared/services/orders.service";
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
@Component({
  selector: "app-ticket-details",
  templateUrl: "./ticket-details.component.html",
})
export class TicketDetailsComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  timerIdForTicket: any;
  timerIdForActivity: any;
  ticketRefId: string = null;
  ticketDetails: any;
  orderDetails: Orders = new Orders();
  noteActivity: any = {};
  allActivities: any = [];
  isInvoiceCollapse: boolean = false;

  currentTicketStatus: string;
  isTicketStatusResolved: boolean;

  waitngTimes: any;
  selectedWaitingTime: string = '05';

  isVisibleConfirmationModal: boolean = false;
  isVisibleLeaveModalWhenPaid: boolean = false;

  //showing reassign button
  isReassignShow: boolean = false;

  subTotal: number = 0;
  netTotal: number = 0;
  eachUnitPriceTotalWithAddons = [];
  foodItemList: FoodItem[] = [];
  totalAmount: number;
  isExpiryScheduledAt: boolean;
  userType: string;
  userId: number;

  constructor(
    private orderService: OrdersService,
    private toastr: ToastrManager,
    private route: ActivatedRoute,
    private router: Router,
    private utility: UtilityService
  ) { }

  ngOnInit() {
    let user: UserModel = this.utility.getUserPayload();
    this.userType = user.userType.name;
    this.userId = user.id;

    this.isTicketStatusResolved = false;
    this.isExpiryScheduledAt = false;
    this.subscription = this.route.params.subscribe(params => {
      this.ticketRefId = params["id"];
      if (this.ticketRefId) {
        this.getTicketById(this.ticketRefId);
      }
    });
    this.waitngTimes = ['05', '10', '15', '20', '25', '30'];
    this.getAllActivityUnderAticket();
    this.getTicketByIdAfterTenSecond();
    this.getAllActivityUnderAticketAfterTenSecond();
  }

  hideButtonIfNotValidToShow() {
    let assignedId = this.ticketDetails ? this.ticketDetails.assignedTo : 0;
    if (!this.isExpiryScheduledAt && !this.isTicketStatusResolved && this.userId === assignedId) {
      return true;
    }
    else {
      return false;
    }
  }

  getAllActivityUnderAticket() {
    this.orderService.getAllActivityUnderAticket(this.ticketRefId).subscribe(
      (res: any) => {
        this.allActivities = [];
        res.body.data.activities.forEach(activity => {
          let item = new Activitiy();
          item.id = activity.id;
          item.createdAt = activity.createdAt;
          item.isPerformedBySystem = activity.isPerformedBySystem;
          item.ticketStatus = activity.ticketStatus.name;

          item.note = activity.note;
          item.waitTime = activity.waitTime;

          item.performerEmail = activity.performer ? activity.performer.email : null;
          item.userType = activity.performer ? activity.performer.userType.name : null;
          item.performerFirstName = activity.performer ? activity.performer.firstName : null;
          item.performerLastName = activity.performer ? activity.performer.lastName : null;

          item.assigneeEmail = activity.assignee ? activity.assignee.email : null;
          item.assigneeFirstName = activity.assignee ? activity.assignee.firstName : null;
          item.assigneeLastName = activity.assignee ? activity.assignee.lastName : null;

          if (item.assigneeEmail == null && item.performerEmail && item.ticketStatus == 'PENDING') {
            item.message = 'Ticket created by <b>SYSTEM</b>';
          }
          else if (item.assigneeEmail && item.performerEmail &&
            (item.ticketStatus == 'PENDING' || item.ticketStatus == 'WAITING_FOR_B2B'
              || item.ticketStatus == 'B2C_PENDING' || item.ticketStatus == 'WAITING_FOR_B2C')) {
            item.message = `Ticket assigned to <b>${item.assigneeEmail}</b> by <b>${item.performerEmail}</b>`;
          }
          else if (item.assigneeEmail && item.performerEmail &&
            (item.ticketStatus == 'B2B_INPROGRESS' || item.ticketStatus == 'B2C_INPROGRESS')) {
            item.message = `Ticket moved to <b>${item.ticketStatus}</b> by <b>${item.performerEmail}</b>`;
          }
          else if (item.note && item.assigneeEmail == null &&
            (item.ticketStatus == 'B2B_INPROGRESS' || item.ticketStatus == 'B2C_INPROGRESS')) {
            item.message = `${item.note} added by <b>${item.performerEmail}</b>`;
          }
          else if (item.waitTime) {
            let time = Number(item.waitTime) / (60 * 1000);
            item.message = `<b>${time}</b> minute wait time added by <b>${item.performerEmail}</b>`;
          }
          else if (item.performerEmail && item.assigneeEmail == null && item.ticketStatus == 'B2C_PENDING') {
            item.message = `Ticket moved to <b>${item.ticketStatus}</b> by <b>${item.performerEmail}</b>`;
          }
          else if (item.assigneeEmail == null && item.ticketStatus == 'WAITING_FOR_RESOLVED') {
            item.message = `Ticket moved to <b>${item.ticketStatus}</b> by <b>${item.performerEmail}</b>`;
          }
          else if (item.userType == 'END_USER' && item.ticketStatus == 'RESOLVED') {
            item.message = `Ticket moved to <b>${item.ticketStatus}</b> by <b>END_USER: ${item.performerEmail}</b>`;
          }
          else if (item.userType == 'BUSINESS' && item.ticketStatus == 'RESOLVED') {
            item.message = `Ticket moved to <b>${item.ticketStatus}</b> by <b>BUSINESS: ${item.performerEmail}</b>`;
          }
          else if ((item.userType == 'CUSTOMER_SUPPORT' || item.userType == 'CUSTOMER_SUPPORT_MANAGER') && item.ticketStatus == 'RESOLVED') {
            item.message = `Ticket moved to <b>${item.ticketStatus}</b> by <b>USER: ${item.performerEmail}</b>`;
          }
          else if (item.isPerformedBySystem) {
            item.message = `Ticket moved to <b>${item.ticketStatus}</b> by <b>SYSTEM</b>`;
          }
          else if (item.performerEmail && item.ticketStatus == 'REFUND_AND_CANCELATION') {
            item.message = `Ticket moved to <b>${item.ticketStatus}</b> by <b>${item.performerEmail}</b>`;
          }

          this.allActivities.push(item);
        });
      },
      err => { }
    );
  }

  submitNoteForActivitiy(noteForm: NgForm) {
    if (this.noteActivity.note) {
      this.orderService.submitNoteForActivitiy(this.ticketRefId, this.noteActivity).subscribe(
        (res: any) => {
          this.getAllActivityUnderAticket();
          this.noteActivity = {}
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
    }
    else {
      this.toastr.errorToastr("Enter your activity note");
    }
  }

  getTicketById(ticketRefId: string) {
    this.subscription = this.orderService.getTicketById(ticketRefId).subscribe(
      (res: any) => {
        this.ticketDetails = res.body.data.ticket;
        if (this.ticketDetails.order.refId) {
          this.getOrderById(this.ticketDetails.order.refId);
        }
        this.currentTicketStatus = this.ticketDetails.ticketStatus ? this.ticketDetails.ticketStatus.name : "";
        this.isTicketStatusResolved = this.currentTicketStatus === "RESOLVED" ? true : false;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  getAllActivityUnderAticketAfterTenSecond() {
    this.timerIdForActivity = setInterval(() => {
      this.getAllActivityUnderAticket();
    }, 15000);
  }

  getTicketByIdAfterTenSecond() {
    this.timerIdForTicket = setInterval(() => {
      this.subscription = this.orderService.getTicketById(this.ticketRefId).subscribe(
        (res: any) => {
          let ticket: any = {};
          ticket = res.body.data.ticket;
          if (ticket.ticketStatus.name != this.currentTicketStatus) {
            this.currentTicketStatus = ticket.ticketStatus.name;
            if (this.currentTicketStatus == 'B2C_PENDING') {
              this.isReassignShow = true;
              if (this.isVisibleConfirmationModal != true) {
                this.isVisibleConfirmationModal = true;
              }
            }
            else if (this.currentTicketStatus == 'WAITING_FOR_RESOLVED') {
              this.isVisibleLeaveModalWhenPaid = true;
              this.setReassignToFalse();
            }
            else {
              this.setReassignToFalse();
            }
          }
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
    }, 10000);
  }

  getOrderById(id: string) {
    this.subscription = this.orderService.getOrderById(id).subscribe(
      (res: any) => {
        this.orderDetails = res.body.data.order;
        this.isExpiryScheduledAt =
          parseInt(`${new Date().getTime()}`) >
            parseInt(
              `${new Date(res.body.data.order.scheduledAt).getTime()}`
            ) && res.body.data.order.orderStatus.name === "PENDING"
            ? true
            : false;

      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      },
      () => {
        if (this.orderDetails.foodOrders.length) {
          this.subTotal = 0;
          this.netTotal = 0;
          this.eachUnitPriceTotalWithAddons = [];
          this.orderInvoiceControl(this.orderDetails.foodOrders);
        }
      }
    );
  }

  changeActionForWaitingTime(time: string) {
    this.selectedWaitingTime = time;
  }

  waitAticketCurrentlyWorkingOn() {
    let timeToMiliSecond = Number(this.selectedWaitingTime) * 60 * 1000;
    this.orderService.waitAticketCurrentlyWorkingOn(this.ticketRefId, { waitTime: timeToMiliSecond }).subscribe(
      (res: any) => {
        this.getTicketById(this.ticketRefId);
        this.toastr.successToastr(res.body.message.en);
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  reassignOnTicket() {
    this.orderService.assignTicketMySelf(this.ticketRefId).subscribe(
      res => {
        this.orderService.pickAssignTicketToMe(this.ticketRefId).subscribe(
          res => {
            this.isVisibleConfirmationModal = false;
            this.setReassignToFalse();
            this.getTicketById(this.ticketRefId);
            this.getAllActivityUnderAticket();
          },
          err => {
            this.toastr.errorToastr(err.error.message.en);
          }
        );
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  setReassignToFalse() {
    this.isReassignShow = false;
  }

  //when status automatic changed and not B2C_PENDING status
  leaveAndBackToTicketListingPage() {
    this.isVisibleConfirmationModal = false;
    this.isVisibleLeaveModalWhenPaid = false;
    this.router.navigate(['/admin/orders/ticket-list']);
  }

  approvedOrderByInternalOrBusiness() {
    this.orderService.approvedOrderByInternalOrBusiness(this.orderDetails.refId).subscribe(
      res => {
        this.orderService.getTicketById(this.ticketRefId).subscribe(
          (res: any) => {
            this.ticketDetails = res.body.data.ticket;
            this.currentTicketStatus = this.ticketDetails.ticketStatus ? this.ticketDetails.ticketStatus.name : "";
            this.isReassignShow = this.currentTicketStatus == 'B2C_PENDING' ? true : false;
            if (this.currentTicketStatus == 'B2C_PENDING') {
              this.isVisibleConfirmationModal = true;
            }
          },
          err => {
            this.toastr.errorToastr(err.error.message.en);
          }
        );
        this.toastr.successToastr(res.body.message.en);
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  declineOrderByInternalOrBusiness() {
    this.orderService.declineOrderByInternalOrBusiness(this.orderDetails.refId).subscribe(
      res => {
        this.getTicketById(this.ticketRefId);
        this.toastr.successToastr(res.body.message.en);
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  cancelAnOrder() {
    this.orderService.cancelAnOrder(this.orderDetails.refId).subscribe(
      res => {
        this.getTicketById(this.ticketRefId);
        this.toastr.successToastr(res.body.message.en);
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  orderInvoiceControl(foodOrders) {
    const eachTotalItemPrice: any[] = [];
    if (foodOrders.length > 0) {
      foodOrders.forEach(item => {
        let addonsTotal = 0;
        if (item.foodOrderAddons.length > 0) {
          item.foodOrderAddons.forEach(addons => {
            addonsTotal += Number(addons.excludingVatTotalPrice);
          });
        }
        let value =
          `৳ ${Number(item.excludingVatUnitPrice) + Number(addonsTotal)} * ${item.unitCount} = ৳ ${(Number(item.excludingVatUnitPrice) + Number(addonsTotal)) * Number(item.unitCount)}`;
        this.eachUnitPriceTotalWithAddons.push(value);
        eachTotalItemPrice.push((Number(item.excludingVatUnitPrice) + Number(addonsTotal)) * Number(item.unitCount));
      });
    }
    if (eachTotalItemPrice.length > 0) {
      eachTotalItemPrice.forEach((value, index) => {
        this.subTotal += eachTotalItemPrice[index];
      });
    }

    let vat = Number(this.orderDetails.vatAmount);
    let service = Number(this.orderDetails.serviceChargeAmount);
    let discount = Number(this.orderDetails.orderPromotion ? this.orderDetails.orderPromotion.discountAmount : 0);
    this.netTotal = ((this.subTotal - discount) + (vat + service));
  }

  checkValueIsNumberAndPositive(value: any) {
    return AppConstants.checkValueIsNumberAndPositive(value);
  }

  ngOnDestroy() {
    clearInterval(this.timerIdForTicket);
    clearInterval(this.timerIdForActivity);
    this.subscription.unsubscribe();
  }

}

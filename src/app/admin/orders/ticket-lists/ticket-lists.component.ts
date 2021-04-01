import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild
} from "@angular/core";
import { Paginator } from "primeng/paginator";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastrManager } from "ng6-toastr-notifications";
import { Subscription } from "rxjs";

import { OrdersService } from "../../../shared/services/orders.service";
import { Tickets } from "../../../shared/models/orders.model";
import { CommonType, TicketType, StatisticModel } from "../../../shared/models/common.model";
import { AuthService } from "../../../user/services/auth.service";
import { UserModel } from "../../../user/models/user.model";
import { UtilityService } from "../../../shared/services/utility.service";
import { SharedDataService } from 'src/app/shared/services/shared-data.service';

@Component({
  selector: "app-ticket-lists",
  templateUrl: "./ticket-lists.component.html",
  styles: []
})
export class TicketListsComponent implements OnInit, OnDestroy {
  @ViewChild("paginator", { static: false }) dataTable: ElementRef<Paginator>;
  private subscription: Subscription;
  timerIdForAllTicket: any;
  allTickets: Tickets[] = [];
  assignList: CommonType[];
  allCustomerSupportUser: UserModel[] = [];
  allCustomerSupportMgrUser: UserModel[] = [];
  allCustomerSupport: UserModel[] = [];
  userStatus = "ACTIVE";
  userType: string;
  currentUser: UserModel = new UserModel();

  // paginator variable
  offset: number = 0;
  limit: number = 10;
  totalCount: number;
  itemPerPage: number = 10;
  pageLink: number = 5;

  // Customer support
  customerSupportOffset: number = 0;
  customerSupportlimit: number = 10;

  // for filter table data based on status
  ticketStatuses: CommonType[] = [];
  ticketTypes: TicketType[] = [];
  statusForFilter: number = 0;
  ticketTypeForFilter: number = 0;
  filter: any = { statuses: [], types: [], searchingOrderRefId: null };
  ticketStatistics: any[] = [];
  menuSearch: any = {};
  active: any = null;

  constructor(
    private orderService: OrdersService,
    private toastr: ToastrManager,
    private authService: AuthService,
    private route: ActivatedRoute,
    private utility: UtilityService,
    private sharedDataService: SharedDataService
  ) {
    this.getAllCustomerSupportUser(
      this.offset.toString(),
      this.limit.toString(),
      this.userStatus,
      "CUSTOMER_SUPPORT",
      "false"
    );
    this.getAllCustomerSupportUser(
      this.offset.toString(),
      this.limit.toString(),
      this.userStatus,
      "CUSTOMER_SUPPORT_MANAGER",
      "false"
    );
  }

  ngOnInit() {
    let user: UserModel = this.utility.getUserPayload();
    this.currentUser = user;
    this.userType = user.userType.name;

    this.subscription = this.route.queryParams.subscribe(params => {
      this.offset = +params["offset"] || 0;
      this.limit = +params["limit"] || 10;
    });

    this.getTicketTypes();
    this.getTicketStatus();
  }

  mergeTicketStatusWithStatistics(ticketStatistics: any[]) {
    if (this.ticketStatuses.length) {
      let tempTicketStatistic = [];
      this.ticketStatuses.forEach(val => {
        let index = ticketStatistics.map(obj => { return obj.ticketStatus.name; }).indexOf(val.name);
        if (index === -1) {
          let statisticObj = {} as StatisticModel;
          statisticObj.count = 0;
          statisticObj.ticketStatus = {} as CommonType;
          statisticObj.ticketStatus.name = val.name;
          statisticObj.ticketStatus.id = val.id;
          tempTicketStatistic.push(statisticObj);
        }
      });

      return ticketStatistics.concat(tempTicketStatistic);
    }
  }

  resetTicketList() {
    this.active = null;
    this.filter.statuses = [];
    this.filter.types = [];
    this.filter.searchingOrderRefId = null;
    this.setPageAtOne();
    this.makeFilterStatusFillWithoutResolvedStatus();
    this.getAllTickets(
      this.offset.toString(),
      this.limit.toString(),
      this.filter
    );
  }

  setPageAtOne() {
    let paginatorRef: any = this.dataTable;
    this.offset = 0;
    this.limit = this.limit;
    paginatorRef.first = 0;
    paginatorRef.rows = this.limit;
  }

  searchByOrderRefId() {
    if (this.filter.searchingOrderRefId) {
      this.setPageAtOne();
      this.getAllTickets(
        this.offset.toString(),
        this.limit.toString(),
        this.filter
      );
    }
  }

  getTicketTypes() {
    this.orderService.getTicketTypes().subscribe(
      (res: any) => {
        this.ticketTypes = res.body.data.ticketTypes;
        this.ticketTypes.forEach(item => {
          if (item.name) {
            item.display = this.sharedDataService.replaceUnderscoreWithSpace(item.name);
          }
        });
      },
      err => { }
    );
  }

  getTicketStatistics() {
    this.orderService.getTicketStatistics().subscribe(
      (res: any) => {
        if (res.body.data.ticketStatistics.length) {
          this.ticketStatistics = [];
          let mergedTicketStatistics = this.mergeTicketStatusWithStatistics(res.body.data.ticketStatistics);
          mergedTicketStatistics.forEach(item => {
            if (item.ticketStatus.name !== 'RESOLVED') {
              item.display = '';
              if (item.ticketStatus.name === 'SUPPORT_CONVERSATION_CUSTOMER_SUPPORT_PENDING') {
                item.display += 'LEFT CONVERSATION';
              }
              else if (item.ticketStatus.name === 'SUPPORT_CONVERSATION_IN_PROGRESS') {
                item.display += 'CONVERSATION IN PROGRESS';
              }
              else {
                item.display += this.sharedDataService.replaceUnderscoreWithSpace(item.ticketStatus.name);
              }
              this.ticketStatistics.push(item);
            }
          });
        }
      },
      err => { }
    );
  }

  getTicketStatus() {
    this.orderService.getTicketStatus().subscribe(
      (res: any) => {
        this.filter.statuses = [];
        this.ticketStatuses = res.body.data.statuses;
        this.makeFilterStatusFillWithoutResolvedStatus();
        this.getAllTickets(
          this.offset.toString(),
          this.limit.toString(),
          this.filter
        );
        this.getTicketStatistics();
        this.getAllTicketAfterTenSecond();
      },
      err => { }
    );
  }

  makeFilterStatusFillWithoutResolvedStatus() {
    this.ticketStatuses.forEach((item, key) => {
      if (item.name !== 'RESOLVED') {
        this.filter.statuses.push(item.name);
      }
      else {
        this.ticketStatuses.splice(key, 1);
      }
    });
  }

  filterTicketOnStatusChange(statusId: number, index: number) {
    this.setPageAtOne();

    this.active = index;
    this.filter.types = [];
    this.ticketTypeForFilter = 0;
    this.statusForFilter = statusId;
    let ticketStatus;
    if (statusId !== 0) {
      ticketStatus = this.ticketStatuses.find(item => {
        return item.id == statusId;
      }).name;
    }

    if (ticketStatus) {
      this.filter.statuses = [];
      this.filter.statuses.push(ticketStatus);
    }

    this.getAllTickets(
      this.offset.toString(),
      this.limit.toString(),
      this.filter
    );
  }

  filterTicketOnTypeChange(typeId: number) {
    this.setPageAtOne();

    this.ticketTypeForFilter = typeId;
    let ticketType;
    if (typeId !== 0) {
      ticketType = this.ticketTypes.find(item => {
        return item.id == typeId;
      }).name;
    }
    else {
      this.filter.types = [];
    }

    if (ticketType) {
      this.filter.types = [];
      this.filter.types.push(ticketType);
    }

    this.getAllTickets(
      this.offset.toString(),
      this.limit.toString(),
      this.filter
    );
  }

  getAllTicketAfterTenSecond() {
    let that = this;
    this.timerIdForAllTicket = setInterval(() => {
      this.getTicketStatistics();
      that.getAllTickets(
        this.offset.toString(),
        this.limit.toString(),
        this.filter
      );
    }, 15000);
  }

  getAllTickets(offset: any, limit: any, ticket?: any) {
    ticket.searchingOrderRefId = ticket.searchingOrderRefId
      ? ticket.searchingOrderRefId
      : null;
    this.subscription = this.orderService
      .getAllTickets(offset.toString(), limit.toString(), ticket)
      .subscribe(
        res => {
          let data = res.body.data.tickets;
          data.forEach((tktItem: Tickets) => {
            tktItem.ticketStatusDisplay = this.sharedDataService.replaceUnderscoreWithSpace(tktItem.ticketStatus.name);
            tktItem.ticketTypeDisplay = this.sharedDataService.replaceUnderscoreWithSpace(tktItem.ticketType.name);
            tktItem.orderStatusDisplay = tktItem.order
              ? this.sharedDataService.replaceUnderscoreWithSpace(tktItem.order.orderStatus.name)
              : null;

            tktItem.assignToIdDisplay = tktItem.assignedTo
              ? tktItem.assignedTo : 0;

            if (tktItem.waitUntil) {
              let currentTime = new Date().getTime();
              let waitTime = new Date(tktItem.waitUntil).getTime();
              if (currentTime < waitTime) {
                let waitingMinit: any = Math.ceil(
                  (waitTime - currentTime) / (1000 * 60)
                );
                tktItem.waitingTime = waitingMinit + " min";
              }
              if (tktItem.waitUntil) {
                let currentTime = new Date().getTime();
                let waitTime = new Date(tktItem.waitUntil).getTime();
                if (currentTime < waitTime) {
                  let waitingMinit: any = Math.ceil(
                    (waitTime - currentTime) / (1000 * 60)
                  );
                  tktItem.waitingTime = waitingMinit + " min";
                } else {
                  tktItem.waitingTime = null;
                  if (
                    tktItem.ticketStatus.name === "WAITING_FOR_B2B" ||
                    tktItem.ticketStatus.name === "WAITING_FOR_B2C"
                  ) {
                    tktItem.isWaitTimeExpired = true;
                  } else {
                    tktItem.isWaitTimeExpired = false;
                  }
                }
              }
            }
          });
          this.allTickets = data;
          const paginatorRef: any = this.dataTable;
          paginatorRef.first = offset;
          this.totalCount = res.body.data.count;
          if (!this.allTickets.length && offset > 0) {
            this.setPageAtOne();
            this.getAllTickets(
              this.offset.toString(),
              this.limit.toString(),
              this.filter
            );
          }
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
  }

  paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.getAllTickets(
      this.offset.toString(),
      this.limit.toString(),
      this.filter
    );
  }

  getAllCustomerSupportUser(
    offset: string,
    limit: string,
    status?: string,
    type?: string,
    paginate?: string
  ) {
    this.authService
      .getInternalUsers(offset, limit, status, type, paginate)
      .subscribe(
        (res: any) => {
          if (type === 'CUSTOMER_SUPPORT_MANAGER') {
            this.allCustomerSupportMgrUser = res.body.data.users;
          }
          else {
            this.allCustomerSupport = [];
            this.allCustomerSupport = res.body.data.users;
            if (this.userType === "CUSTOMER_SUPPORT") {
              this.allCustomerSupportUser.push(this.currentUser);
              this.allCustomerSupportUser.forEach(support => {
                support.displayName = "Self";
              });
            } else {
              this.allCustomerSupportUser = this.allCustomerSupport;
              this.allCustomerSupportUser = this.utility.pushItemIntoArrayListAtZeroIndex(
                this.allCustomerSupportUser, 0, this.currentUser);

              this.allCustomerSupportUser.forEach(support => {
                if (this.currentUser.id === support.id) {
                  support.displayName = "Self";
                } else {
                  support.displayName = support.email;
                }
              });
            }
          }
        },
        (err: any) => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
  }

  assignToCustomerSupport(ticket: any) {
    if (
      this.userType === "CUSTOMER_SUPPORT" ||
      this.currentUser.id === ticket.assignToIdDisplay
    ) {
      if (ticket.assignToIdDisplay) {
        this.assignTicketMySelf(ticket.assignToIdDisplay, ticket);
      }
    } else if (this.userType === "CUSTOMER_SUPPORT_MANAGER") {
      if (ticket.assignToIdDisplay) {
        this.assignTicketByCustomerManager(ticket.ticketRefId, ticket.assignToIdDisplay);
      }
    } else {
      this.toastr.warningToastr("You are not permitted to assign a ticket!");
    }
  }

  assignTicketMySelf(customerId, ticket: any) {
    this.orderService.assignTicketMySelf(ticket.ticketRefId).subscribe(
      res => {
        ticket.assignedTo = Number(customerId);
        this.toastr.successToastr(res.body.message.en);
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  assignTicketByCustomerManager(ticketRefId: string, customerSuppportId: number) {
    this.orderService
      .assignTicketByCustomerManager(ticketRefId, customerSuppportId)
      .subscribe(
        res => {
          this.toastr.successToastr(res.body.message.en);
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
  }

  pickAssignTicketToMe(ticketRefId: string, ticket: any) {
    if (
      this.userType === "CUSTOMER_SUPPORT" ||
      this.userType === "CUSTOMER_SUPPORT_MANAGER"
    ) {
      if (ticket.ticketType.name == "ORDER") {
        this.viewTicketDetailsForOrder(ticketRefId, ticket);
      } else {
        this.viewTicketDetailsForSupport(ticketRefId, ticket);
      }
    } else {
      if (ticket.ticketType.name == "ORDER") {
        window.open(`/admin/orders/ticket-list/${ticketRefId}`, "_blank");
      } else {
        window.open(`/admin/orders/help/${ticketRefId}`, "_blank");
      }
    }
  }

  viewTicketDetailsForOrder(ticketRefId: string, ticket: any) {
    if (
      ticket.ticketStatus.name == "B2C_INPROGRESS"
      || ticket.ticketStatus.name == "B2B_INPROGRESS"
    ) {
      this.openTicketDeailsPageOnNewWindow(ticketRefId);
    } else {
      if (
        this.currentUser.id === ticket.assignedTo &&
        ticket.ticketStatus.name !== "RESOLVED"
      ) {
        this.orderService.pickAssignTicketToMe(ticketRefId).subscribe(
          res => {
            this.getTicketStatistics();
            this.getAllTickets(
              this.offset.toString(),
              this.limit.toString(),
              this.filter
            );
            this.openTicketDeailsPageOnNewWindow(ticketRefId);
          },
          err => {
            this.toastr.errorToastr(err.error.message.en);
          }
        );
      } else {
        this.openTicketDeailsPageOnNewWindow(ticketRefId);
      }
    }
  }

  viewTicketDetailsForSupport(ticketRefId: string, ticket: any) {
    if (ticket.ticketStatus.name == "SUPPORT_CONVERSATION_IN_PROGRESS") {
      this.openSupportTicketDeailsPageOnNewWindow(ticketRefId);
    } else {
      if (
        this.currentUser.id === ticket.assignedTo &&
        ticket.ticketStatus.name !== "RESOLVED"
      ) {
        this.orderService.pickAssignTicketToMe(ticketRefId).subscribe(
          res => {
            this.getTicketStatistics();
            this.getAllTickets(
              this.offset.toString(),
              this.limit.toString(),
              this.filter
            );
            this.openSupportTicketDeailsPageOnNewWindow(ticketRefId);
          },
          err => {
            this.toastr.errorToastr(err.error.message.en);
          }
        );
      } else {
        this.openSupportTicketDeailsPageOnNewWindow(ticketRefId);
      }
    }
  }

  openTicketDeailsPageOnNewWindow(ticketRefId: string) {
    window.open(`/admin/orders/ticket-list/${ticketRefId}`, "_blank");
  }

  openSupportTicketDeailsPageOnNewWindow(ticketRefId: string) {
    window.open(`/admin/orders/help/${ticketRefId}`, "_blank");
  }

  viewAssignedName(assignedTo: any): String {
    let assignedEmail = "";
    if (assignedTo) {
      if (assignedTo === this.currentUser.id) {
        assignedEmail = 'Self';
      }
      else {
        let alluser = this.allCustomerSupport.concat(this.allCustomerSupportMgrUser);
        let customerSupport = alluser.find(item => {
          return item.id == assignedTo;
        });
        assignedEmail = customerSupport ? customerSupport.email : "";
      }
    }
    return assignedEmail;
  }

  ngOnDestroy() {
    clearInterval(this.timerIdForAllTicket);
    this.subscription.unsubscribe();
  }
}

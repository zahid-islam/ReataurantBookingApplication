import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild
} from "@angular/core";
import { Paginator } from "primeng/paginator";
import { ActivatedRoute } from "@angular/router";
import { ToastrManager } from "ng6-toastr-notifications";
import { Subscription } from "rxjs";

import { OrdersService } from "../../../shared/services/orders.service";
import { Tickets } from "../../../shared/models/orders.model";
import { CommonType } from "../../../shared/models/common.model";
import { UserModel } from "../../../user/models/user.model";
import { UtilityService } from "../../../shared/services/utility.service";

@Component({
  selector: 'app-resolved-ticket-list',
  templateUrl: './resolved-ticket-list.component.html',
  styles: []
})
export class ResolvedTicketListComponent implements OnInit, OnDestroy {
  @ViewChild("paginator", { static: false }) dataTable: ElementRef<Paginator>;
  private subscription: Subscription;
  timerIdForAllTicket: any;
  allTickets: Tickets[] = [];
  assignList: CommonType[];
  allCustomerSupportUser: UserModel[] = [];
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
  ticketTypes: CommonType[] = [];
  statusForFilter: number = 0;
  ticketTypeForFilter: number = 0;
  filter: any = { statuses: ['RESOLVED'], types: [], searchingOrderRefId: null };
  ticketStatistics: any[] = [];
  menuSearch: any = {};

  constructor(
    private orderService: OrdersService,
    private toastr: ToastrManager,
    private route: ActivatedRoute,
    private utility: UtilityService
  ) { }

  ngOnInit() {
    let user: UserModel = this.utility.getUserPayload();
    this.currentUser = user;
    this.userType = user.userType.name;

    this.subscription = this.route.queryParams.subscribe(params => {
      this.offset = +params["offset"] || 0;
      this.limit = +params["limit"] || 10;
    });

    this.getTicketTypes();
    this.getAllTickets(
      this.offset.toString(),
      this.limit.toString(),
      this.filter
    );
    this.getAllTicketAfterTenSecond();
  }

  setPageAtOne() {
    let paginatorRef: any = this.dataTable;
    this.offset = 0;
    this.limit = 10;
    paginatorRef.first = 0;
    paginatorRef.rows = 10;
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
      },
      err => { }
    );
  }

  filterTicketOnTypeChange(typeId: number) {
    this.setPageAtOne();
    this.ticketTypeForFilter = typeId;
    let ticketType;
    if (typeId != 0) {
      ticketType = this.ticketTypes.find(item => {
        return item.id == typeId;
      }).name;
    } else {
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
      that.getAllTickets(
        this.offset.toString(),
        this.limit.toString(),
        this.filter
      );
    }, 20000);
  }

  getAllTickets(offset: string, limit: string, ticket?: any) {
    ticket.searchingOrderRefId = ticket.searchingOrderRefId
      ? ticket.searchingOrderRefId
      : null;
    this.subscription = this.orderService
      .getAllTickets(offset, limit, ticket)
      .subscribe(
        res => {
          this.allTickets = res.body.data.tickets;;
          const paginatorRef: any = this.dataTable;
          paginatorRef.first = this.offset;
          this.totalCount = res.body.data.count;
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

  pickAssignTicketToMe(ticketRefId: string, ticket: any) {
    if (ticket.ticketType.name == "ORDER") {
      this.openTicketDeailsPageOnNewWindow(ticketRefId);
    } else {
      this.openSupportTicketDeailsPageOnNewWindow(ticketRefId);
    }
  }

  openTicketDeailsPageOnNewWindow(ticketRefId: string) {
    window.open(`/admin/orders/ticket-list/${ticketRefId}`, "_blank");
  }

  openSupportTicketDeailsPageOnNewWindow(ticketRefId: string) {
    window.open(`/admin/orders/help/${ticketRefId}`, "_blank");
  }

  ngOnDestroy() {
    clearInterval(this.timerIdForAllTicket);
    this.subscription.unsubscribe();
  }

}

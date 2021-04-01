import { ResolvedTicketListComponent } from './resolved-ticket-list/resolved-ticket-list.component';
/**
 * Frameworks dependency
 */
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { TicketListsComponent } from "./ticket-lists/ticket-lists.component";
import { TicketDetailsComponent } from "./ticket-details/ticket-details.component";
import { ReservationListComponent } from './reservation-list/reservation-list.component';
import { ReservationDetailsComponent } from './reservation-details/reservation-details.component';
import { TicketSupportDetailsComponent } from './ticket-support-details/ticket-support-details.component';
/**
 * Application service List
 *
 */

const routes: Routes = [
  {
    path: "ticket-list",
    component: TicketListsComponent,
    data: {
      title: "Ticket",
      breadcrumb: ""
    }
  },
  {
    path: "resolve-ticket-list",
    component: ResolvedTicketListComponent,
    data: {
      title: "Resolved Ticket",
      breadcrumb: ""
    }
  },
  {
    path: "ticket-list/:id",
    component: TicketDetailsComponent,
    data: {
      title: "Ticket Details ",
      breadcrumb: ""
    }
  },
  {
    path: "help/:id",
    component: TicketSupportDetailsComponent,
    data: {
      title: "Help",
      breadcrumb: ""
    }
  },
  {
    path: "reservation",
    component: ReservationListComponent,
    data: {
      title: "Reservation Lists",
      breadcrumb: ""
    }
  },
  {
    path: "reservation/:refId",
    component: ReservationDetailsComponent,
    data: {
      title: "Reservation Details",
      breadcrumb: ""
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }

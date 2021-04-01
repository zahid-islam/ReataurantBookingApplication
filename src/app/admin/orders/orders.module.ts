/**
 * Frameworks dependency
 */
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

/**
 * Third party dependency
 */
import { DropdownModule } from "primeng/dropdown";
import { PaginatorModule } from "primeng/paginator";
import { TableModule } from "primeng/table";
import { DialogModule } from "primeng/dialog";

/**
 * Application routing
 */

import { OrdersRoutingModule } from "./orders-routing.module";

/**
 * Application component list
 */
import { OrdersComponent } from "./orders.component";
import { TicketListsComponent } from "./ticket-lists/ticket-lists.component";
import { TicketDetailsComponent } from "./ticket-details/ticket-details.component";
import { ReservationListComponent } from './reservation-list/reservation-list.component';
import { ReservationDetailsComponent } from './reservation-details/reservation-details.component';
import { SharedModule } from '../../shared/shared.module';
import { TicketSupportDetailsComponent } from './ticket-support-details/ticket-support-details.component';
import { ResolvedTicketListComponent } from './resolved-ticket-list/resolved-ticket-list.component';


@NgModule({
  imports: [
    CommonModule,
    OrdersRoutingModule,
    DropdownModule,
    PaginatorModule,
    TableModule,
    DialogModule,
    SharedModule
  ],
  declarations: [
    OrdersComponent,
    TicketListsComponent,
    TicketDetailsComponent,
    ReservationListComponent,
    ReservationDetailsComponent,
    TicketSupportDetailsComponent,
    ResolvedTicketListComponent
  ],
  providers: [

  ]
})
export class OrdersModule {}

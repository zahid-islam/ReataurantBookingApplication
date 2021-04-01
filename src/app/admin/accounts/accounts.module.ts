import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Third party dependency
 */
import { DropdownModule } from "primeng/dropdown";
import { PaginatorModule } from "primeng/paginator";
import { TableModule } from "primeng/table";
import { DialogModule } from "primeng/dialog";
import { CalendarModule } from "primeng/calendar";

import { AccountsRoutingModule } from './accounts-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { AccountsComponent } from './accounts/accounts.component';
import { ReceivableComponent } from './accounts/receivable/receivable.component';
import { ReceivedComponent } from './accounts/received/received.component';
import { PaybleComponent } from './accounts/payble/payble.component';
import { PaidComponent } from './accounts/paid/paid.component';
import { AccountRoutingContainerComponent } from './accounts/account-routing-container/account-routing-container.component';
import { WithdrawRequestComponent } from './accounts/withdraw-request/withdraw-request.component';
import { OrderPromotionListComponent } from './order-promotion/order-promotion-list/order-promotion-list.component';


@NgModule({
  declarations: [

    AccountsComponent,
    ReceivableComponent,
    ReceivedComponent,
    PaybleComponent,
    PaidComponent,
    AccountRoutingContainerComponent,
    WithdrawRequestComponent,
    OrderPromotionListComponent,
  ],
  imports: [
    CommonModule,
    AccountsRoutingModule,
    TableModule,
    DropdownModule,
    CalendarModule,
    PaginatorModule,
    DialogModule,
    SharedModule

  ]
})
export class AccountsModule { }

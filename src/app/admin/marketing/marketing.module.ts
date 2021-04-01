import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";

/**
 * Third party dependency
 */
import { DropdownModule } from "primeng/dropdown";
import { PaginatorModule } from "primeng/paginator";
import { TableModule } from "primeng/table";
import { DialogModule } from "primeng/dialog";
import { CalendarModule } from "primeng/calendar";

import { MarketingRoutingModule } from './marketing-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { MarketingComponent } from './marketing.component';

import { MarketingListComponent } from './marketing-list/marketing-list.component';
import { BustingMarketingComponent } from './busting-marketing/busting-marketing.component';
import { NotificationComponent } from './notification/notification.component';
import { NotificationDetailsComponent } from './notification-details/notification-details.component';

import { PromotionComponent } from './promotion-management/promotion/promotion.component';
import { CreatePublicPromotionComponent } from './promotion-management/create-public-promotion/create-public-promotion.component';
import { PromotionEndUsersComponent } from './promotion-management/promotion-end-users/promotion-end-users.component';


@NgModule({
  declarations: [
    MarketingComponent,
    MarketingListComponent,
    BustingMarketingComponent,
    NotificationComponent,
    NotificationDetailsComponent,
    PromotionComponent,
    CreatePublicPromotionComponent,
    PromotionEndUsersComponent
  ],
  imports: [
    CommonModule,
    MarketingRoutingModule,
    TableModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    PaginatorModule,
    DialogModule,
    SharedModule
  ]
})
export class MarketingModule { }

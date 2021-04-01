/**
 * Framework dependency
 */
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
/**
 * Third party dependency
 */
import { DropdownModule } from "primeng/dropdown";
import { PaginatorModule } from "primeng/paginator";
import { TableModule } from "primeng/table";
import { DialogModule } from "primeng/dialog";
import { CalendarModule } from "primeng/calendar";

/**
 * Application dependency
 */
import { AdminRoutingModule } from "./admin-routing.module";
import { LazyServiceModule } from "./services/lazy-service.module";

/**
 * Application component list
 */
import { AdminComponent } from "./admin.component";

import { AdminDashboardComponent } from "./admin-dashboard/admin-dashboard.component";
import { CustomerInfoComponent } from "./customer/customer-info/customer-info.component";
import { CustomerDetailsComponent } from "./customer/customer-details/customer-details.component";
import { ProfileComponent } from "./profile/profile.component";
import { ChangePasswordComponent } from "./profile/change-password/change-password.component";
import { SharedModule } from '../shared/shared.module';

import { AnalyticsComponent } from './analytics/analytics/analytics.component';
import { ActivityLogsComponent } from './activity-logs/activity-logs.component';



@NgModule({
  declarations: [
    AdminComponent,
    AdminDashboardComponent,
    CustomerInfoComponent,
    CustomerDetailsComponent,
    ProfileComponent,
    ChangePasswordComponent,
    AnalyticsComponent,
    ActivityLogsComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    TableModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    CalendarModule,
    LazyServiceModule,
    PaginatorModule,
    DialogModule,
    SharedModule
  ]
})
export class AdminModule { }

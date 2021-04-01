/**
 * Framework dependency
 */
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

/**
 * Third party dependency
 */
import { DropdownModule } from "primeng/dropdown";
import { PaginatorModule } from "primeng/paginator";
import { TableModule } from "primeng/table";
import { DialogModule } from "primeng/dialog";
import { CalendarModule } from "primeng/calendar";
// import { ChartModule } from "primeng/chart";

/**
 * Application dependency
 */

import { LazyServiceModule } from "../services/lazy-service.module";

import { ManageUserRoutingModule } from "./manage-user-routing.module";
import { ManageUsersComponent } from "./manage-users.component";
import { ManageUserComponent } from "./manage-user/manage-user.component";
import { ManageUserFormComponent } from "./manage-user-form/manage-user-form.component";
import { ManageUserViewComponent } from "./manage-user-view/manage-user-view.component";
import { UserAccessControlComponent } from "./user-access-control/user-access-control.component";
import { InternalUserProfileComponent } from './internal-user-profile/internal-user-profile.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    ManageUsersComponent,
    ManageUserComponent,
    ManageUserFormComponent,
    ManageUserViewComponent,
    UserAccessControlComponent,
    InternalUserProfileComponent
  ],
  imports: [
    CommonModule,
    ManageUserRoutingModule,
    TableModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    LazyServiceModule,
    PaginatorModule,
    DialogModule,
    SharedModule
  ]
})
export class ManageUserModule {}

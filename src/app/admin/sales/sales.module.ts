import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

/**
 * Third party dependency
 */
import { DropdownModule } from "primeng/dropdown";
import { PaginatorModule } from "primeng/paginator";
import { CalendarModule } from "primeng/calendar";
import { TableModule } from "primeng/table";
import { DialogModule } from "primeng/dialog";

/**
 * Application dependency
 */

import { LazyServiceModule } from "../services/lazy-service.module";

import { SalesRoutingModule } from "./sales-routing.module";
import { SalesComponent } from "./sales.component";

import { CreateBusinessComponent } from "./create-business/create-business.component";
import { CreateBusinessFormComponent } from "./create-business-form/create-business-form.component";
import { CreateBusinessUserComponent } from "./create-business-user/create-business-user.component";
import { CreateBusinessUserViewComponent } from "./create-business-user-view/create-business-user-view.component";
import { UsersComponent } from "./users/users.component";
import { BusinessUserComponent } from "./business-user/business-user.component";
import { BusinessUserContainerComponent } from "./users/business-user-container.component";
import { SharedModule } from '../../shared/shared.module';
import { PaymentMethodListComponent } from './payment-method-list/payment-method-list.component';
import { PaymentMethodFormComponent } from './payment-method-form/payment-method-form.component';

@NgModule({
  declarations: [
    SalesComponent,
    BusinessUserComponent,
    CreateBusinessUserComponent,
    CreateBusinessUserViewComponent,
    CreateBusinessComponent,
    CreateBusinessFormComponent,
    UsersComponent,
    BusinessUserContainerComponent,
    PaymentMethodListComponent,
    PaymentMethodFormComponent
  ],
  imports: [
    CommonModule,
    SalesRoutingModule,
    TableModule,
    FormsModule,
    DropdownModule,
    LazyServiceModule,
    PaginatorModule,
    CalendarModule,
    DialogModule,
    SharedModule
  ]
})
export class SalesModule { }

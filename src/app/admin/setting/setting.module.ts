import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

/**
 * Third party dependency
 */
import { DropdownModule } from "primeng/dropdown";
import { PaginatorModule } from "primeng/paginator";
import { TableModule } from "primeng/table";
import { CalendarModule } from "primeng/calendar";

import { SettingRoutingModule } from "./setting-routing.module";
import { SettingContainerDynamicComponent } from "./setting-container-dynamic/setting-container-dynamic.component";
import { TagsComponent } from "./tags/tags.component";
import { FacilitiesComponent } from "./facilities/facilities.component";
import { EmailTemplatesListComponent } from "./email/email-templates-list/email-templates-list.component";
import { CreateEmailTemplatesComponent } from "./email/create-email-templates/create-email-templates.component";
import { SettingComponent } from "./setting.component";
import { SharedModule } from "../../shared/shared.module";
import { CreateRefundPolicyComponent } from "./refund-policy/create-refund-policy/create-refund-policy.component";
import { RefundPolicyListComponent } from "./refund-policy/refund-policy-list/refund-policy-list.component";
import { RemainingMobileBalanceForSmsGatewayComponent } from "./remaining-mobile-balance-for-sms-gateway/remaining-mobile-balance-for-sms-gateway.component";
import { FacilityGroupComponent } from "./facility-group/facility-group.component";
import { BusinessClassificationComponent } from "./business-classification/business-classification.component";
import { MobileAppsVersioningComponent } from "./mobile-apps-versioning/mobile-apps-versioning.component";


@NgModule({
  declarations: [
    SettingContainerDynamicComponent,
    TagsComponent,
    FacilitiesComponent,
    EmailTemplatesListComponent,
    CreateEmailTemplatesComponent,
    SettingComponent,
    CreateRefundPolicyComponent,
    RefundPolicyListComponent,
    RemainingMobileBalanceForSmsGatewayComponent,
    FacilityGroupComponent,
    BusinessClassificationComponent,
    MobileAppsVersioningComponent

  ],
  imports: [
    CommonModule,
    SettingRoutingModule,
    DropdownModule,
    PaginatorModule,
    TableModule,
    CalendarModule,
    SharedModule
  ]
})
export class SettingModule {}

import { FacilityGroupComponent } from "./facility-group/facility-group.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { SettingContainerDynamicComponent } from "./setting-container-dynamic/setting-container-dynamic.component";
import { TagsComponent } from "./tags/tags.component";
import { FacilitiesComponent } from "./facilities/facilities.component";
import { EmailTemplatesListComponent } from "./email/email-templates-list/email-templates-list.component";
import { CreateEmailTemplatesComponent } from "./email/create-email-templates/create-email-templates.component";
import { SettingComponent } from "./setting.component";
import { RefundPolicyListComponent } from "./refund-policy/refund-policy-list/refund-policy-list.component";
import { CreateRefundPolicyComponent } from "./refund-policy/create-refund-policy/create-refund-policy.component";
import { RemainingMobileBalanceForSmsGatewayComponent } from "./remaining-mobile-balance-for-sms-gateway/remaining-mobile-balance-for-sms-gateway.component";
import { BusinessClassificationComponent } from "./business-classification/business-classification.component";
import { MobileAppsVersioningComponent } from "./mobile-apps-versioning/mobile-apps-versioning.component";

const routes: Routes = [
  {
    path: "",
    component: SettingComponent,
    children: [
      {
        path: "",
        component: SettingContainerDynamicComponent,
        data: {
          title: "",
          breadcrumb: ""
        },
        children: [
          {
            path: "",
            component: SettingComponent,
            data: {
              title: "",
              breadcrumb: ""
            },
            children: [
              {
                path: "tags",
                component: TagsComponent,
                data: {
                  title: "Tags",
                  breadcrumb: ""
                }
              },
              {
                path: "facilities",
                component: FacilitiesComponent,
                data: {
                  title: "Facilities",
                  breadcrumb: ""
                }
              },
              {
                path: "facility-group",
                component: FacilityGroupComponent,
                data: {
                  title: "Facility Group",
                  breadcrumb: ""
                }
              },
              {
                path: "email",
                component: EmailTemplatesListComponent,
                data: {
                  title: "Email",
                  breadcrumb: ""
                }
              },
              {
                path: "email-template",
                component: CreateEmailTemplatesComponent,
                data: {
                  title: "Email Templates",
                  breadcrumb: ""
                }
              },
              {
                path: "email-template/:id",
                component: CreateEmailTemplatesComponent,
                data: {
                  title: "Email Templates",
                  breadcrumb: ""
                }
              },
              {
                path: "refund-policy",
                component: RefundPolicyListComponent,
                data: {
                  title: "Refund Policy",
                  breadcrumb: ""
                }
              },
              {
                path: "create-refund-policy",
                component: CreateRefundPolicyComponent,
                data: {
                  title: "Create Refund Policy",
                  breadcrumb: ""
                }
              },
              {
                path: "mobile-balance",
                component: RemainingMobileBalanceForSmsGatewayComponent,
                data: {
                  title: "Mobile Balance",
                  breadcrumb: ""
                }
              },
              {
                path: "business-classification",
                component: BusinessClassificationComponent,
                data: {
                  title: "Business Classification",
                  breadcrumb: ""
                }
              },
              {
                path: "apps-versioning",
                component: MobileAppsVersioningComponent,
                data: {
                  title: "App Versioning",
                  breadcrumb: ""
                }
              }
            ]
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule {}

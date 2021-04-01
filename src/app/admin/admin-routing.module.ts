import { AnalyticsComponent } from './analytics/analytics/analytics.component';
import { ProfileComponent } from "./profile/profile.component";
/**
 * Frameworks dependency
 */
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
/**
 * Application component list dependency
 */
import { AdminComponent } from "./admin.component";
import { AdminDashboardComponent } from "./admin-dashboard/admin-dashboard.component";
import { CustomerInfoComponent } from "./customer/customer-info/customer-info.component";
import { CustomerDetailsComponent } from "./customer/customer-details/customer-details.component";

import { ActivityLogsComponent } from './activity-logs/activity-logs.component';


const routes: Routes = [
  {
    path: "",
    component: AdminComponent,
    data: {
      breadcrumb: ""
    },
    children: [
      {
        path: "admin-dashboard",
        component: AdminDashboardComponent,
        data: {
          breadcrumb: "",
          title: "Dashboard"
        }
      },
      {
        path: "profile",
        component: ProfileComponent,
        data: {
          title: "Profile",
          breadcrumb: ""
        }
      },
      {
        path: "customer",
        component: CustomerInfoComponent,
        data: {
          breadcrumb: "",
          title: "Customer"
        }
      },
      {
        path: "customer/:id",
        component: CustomerDetailsComponent,
        data: {
          breadcrumb: "",
          title: "Customer Detail"
        }
      },
      {
        path: "analytics",
        component: AnalyticsComponent,
        data: {
          breadcrumb: "",
          title: "Analytics"
        }
      },
      {
        path: "activity-logs",
        component: ActivityLogsComponent,
        data: {
          breadcrumb: "",
          title: "Activity Logs"
        }
      },
      {
        path: "business",
        loadChildren: () =>
          import("./business/business.module").then(m => m.BusinessModule),
        data: {
          breadcrumb: ""
        }
      },
      {
        path: "orders",
        loadChildren: () =>
          import("./orders/orders.module").then(m => m.OrdersModule)
      },
      {
        path: "sales",
        loadChildren: () =>
          import("./sales/sales.module").then(m => m.SalesModule),
        data: {
          breadcrumb: ""
        }
      },
      {
        path: "accounts",
        loadChildren: () =>
          import("./accounts/accounts.module").then(m => m.AccountsModule),
        data: {
          breadcrumb: ""
        }
      },
      {
        path: "manage-user",
        loadChildren: () =>
          import("./manage-user/manage-user.module").then(m => m.ManageUserModule),
        data: {
          breadcrumb: ""
        }
      },
      {
        path: "setting",
        loadChildren: () =>
          import("./setting/setting.module").then(m => m.SettingModule),
        data: {
          breadcrumb: ""
        }
      },
      {
        path: "marketing",
        loadChildren: () =>
          import("./marketing/marketing.module").then(m => m.MarketingModule),
        data: {
          breadcrumb: ""
        }
      },
      {
        path: "",
        pathMatch: "full",
        redirectTo: "profile"
      },
      {
        path: '**',
        component: ProfileComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

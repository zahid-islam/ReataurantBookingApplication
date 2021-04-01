import { BusinessProfileFormComponent } from './../business/business-profile-form/business-profile-form.component';
import { Routes, RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";

import { SalesComponent } from "./sales.component";
import { CreateBusinessComponent } from "./create-business/create-business.component";
import { CreateBusinessFormComponent } from "./create-business-form/create-business-form.component";
import { CreateBusinessUserComponent } from "./create-business-user/create-business-user.component";
import { CreateBusinessUserViewComponent } from "./create-business-user-view/create-business-user-view.component";
import { BusinessUserComponent } from "./business-user/business-user.component";
import { UsersComponent } from "./users/users.component";
import { BusinessUserContainerComponent } from "./users/business-user-container.component";
import { PaymentMethodListComponent } from './payment-method-list/payment-method-list.component';
import { PaymentMethodFormComponent } from './payment-method-form/payment-method-form.component';

const routes: Routes = [
  {
    path: "",
    component: SalesComponent,
    data: {
      breadcrumb: ""
    },
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "create-business",
        data: {
          breadcrumb: ""
        }
      },
      {
        path: "",
        component: UsersComponent,
        children: [
          {
            path: "business-user/:id",
            component: BusinessUserContainerComponent,
            data: {
              title: "Business Users",
              breadcrumb: "Users"
            },
            children: [
              {
                path: "",
                component: BusinessUserComponent,
                data: {
                  title: "Business Users",
                  breadcrumb: ""
                }
              },
              {
                path: "create-business-user/:id",
                component: CreateBusinessUserComponent,
                data: {
                  title: "Edit Business User",
                  breadcrumb: "Edit"
                }
              },
              {
                path: "create-business-user",
                component: CreateBusinessUserComponent,
                data: {
                  title: "Create Business User",
                  breadcrumb: "Create Business User"
                }
              }
            ]
          },
          {
            path: "create-business-user-view",
            component: CreateBusinessUserViewComponent,
            data: {
              title: "Create Business User View",
              breadcrumb: "Create Business User View"
            }
          }
        ]
      },
      {
        path: "",
        component: UsersComponent,
        children: [
          {
            path: "payment-method/:id",
            component: BusinessUserContainerComponent,
            data: {
              title: "Payment Methods",
              breadcrumb: "Payment Methods"
            },
            children: [
              {
                path: "",
                component: PaymentMethodListComponent,
                data: {
                  title: "Payment Method",
                  breadcrumb: ""
                }
              },
              {
                path: "update-bank-info/:id",
                component: PaymentMethodFormComponent,
                data: {
                  title: "Edit Payment Method",
                  breadcrumb: "Edit"
                }
              },
              {
                path: "create-payment-method",
                component: PaymentMethodFormComponent,
                data: {
                  title: "Create Payment Method",
                  breadcrumb: "Create Payment Method"
                }
              }
            ]
          },
        ]
      },
      {
        path: "create-business",
        component: CreateBusinessComponent,
        data: {
          title: "Create Business",
          breadcrumb: ""
        }
      },
      {
        path: "create-business-form",
        component: CreateBusinessFormComponent,
        data: {
          title: "Create Business",
          breadcrumb: ""
        }
      },
      {
        path: "create-business-form/:id",
        component: CreateBusinessFormComponent,
        data: {
          title: "Edit",
          breadcrumb: ""
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule {}

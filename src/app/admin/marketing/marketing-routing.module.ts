import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MarketingComponent } from './marketing.component';

import { MarketingListComponent } from './marketing-list/marketing-list.component';
import { BustingMarketingComponent } from './busting-marketing/busting-marketing.component';
import { NotificationComponent } from './notification/notification.component';
import { NotificationDetailsComponent } from './notification-details/notification-details.component';

import { PromotionComponent } from './promotion-management/promotion/promotion.component';
import { CreatePublicPromotionComponent } from './promotion-management/create-public-promotion/create-public-promotion.component';
import { PromotionEndUsersComponent } from './promotion-management/promotion-end-users/promotion-end-users.component';

const routes: Routes = [
  {
    path: "",
    component: MarketingComponent,
    data: {
      breadcrumb: ""
    },
    children: [
      {
        path: "notifications",
        component: NotificationComponent,
        data: {
          breadcrumb: "",
          title: "Notification"
        }
      },
      {
        path: "notifications/details/:id",
        component: NotificationDetailsComponent,
        data: {
          breadcrumb: "",
          title: "Notification Details"
        }
      },
      {
        path: "notifications/notifications-list",
        component: MarketingListComponent,
        data: {
          breadcrumb: "",
          title: "User list"
        }
      },
      {
        path: "notifications/notifications-list/:ntfId/update",
        component: MarketingListComponent,
        data: {
          breadcrumb: "",
          title: "User list"
        }
      },
      {
        path: "notifications/notifications-list/notifications-create",
        component: BustingMarketingComponent,
        data: {
          breadcrumb: "",
          title: "Notification Create"
        }
      },
      {
        path: "notifications/notifications-list/notifications-update/:ntfId",
        component: BustingMarketingComponent,
        data: {
          breadcrumb: "",
          title: "Notification Update"
        }
      },
      {
        path: "promotion",
        component: PromotionComponent,
        data: {
          breadcrumb: "",
          title: "Promotion"
        }
      },
      {
        path: "promotion/:promotionID/update",
        component: CreatePublicPromotionComponent,
        data: {
          breadcrumb: "",
          title: "Personal Promotion"
        }
      },
      {
        path: "promotion/:promotionID/newuser",
        component: PromotionEndUsersComponent,
        data: {
          breadcrumb: "",
          title: "Personal Promotion"
        }
      },
      {
        path: "promotion/public-promotion",
        component: CreatePublicPromotionComponent,
        data: {
          breadcrumb: "",
          title: "Public Promotion"
        }
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketingRoutingModule { }

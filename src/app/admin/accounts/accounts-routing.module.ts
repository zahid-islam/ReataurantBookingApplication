import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountsComponent } from './accounts/accounts.component';
import { ReceivableComponent } from './accounts/receivable/receivable.component';
import { ReceivedComponent } from './accounts/received/received.component';
import { PaybleComponent } from './accounts/payble/payble.component';
import { PaidComponent } from './accounts/paid/paid.component';
import { AccountRoutingContainerComponent } from './accounts/account-routing-container/account-routing-container.component';
import { WithdrawRequestComponent } from './accounts/withdraw-request/withdraw-request.component';
import { OrderPromotionListComponent } from './order-promotion/order-promotion-list/order-promotion-list.component';

const routes: Routes = [
  {
    path: '',
    component: AccountsComponent,
    data: {
      breadcrumb: ""
    },
    children: [
      {
        path: 'receivable',
        component: ReceivableComponent,
        data: {
          title: "Receivable",
          breadcrumb: "Receivable"
        }
      },
      {
        path: 'received',
        component: ReceivedComponent,
        data: {
          title: "Received",
          breadcrumb: "Received"
        }
      },
      {
        path: 'payble',
        component: AccountRoutingContainerComponent,
        data: {
          title: "",
          breadcrumb: "Payable"
        },
        children: [
          {
            path: "",
            component: PaybleComponent,
            data: {
              title: "Payable",
              breadcrumb: ""
            }
          },
          {
            path: "withdraw-request",
            component: WithdrawRequestComponent,
            data: {
              title: "Withdraw Request",
              breadcrumb: "Withdraw Request"
            }
          }
        ]
      },
      {
        path: 'paid',
        component: PaidComponent,
        data: {
          title: "Paid",
          breadcrumb: "Paid"
        }
      }
    ]
  },
  {
    path: 'order-promotion',
    component: OrderPromotionListComponent,
    data: {
      title: "Order Promotion List",
      breadcrumb: ""
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsRoutingModule { }

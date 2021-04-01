import { Orders } from "../../shared/models/orders.model";
import {
  Receivables,
  Recevied,
  Payables,
  Business,
  WithdrawRequests
} from "./business.model";
import { UserModel } from "../../user/models/user.model";

export interface IAccountPayable {
  withdrawRequestCount: number;
  prefeexAmountRequestable: number;
  otherB2BAmountRequestable: number;
}

export class PaidSummary {
  paidToPrefeex: number;
  paidToOtherB2B: number;
}
export class WithdrawSummary {
  withdrawnCount: number;
  withdrawnAmount: number;
  withdrawPendingCount: number;
  withdrawPendingAmount: number;
}
export class PayableViewDetails {
  order?: Orders = new Orders();
  receivable: Receivables = new Receivables();
  received: Recevied = new Recevied();
  payables: Payables = new Payables();
  refund: any = {};
  orderPromotion: any = {};
  sslFee: number;
  netAmount: number;
}

export class WithdrawRequestViewDetails {
  id: number;
  amount: number;
  businessId: number;
  accountPaidId: number;
  performedBy: number;
  createdAt: Date;
  updatedAt: Date;
  accountPayables: Payables[];
  business: Business = new Business();
  customer?: UserModel = new UserModel();
}
export class BusinessAccountSummary {
  receivableBalance: number;
  payableBalance: number;
  requestedBalance: number;
  paidBalance: number;
  lastAcceptedWithdrawMoneyRequest: WithdrawRequests = new WithdrawRequests();
}

export class SettlementModel {
  orderIds: any[] = [];
  settledDate: Date;
  settledTraxId: string;
}

export class SettledRequestModel {
  orderIds: any[] = [];
  settledDate: number;
  settledTraxId: string;
}

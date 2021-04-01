import { CommonType } from "./common.model";
import { UserModel } from '../../user/models/user.model';
import { Business } from '../../admin/models/business.model';

export class Orders {
  id: number;
  refId: string;
  totalInvoicePrice: number;
  creatorFirstName: string;
  creatorLastName: string;
  creatorEmail: string;
  creatorMobile: string;
  businessName: string;
  businessLocation: string;
  businessAddress: string;
  cancelerNote: string;
  creatorNote: string;
  createdAt: Date;
  scheduledAt: Date;
  serveTimeAfterScheduledAt: number;
  createDisplayName?: string;
  scheduleDisplayName?: string;
  creatorId: number;
  businessId: number;
  approverId: number;
  cancelerId: number;
  orderStatus: CommonType = new CommonType();
  paymentStatus: CommonType;
  customer: UserModel = new UserModel();
  business: Business = new Business();
  businessType: CommonType;
  foodOrders?: any[];
  personCount: number;
  orderPromotion?: any = {};
  businessVatPercentage: number;
  businessServiceChargePercentage: number;
  vatAmount: number;
  serviceChargeAmount: number;
  dineOption: CommonType = new CommonType();
}


export class Tickets {
  id: number;
  waitUntil?: number;
  waitingTime?: string;
  orderId: number;
  assignedTo?: number;
  lastActivityId: any;
  ticketStatus: CommonType = new CommonType();
  ticketType: CommonType = new CommonType();
  ticketActivity: any;
  order: Orders = new Orders();
  assignToIdDisplay?: number;
  ticketStatusDisplay?: string;
  ticketTypeDisplay?: string;
  orderStatusDisplay?: string;
  isWaitTimeExpired?: boolean;
}

export class Activitiy {
  id: number;
  createdAt: string;
  ticketStatus: string;
  userType?: string;
  performerEmail?: string;
  note: string;
  waitTime?: string;
  performerFirstName?: string;
  performerLastName?: string;
  assigneeFirstName?: string;
  assigneeLastName?: string;
  assigneeEmail?: string;
  message?: string;
  isPerformedBySystem?: boolean;
}

export interface FoodItem {
  primaryPhoto?: string;
  itemName: string[];
  price: number[];
  unitPrice: number;
  unitCount: number;
  totalPrice: number;
}

export class ReservationSearch {
  searchOrderRefId: string;
}

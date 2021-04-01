import { CommonType } from "src/app/shared/models/common.model";
import { UserModel } from "src/app/user/models/user.model";

export class Orders {
  id: number;
  refId: string;
  totalInvoicePrice: number;
  creatorFirstName: string;
  creatorLastName: string;
  creatorEmail: string;
  businessName: string;
  businessLocation: string;
  businessAddress: string;
  cancelerNote: string;
  createdAt: Date;
  scheduledAt: Date;
  canceledAt: Date;
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
}
export class Business {
  id: number;
  name: string;
  location: string;
  address: string;
  details: string;
  latitude: string;
  longitude: string;
  businessTypeId: number;
  businessStatusId: number;
  businessType: any;
  tags?: any[];
  users?: any;
  createdAt: Date;
  updatedAt: Date;
  primaryPhoto?: string;
  rating?: number;
  ratingCount?: number;
  capacity?: number;
  email?: string;
  phone?: string;
  emails?: any[] = [];
  phones?: any[] = [];
  priceRangeLower?: number;
  priceRangeUpper?: number;
  facilities?: any[];
  photos?: any[];
  sharedPercentage?: number;
  prefeexSharedPercentage?: number;
  defaultOpeningTime?: string;
  defaultClosingTime?: string;
  assignedSalesUsers?: UserModel[] = [];
  vatPercentage?: string;
  serviceChargePercentage?: string;
}

export class CreateBusiness {
  name: string;
  location: string;
  address: string;
  details: string;
  latitude: string;
  longitude: string;
  businessTypeId: number;
  tags: any[];
}

export class BusinessStatus {
  id: number;
  name: string;
}
export class BanksStatus {
  id: number;
  name: string;
}

export class BusinessType {
  id: number;
  name: string;
}

export class BusinessStatuses {
  id: number;
  name: string;
}

export class BusinessSalesUser {
  salesUserIds: number[] = [];
}

export class BusinessSearch {
  name: string;
  email: string;
  phone: string;
}

export class BusinessBankInfos {
  id?: string;
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  routingNumber?: string;
  branchName?: string;
  branchAddress?: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: BanksStatus;
}

export class Receivables {
  id: number;
  amount: number;
  pgTransactionId: string;
  orderId: string;
  order: Orders = new Orders();
  accountReceivedId: string;
  createdAt?: Date;
  updatedAt?: Date;
  paymentMethod?: BusinessStatuses = new BusinessStatuses();
  business?: Business = new Business();
  isRefundShow: boolean = false;
  isReceiveShow: boolean = false;
}
export class Recevied {
  id: number;
  amount: string;
  orderId: string;
  order: Orders = new Orders();
  receivedBy: string;
  bankTransactionId: string;
  accountReceivableId: string;
  createdAt?: Date;
  updatedAt?: Date;
  paymentMethod?: BusinessStatuses = new BusinessStatuses();
  business?: Business = new Business();
}

export class Payables {
  id: number;
  toCustomerId: number;
  orderId: string;
  order: Orders = new Orders();
  amount: string;
  sharedPercentage: number;
  accountReceivedId: number;
  accountPayableStatusId: number;
  createdAt?: Date;
  updatedAt?: Date;
  accountReceived: Recevied = new Recevied();
  business?: Business = new Business();
  withdrawRequest?: WithdrawRequests = new WithdrawRequests();
  isPrefeexchecked?: boolean;
}
export class AccountPaid {
  id: number;
  bankTransactionId: number;
  performedBy: number;
  comment: string;
  amount: number;
  withdrawMoneyRequestId: number;
  createdAt?: Date;
  updatedAt?: Date;
  business?: Business = new Business();
  customer?: UserModel = new UserModel();
}
export class WithdrawRequests {
  id: number;
  amount: number;
  businessId: number;
  accountPaidId: number;
  performedBy: number;
  preferredBankId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  business?: Business = new Business();
  customer?: UserModel = new UserModel();
}

export class RequestForReceive {
  bankTransactionId: string;
  accountReceivableId: string;
  comment?: string;
}
export class RefundRequest {
  accountReceivableId: number;
  comment?: string;
}
export class PayToCustomer {
  accountPayableId: number;
  comment?: string;
}

export class AccountSummaryForBusiness {
  receivableBalance: number;
  payableBalance: number;
  requestedBalance: number;
  paidBalance: number;
}

export class BankTransactionId {
  bankTransactionId: string;
  comment?: string;
}

export class BusinessWithdrawMoneyRequest {
  bankTransactionId: string;
  bankId?: any;
  comment?: string;
}

export class RatingsReview {
  id: number;
  orderId: number;
  businessId: number;
  user: UserModel = new UserModel();
  comment: string;
  rating: number;
  businessOrderRatingStatusId: number;
  createdAt: Date;
  updatedAt: Date;
  businessOrderRatingB2CStatus: CommonType = {} as CommonType;
}

export class CreateRestaurantOffer {
  title: string;
  activeFrom?: any;
  expiredAt: any;
  description: string;
  shouldStartFromNow: any;
  percentage?: number;
  flatAmount?: number;
  buyOneGetCount?: number;
  restaurantOfferType: string;
  businessId: number;
  foodMenuIds?: number[] = [];
  isAlwaysAvailable?: boolean;
  availableTimes?: any = []
}

export class UpdateRestaurantOffer {
  title?: string;
  description?: string;
  newFoodMenuIds?: number[] = [];
  removeFoodMenuIds?: number[] = [];
  markAsInactive?: boolean;
  isAlwaysAvailable?: boolean;
  availableTimes?: any = []
}

export class RestaurantOffer {
  title: string;
  activeFrom?: any;
  expiredAt: any;
  createdAt: any;
  updatedAt: any;
  description: string;
  percentage: string;
  flatAmount: string;
  buyOneGetCount: number;
  restaurantOfferType: CommonType = new CommonType();
  business: Business = new Business();
  foodMenuIds: number[] = [];
  creator: UserModel = new UserModel();
  restaurantOfferStatus: CommonType = new CommonType();
}




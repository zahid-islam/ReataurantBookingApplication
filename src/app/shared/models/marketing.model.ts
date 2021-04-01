import { CommonType } from "./common.model";
import { UserModel } from "../../user/models/user.model";

export class MarketingNotification {
  title: string;
  body: string;
  userIds: number[] = [];
  deeplink?: string;
  scheduledAt?: number;
  expiredAt?: number;
  data?: any = {};
}
export class AllNotification {
  id: number;
  title: string;
  body: string;
  deeplink?: string;
  scheduledAt?: number;
  expiredAt?: number;
  data?: any = {};
  publicNotificationStatus?: any = {};
  creator: UserModel = new UserModel();
  createdAt?: Date;
  updatedAt?: Date;
  receivingUserCount?: number;
  publicNotificationStatusId?: number;
}
export class Recipients {
  id: number;
  publicNotificationId: number;
  createdAt?: Date;
  updatedAt?: Date;
  recipient: UserModel = new UserModel();
  notificationStatus: CommonType = new CommonType();
  notificationSeenStatus: CommonType = new CommonType();
}

/**
 * --------------- Promotion Management
 */

export class CreatePromotion {
  autoActive: any;
  promoCode: string;
  activeFrom?: any;
  expiredAt: any;
  title: string;
  description: string;
  isPercentage: any;
  shouldStartFromNow: any;
  percentageAmountCap: string;
  percentage: string;
  flatAmount: number;
  flatAmountMinThresholdAmount: number;
  numberOfUsagePerUser: number;
  userIds?: number[];
}

export class Promotions {
  id: number;
  promoCode: string;
  activeFrom: Date;
  expiredAt: number;
  title: string;
  description: string;
  isPublic: boolean;
  personCount: number;
  isPercentage: boolean;
  percentageAmountCap: string;
  percentage: string;
  flatAmount: number;
  flatAmountMinThresholdAmount: number;
  numberOfUsagePerUser: number;
  autoActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  promotionStatus: CommonType = new CommonType();
  creator: UserModel = new UserModel();
}

export class UpdatePromotion {
  promoCode: string;
  title: string;
  description: string;
  status: string;
  newUserIds: number[];
}

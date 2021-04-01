import { CommonType } from "../../shared/models/common.model";
import { UserModel } from "../../user/models/user.model";
/**
 * -------------------- Tags ---------------------
 */
export class TagsList {
  id: number;
  name: string;
  image: string;
  tagStatus: CommonType = new CommonType();
}

export class TagStatus {
  id: number;
  name: string;
}

export class CreateTags {
  name: string;
  image: string;
}
export class UpdateTagStatus {
  tagStatus: string;
}

/**
 * -------------------- Facilities ---------------------
 */
export class CreateFacilities {
  name: string;
  facilityGroupId: number;
}
export class FacilitiesList {
  id: number;
  name: string;
  facilityStatus: CommonType = new CommonType();
  facilityGroup: CommonType = new CommonType();
}
export class FacilityStatuses {
  id: number;
  name: string;
}
export class UpdateFaciliyStatus {
  facilityStatus: string;
}

/**
 * -------------------- Facility Group ---------------------
 */
export class CreateFacilityGroup {
  name: string;
}
export class FacilityGroupItem {
  id: number;
  name: string;
  facilityGroupStatus: CommonType = new CommonType();
}
export class FacilityGroupStatuses {
  id: number;
  name: string;
}
export class UpdateFacilityGroupStatus {
  status: string;
}

/**
 * -------------------- Email ---------------------
 */

export class EmailTemplate {
  id: number;
  emailBody?: string;
  emailSubject: string;
  emailTemplateType: TemplateTypes = new TemplateTypes();
}
export class CreateEmailTemplate {
  emailSubject: string;
  templateVariableIds?: any[];
  templateType: string;
  emailBody: string;
}
export class TemplateTypes {
  id: number;
  name: string;
  isActive: boolean = false;
}
export class UpdateEmailTemplate {
  templateVariableIds: any[];
  emailBody: any;
  emailSubject: string;
}

/**
 *  ----------------------------- Refund Policies ------------------
 */

export class RefundPoliciesList {
  id: number;
  activeFrom: Date;
  activeUpto: Date;
  creatorId: number;
  createdAt: Date;
  updatedAt: Date;
  creator: UserModel = new UserModel();
}

export class RefundPolicy {
  policyApplyFromDate: any;
  policyBreakdowns: PolicyBreakdown[] = [];
}

export class PolicyBreakdown {
  b2bPercentage: number;
  b2cPercentage: number;
  prefeexPercentage: number;
  isNoRefund: boolean;
  appliedMillis: number;
  isAppliedBeforeMillis: boolean;
}

export class ParticularRefundPolicy {
  id: number;
  activeFrom: Date;
  activeUpto: Date;
  creatorId: number;
  createdAt: Date;
  updatedAt: Date;
  policyBreakdowns: PolicyBreakdowns[] = [];
}

export class PolicyBreakdowns {
  id: number;
  refundPolicyId: number;
  b2bPercentage: number;
  b2cPercentage: number;
  prefeexPercentage: number;
  isNoRefund: boolean;
  appliedMillis: any;
  isAppliedBeforeMillis: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 *  ------------------- SMS Gateway   ---------------------------
 */

export class SMSGatewayBalance {
  balance: string;
  updatedAt: string;
}

/**
 *  ------------------- BusinessClassification   ---------------------------
 */
// Create and Edit both will this this Modal
export class BusinessClassificationsModel {
  name: string;
  status: string;
}

export class BusinessClassifications {
  id: number;
  name: string;
  classificationStatus: CommonType = new CommonType();
  creator: UserModel = new UserModel();
}
/**
 *  ------------------- App Versionings   ---------------------------
 */

export class AppVersionings {
  id: number;
  semver: string;
  semverMajor: number;
  semverMinor: number;
  semverPatch: number;
  buildNumber: number;
  clientPlatform: string;
  forced: boolean;
  createdAt: Date;
  appVersioningStatus: CommonType = new CommonType();
  creator?: UserModel = new UserModel();
  updatedAt?: Date;
}
export class CreateAppVersioning {
  semver: string;
  buildNumber: number;
  clientPlatform: string;
  forced: any;
}
export class UpdateAppVersioningStatus {
  status: string;
}






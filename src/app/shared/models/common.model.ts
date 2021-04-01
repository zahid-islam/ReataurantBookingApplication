export class RoleType {
  id: number;
  name: string;
  display: string;
}

export class CommonType {
  id: number;
  name: string;
}

export class StatisticModel {
  count: number;
  ticketStatus: any;
}

export class TicketType {
  id: number;
  name: string;
  display?: string;
}

export class CustomUserType {
  id: number;
  name: string;
  isAccessible: boolean;
}

export class UpdateAccessControl {
  id: number;
  public?: string;
  userTypeIds?: number[];
}

export interface NavItem {
  displayName: string;
  disabled?: boolean;
  imagePath?: string;
  listElementId?: string;
  route?: string;
  action?: string[];
  children?: NavItem[];
}

export class AccessControl {
  id: number;
  verb: string;
  endpoint: string;
  public: boolean;
  userTypes: CustomUserType[] = [];
}

export class SortingObj {
  createdAt: boolean = true;
  orderId: boolean = true;
  amount: boolean = true;
}

export class SortingWithdrawPaid {
  createdAt: boolean = true;
  amount: boolean = true;
}

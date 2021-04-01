import { CommonType } from '../../shared/models/common.model';

export class UserLogin {
  email: string;
  password: string;
  userType: string;
}

export class Users {
  id: number;
  firstName: string;
  email: string;
  gender: number;
  password: string;
  UserStatus: UserStatus;
  UserType: UserType;
}

export class UserStatus {
  id: number;
  name: string;
}

export class UserType {
  id: number;
  name: string;
}

export class UserModel {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: number;
  phone?: string;
  photo?: string;
  // phones?: CustomerPhone[] = [];
  dob?: Date;
  address: string;
  country?: string;
  createdAt?: string;
  updatedAt?: Date;
  businessId?: number;
  userStatus?: any;
  userType?: any;
  displayName?: string;
  checked?: boolean = false;
  isEmailVerified?: boolean;
  password?: any;
  mobile?: string;
  // userOAuths: AuthUser[] = [];
}

export class AuthUser {
  oAuthUserId: any;
  oAuthProvider: CommonType = new CommonType();
}

export class CustomerPhone {
  id: number;
  phone: string;
  isVerified: boolean;
}

export class UserSearch {
  name: string;
  email?: string;
  mobile: string;
}

export class ForgetPassword {
  email?: string;
  userType?: string;
}
export class NewPassword {
  newPassword?: string;
  confirmNewPassword?: string;
}

export class InternalUsersUpdate {
  email: string;
  userType: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  country?: string;
  dob?: Date;
  photo?: string;
}






import { UserModel } from './../../user/models/user.model';
import { UtilityService } from './../services/utility.service';
import { AppConstants } from "./../constants/app-constants";

export class AuthorizeAccess {

  constructor(private utilityService: UtilityService) { }

  //Used for authorize method access.
  public static authorize(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // keep a reference to the original function
    const originalValue = descriptor.value;

    // Replace the original function with a wrapper
    descriptor.value = function (...args: any[]) {
      let user: UserModel = this.utilityService.getUserPayload();
      if (AuthorizeAccess.isAuthenticated(user)) {
        return originalValue.apply(this, args);
      } else {
        let businessId = args[1].id;
        let currBusiness = this.allBusinesses.find(item => {
          return item.id == parseInt(businessId);
        });
        let currBusinessIndex = this.allBusinesses.findIndex(item => {
          return item.id == parseInt(businessId);
        });

        setTimeout(() => {
          var statusId = currBusiness.businessStatus.id;
          this.allBusinesses[currBusinessIndex].businessStatusId = statusId;
        }, 0);

        console.log(this.allBusinesses[currBusinessIndex]);
      }
    };
  }

  public static isAuthenticated(user: any) {
    return false;
  }

  public getUserType() {
    let user: UserModel = this.utilityService.getUserPayload();
    if (user.userType.name != "SUPER_ADMIN") {
    }
  }
}

import { UtilityService } from './utility.service';
import { AppConstants } from "./../constants/app-constants";
import { Injectable  } from "@angular/core";;
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { UserModel } from '../../user/models/user.model';


@Injectable({
  providedIn: "root"
})
export class AuthGuardService implements CanActivate {
  constructor(
    private router: Router,
    private utilityService: UtilityService
  ) { }


  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const token = localStorage.getItem(AppConstants.TOKEN);
    if (token == null) {
      return true;
    } else {
      const user: UserModel = this.utilityService.getUserPayload();
      if (user && user.userType && (user.userType.name !== AppConstants.END_USER && user.userType.name !== AppConstants.BUSINESS)) {
        this.router.navigate(["/admin/admin-dashboard"]);
        return false;
      } else {
        return true;
      }
    }
  }
}

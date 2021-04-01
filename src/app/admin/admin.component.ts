import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { ToastrManager } from "ng6-toastr-notifications";

import { UtilityService } from "./../shared/services/utility.service";
import { MenuItemService } from "./../shared/services/menu-item.service";
import { NavItem } from "../shared/models/common.model";
import { UserModel } from "../user/models/user.model";
import { CreateBusinessService } from "./services/create-business.service";
import { Business } from "./models/business.model";
import { SharedDataService } from "../shared/services/shared-data.service";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class AdminComponent implements OnInit {
  isImgLoading: boolean;
  public businessUser: UserModel = new UserModel();
  businessProfile: Business = new Business();
  public currentDate = new Date();
  public returnUrl: string;
  sidebarHover: boolean;
  leftSlideNavtoggle = false;
  rightSlideNavtoggle = false;
  userType: string;
  businessName: string;
  navBarItems: NavItem[] = [];
  menuItem: NavItem[];
  businessId: number;

  route: string;
  constructor(
    private router: Router,
    private utility: UtilityService,
    private menuService: MenuItemService,
    private businessService: CreateBusinessService,
    private sharedService: SharedDataService,
    private toastr: ToastrManager
  ) {
    this.sidebarHover = false;
    this.isImgLoading = true;
  }

  ngOnInit() {
    this.returnUrl = "/user/sign-in";
    this.menuItem = this.menuService.menuItems;
    let user: UserModel = this.utility.getUserPayload();
    this.userType = user.userType.name
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b[a-z]/g, letter => {
        return letter.toUpperCase();
      });
    this.setMenusForSelectedUserType(user.userType.name);
    this.businessUser = user;

    // To show Business name on the Top Navbar when User visit perticular business from Manage business Manu
    this.router.events.subscribe(events => {
      if (events instanceof NavigationEnd) {
        this.businessId = this.sharedService.getBusinessIdFromUrl(
          this.router.url.toString()
        );

        if (this.businessId) {
          this.getBusinessById(this.businessId);
        } else if (!this.businessId) {
          this.businessProfile.name = "";
        }
      }
    });
  }
  onLoad() {
    this.isImgLoading = false;
  }
  updateBusinessUser(user: UserModel) {
    this.businessUser = user;
  }

  setMenusForSelectedUserType(role: string) {
    let menus = Object.keys(this.menuItem);
    menus.forEach(key => {
      if (key == role) {
        this.navBarItems = this.menuItem[key];
      }
    });
  }

  public toggleLeftSlideNav() {
    this.leftSlideNavtoggle = !this.leftSlideNavtoggle;
  }

  public toggleRightSlideNav() {
    this.rightSlideNavtoggle = !this.rightSlideNavtoggle;
  }

  logout(): void {
    for (let i = 1; i <= localStorage.length; i++) {
      let keys = localStorage.key(i - 1);
      localStorage.removeItem(keys);
      i--;
    }
    this.router.navigateByUrl(this.returnUrl);
  }

  private getBusinessById(id: number) {
    this.businessService.getBusinessesById(id).subscribe(
      (res: any) => {
        this.businessProfile = res.body.data.business;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }
}

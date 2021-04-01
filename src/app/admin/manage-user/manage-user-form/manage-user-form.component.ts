import { UtilityService } from './../../../shared/services/utility.service';
import { UserLogin, UserModel } from "./../../../user/models/user.model";
import { ToastrManager } from "ng6-toastr-notifications";
import { SharedDataService } from "../../../shared/services/shared-data.service";
import { AuthService } from "./../../../user/services/auth.service";
import { MenuItemService } from "./../../../shared/services/menu-item.service";
import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { NgForm } from "@angular/forms";
import { CommonType } from "./../../../shared/models/common.model";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-manage-user-form",
  templateUrl: "./manage-user-form.component.html",
  styleUrls: ["./manage-user-form.component.scss"]
})
export class ManageUserFormComponent implements OnInit {
  @Output() closeModal = new EventEmitter();
  userRoleTypes: CommonType[];
  createUserModel: UserLogin = new UserLogin();
  roleType: CommonType = new CommonType();
  loggedInUserType: string;

  constructor(
    private menuService: MenuItemService,
    private authService: AuthService,
    private toastr: ToastrManager,
    private sharedData: SharedDataService,
    private router: Router,
    private utility: UtilityService,
  ) { }

  ngOnInit() {
    let user: UserModel = this.utility.getUserPayload();
    this.loggedInUserType = user.userType.name;
    this.getRoleTypes();
  }

  getRoleTypes() {
    this.menuService.getInternalUserType().subscribe(
      (res: any) => {
        this.userRoleTypes = res.body.data.userTypes;
        if (this.loggedInUserType == 'ADMIN') {
          let index = this.userRoleTypes.findIndex(val => val.name == 'ADMIN');
          if (index != -1) {
            this.userRoleTypes.splice(index, 1);
          }
        }
      },
      err => { }
    );
  }

  changeUserType(role: CommonType) {
    this.roleType = role;
    this.createUserModel.userType = role.name;
  }

  submitUser(createUserForm: NgForm) {
    if (createUserForm) {
      this.authService.createInternalUser(this.createUserModel).subscribe(
        (res: any) => {
          this.setInternalUserToLocalsSorage(this.createUserModel);
          this.toastr.successToastr(res.body.message.en);
          this.router.navigate(["admin/manage-user/user-view"], { state: { data: this.createUserModel } });
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
    } else {
      this.toastr.errorToastr("Please enter valid data");
    }
  }

  // Set business user to local storage for sharing with user details view.
  setInternalUserToLocalsSorage(internalUser: any) {
    this.sharedData.changeInternalUser(internalUser);
  }
}

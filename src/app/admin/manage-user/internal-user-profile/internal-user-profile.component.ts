import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgForm } from "@angular/forms";
import { AuthService } from "src/app/user/services/auth.service";
import { UserModel, InternalUsersUpdate } from "src/app/user/models/user.model";
import { ToastrManager } from "ng6-toastr-notifications";
import { SharedDataService } from "../../../shared/services/shared-data.service";
import { FoodMenuService } from '../../business/food-menu/foodMenuServices/food-menu.service';
import { UtilityService } from './../../../shared/services/utility.service';
import { CommonType } from "./../../../shared/models/common.model";
import { MenuItemService } from "./../../../shared/services/menu-item.service";

@Component({
  selector: "app-internal-user-profile",
  templateUrl: "./internal-user-profile.component.html",
  styles: []
})
export class InternalUserProfileComponent implements OnInit, OnDestroy {
  isImgLoading: boolean;
  isApiSubmit: boolean;
  fileData: File = null;
  imagePath: any;
  imgURL: any;
  emaill: string;

  imagePreview: string;
  userId: number;
  public internalUser: InternalUsersUpdate = new InternalUsersUpdate();
  userModel: any = {};
  private subscribeParam: any;

  roleType: CommonType = new CommonType();
  loggedInUser: UserModel = new UserModel();
  userRoleTypes: CommonType[];

  constructor(
    private router: Router,
    private toastr: ToastrManager,
    private route: ActivatedRoute,
    private authService: AuthService,
    private foodMenuService: FoodMenuService,
    private utility: UtilityService,
    private menuService: MenuItemService,
  ) {
    this.isImgLoading = true;
    this.isApiSubmit = false;
  }

  ngOnInit() {
    this.subscribeParam = this.route.params.subscribe(params => {
      this.userId = +params["id"];
      if (this.userId) {
        this.getInternalUserById(this.userId);
      }
    });
    let user: UserModel = this.utility.getUserPayload();
    this.loggedInUser = user;
    this.getRoleTypes();
  }

  onLoad() {
    this.isImgLoading = false;
  }

  getRoleTypes() {
    this.menuService.getInternalUserType().subscribe(
      (res: any) => {
        this.userRoleTypes = res.body.data.userTypes;
        // if (this.loggedInUserType == 'ADMIN') {
        //   let index = this.userRoleTypes.findIndex(val => val.name == 'ADMIN');
        //   if (index != -1) {
        //     this.userRoleTypes.splice(index, 1);
        //   }
        // }
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
       }
    );
  }
  /**
   * getInternalUserById
   *
   */
  public getInternalUserById(userId: number) {
    this.authService.getUserById(userId).subscribe(
      (res: any) => {
        let data = res.body.data;
        this.internalUser.firstName = data.user.firstName;
        this.internalUser.lastName = data.user.lastName;
        this.internalUser.email = data.user.email;
        this.internalUser.photo = data.user.photo;
        this.internalUser.dob = data.user.dob == null ? null :  new Date(data.user.dob) ;
        this.internalUser.address = data.user.address;
        this.internalUser.country = data.user.country;
        this.internalUser.userType = data.user.userType.name;
        this.roleType = data.user.userType;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  /**
   * update Internal user profile
   */
  public updateInternalUserProfile(internalUser: NgForm) {
    if (this.fileData) {
      const formData = new FormData();
      formData.append("files", this.fileData);
      this.foodMenuService.uploadImage(formData).subscribe(
        (res: any) => {
          delete this.internalUser.email;
          for (let key of Object.keys(this.internalUser)) {
            let value = this.internalUser[key];
            if (value) {
              this.userModel[key] = value;
            }
          }
          this.userModel.photo = res.body.data.results[0].Location;
          let date = new Date(this.internalUser.dob);
          if (date) {
            this.userModel.dob = date.getTime() - (date.getTimezoneOffset() * 60 * 1000);
          }
          this.isApiSubmit = true;
          this.authService
            .updateUserEntity(this.userModel, this.userId)
            .subscribe(
              (res: any) => {
                this.getInternalUserById(this.userId);
                this.toastr.successToastr(res.body.message.en);
                this.isApiSubmit = false;
              },
              err => {
                this.toastr.errorToastr(err.error.message.en);
                this.isApiSubmit = false;
              },
              () => {
                this.isApiSubmit = false;
              }
            );
        },
        err => {
          this.toastr.errorToastr("Image upload failed");
        }
      );
    } else {
      delete this.internalUser.email;
      for (let key of Object.keys(this.internalUser)) {
        let value = this.internalUser[key];
        if (value) {
          this.userModel[key] = value;
        }
      }

      let date = new Date(this.internalUser.dob);
      if (date) {
        this.userModel.dob = date.getTime() - (date.getTimezoneOffset() * 60 * 1000);
      }
      this.isApiSubmit = true;
      this.authService.updateUserEntity(this.userModel, this.userId).subscribe(
        (res: any) => {
          this.getInternalUserById(this.userId);
          this.toastr.successToastr(res.body.message.en);
          this.isApiSubmit = false;
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
          this.isApiSubmit = false;
        },
        () => {
          this.isApiSubmit = false;
        }
      );
    }
  }

  /**
   * fileProcess
   */

  fileProcess(photo: any) {
    this.fileData = <File>photo.files[0];
    var reader = new FileReader();
    this.imagePath = <File>photo.files;
    reader.readAsDataURL(this.fileData);
    reader.onload = _event => {
      this.imgURL = reader.result ? reader.result : null;
    };
  }

  changeUserType(role: CommonType) {
    this.roleType = role;
    this.internalUser.userType = role.name;
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscribeParam.unsubscribe();
  }
}

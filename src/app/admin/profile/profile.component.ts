import { AdminComponent } from './../admin.component';
import { FoodMenuService } from './../business/food-menu/foodMenuServices/food-menu.service';
import { ManageService } from './../services/manage.service';
import { ToastrManager } from "ng6-toastr-notifications";
import { Component, OnInit, Output, EventEmitter, ElementRef, ViewChild } from "@angular/core";
import { NgForm } from '@angular/forms';
import { UserModel } from 'src/app/user/models/user.model';

declare var jQuery: any;

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
})
export class ProfileComponent implements OnInit {
  @ViewChild('CheckYourInboxModal', { static: false }) CheckYourInboxModal: ElementRef;

  isImgLoading: boolean;
  fileData: File = null;
  imagePath: any;
  imgURL: any;
  emaill: string;
  isEmailVerifiedShow: boolean;
  isEmailVerifiedHide: boolean;
  imagePreview: string;
  isApiSubmit: boolean;

  @Output() closeModal = new EventEmitter();

  user: UserModel = new UserModel();
  userModel: any = {};
  isVisiblePasswordModal: boolean = false;

  constructor(
    private manageService: ManageService,
    private toastr: ToastrManager,
    private menuService: FoodMenuService,
    private adminComp: AdminComponent
  ) {
    this.isImgLoading = true;
    this.isEmailVerifiedShow = false;
    this.isEmailVerifiedHide = false;
    this.isApiSubmit = false;
  }

  ngOnInit() {
    this.getUserInfoById();
  }

  getUserInfoById() {
    this.manageService.getUserById().subscribe(
      (res: any) => {
        let user = res.body.data.user;
        this.user.photo = user.photo;
        this.user.firstName = user.firstName;
        this.user.lastName = user.lastName;
        // this.user.phone = user.phone;
        this.user.dob = user.dob == null ? null : new Date(user.dob);
        this.user.address = user.address;
        this.user.country = user.country;
        this.emaill = user.email;
        this.user.isEmailVerified = user.isEmailVerified;
        this.adminComp.updateBusinessUser(user);

        if (user.isEmailVerified) {
          this.isEmailVerifiedShow = true;
        } else {
          this.isEmailVerifiedHide = true;
        }
      },
      err => { }
    );
  }


  onLoad() {
    setTimeout(() => {
      if (this.user.photo == null) {
        this.isImgLoading = false;
      } else if (this.user.photo) {
        this.isImgLoading = false;
      }
    }, 2000);
  }

  fileProcess(photo: any) {
    this.fileData = <File>photo.files[0];
    var reader = new FileReader();
    this.imagePath = <File>photo.files;
    reader.readAsDataURL(this.fileData);
    reader.onload = (_event) => {
      this.imgURL = reader.result ? reader.result : null;
    }
  }

  public closePasswordModal() {
    this.isVisiblePasswordModal = false;
  }

  updatePassword() {
    this.isVisiblePasswordModal = true;
  }

  submitProfile(profileForm: NgForm) {
    if (this.fileData) {
      const formData = new FormData();
      formData.append('files', this.fileData);
      this.menuService.uploadImage(formData).subscribe(
        (res: any) => {
          for (let key of Object.keys(this.user)) {
            let value = this.user[key];
            if (value && key != 'isEmailVerified') {
              this.userModel[key] = value;
            }
          }
          this.userModel.photo = res.body.data.results[0].Location;

          let date = new Date(this.user.dob);

          if (date) {
            this.userModel.dob = date.getTime() - (date.getTimezoneOffset() * 60 * 1000);
          }
          this.isApiSubmit = true;
          this.manageService.updateProfile(this.userModel).subscribe(
            (res: any) => {
              this.getUserInfoById();
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
        err => { this.toastr.errorToastr("Image upload failed"); }
      );
    }
    else {
      for (let key of Object.keys(this.user)) {
        let value = this.user[key];
        if (value && key != 'isEmailVerified') {
          this.userModel[key] = value;
        }
      }

      let date = new Date(this.user.dob);
      if (date) {
        this.userModel.dob = date.getTime() - (date.getTimezoneOffset() * 60 * 1000);
      }
      this.isApiSubmit = true;
      this.manageService.updateProfile(this.userModel).subscribe(
        (res: any) => {
          this.getUserInfoById();
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

  requestForSendVerificationEmail() {
    this.manageService.requestForSendVerificationEmail().subscribe(
      (res: any) => {
        jQuery(this.CheckYourInboxModal.nativeElement).modal('show');
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );

  }

}

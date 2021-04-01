import { CustomUserType, AccessControl, UpdateAccessControl } from '../../../shared/models/common.model';
import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { ToastrManager } from "ng6-toastr-notifications";
import { MenuItemService } from './../../../shared/services/menu-item.service';
import { AuthService } from '../../../user/services/auth.service';

@Component({
  selector: 'app-user-access-control',
  templateUrl: './user-access-control.component.html',
  styleUrls: ['./user-access-control.component.scss']
})
export class UserAccessControlComponent implements OnInit, AfterViewInit {

  allUserType: CustomUserType[] = [];
  accessControl: AccessControl[] = [];
  accessControlModel: UpdateAccessControl[] = [];
  isLoading: boolean;
  isApiSubmit: boolean;
  isApiSubmitRefresh: boolean;
  formatedAllUserType: any = {};

  constructor(
    private authService: AuthService,
    private menuItemService: MenuItemService,
    private toastr: ToastrManager,
    private elementRef: ElementRef
  ) {
    this.isApiSubmit = false;
    this.isApiSubmitRefresh = false;
  }

  ngOnInit() {
    this.getAllUserTypes();
  }

  ngAfterViewInit() {
  }
  getAllUserTypes() {
    this.menuItemService.getAllUserType().subscribe(
      (res: any) => {
        this.allUserType = res.body.data.userTypes;
        if (this.allUserType.length) {
          this.formatedAllUserType = {};
          this.allUserType.forEach((item) => {
            item.isAccessible = false;
            item.name = item.name.replace(/_/g, " ").toLowerCase().replace(/\b[a-z]/g, (letter) => {
              return letter.toUpperCase();
            });
            this.formatedAllUserType[item.id] = item;
          });
          this.getAllRegisteredRoutes();
        }
      },
      (err: any) => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  setSelectedItemIntoList(apiItem: any) {
    let resultIndex = this.accessControlModel.findIndex(({ id }) => id === apiItem.id);
    if (resultIndex !== -1) {
      this.accessControlModel.splice(resultIndex, 1);
    }
    let accControlItem = {} as UpdateAccessControl;

    accControlItem.id = apiItem.id;
    accControlItem.public = apiItem.public ? "true" : "false";
    let userTypeIdForUpdate = apiItem.userTypes.filter(obj => {
      return obj.isAccessible
    }).map(obj => obj.id);

    if (userTypeIdForUpdate.length) {
      accControlItem.userTypeIds = userTypeIdForUpdate;
    }

    if (accControlItem.public || accControlItem.userTypeIds.length) {
      this.accessControlModel.push(accControlItem);
    }
  }

  getAllRegisteredRoutes(loading?: boolean) {
    this.isLoading = loading == false ? loading : true;
    this.authService.getAllRegisteredRoutes().subscribe(
      (res: any) => {
        this.accessControl = res.body.data.acls;
        this.accessControl.forEach(item => {
          //Copy formatedAllUserType object without reference
          let customArrOfUserType = JSON.parse(JSON.stringify(this.formatedAllUserType));

          //Formated customArrOfUserType for each access control.
          item.userTypes.forEach((obj: CustomUserType) => {
            let userType = customArrOfUserType[obj.id];
            if (userType) {
              userType.isAccessible = true;
            }
          });

          //Assign formated array of all user type.
          item.userTypes = Object.values(customArrOfUserType);
        });
      },
      (err: any) => {
        this.toastr.errorToastr(err.error.message.en);
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  updateAccessControl() {
    if (this.accessControlModel.length) {
      this.isApiSubmit = true;
      this.authService.updateAccessControl(this.accessControlModel).subscribe(
        (res: any) => {
          this.accessControlModel = [];
          this.toastr.successToastr(res.body.message.en);
        },
        (err: any) => {
          this.toastr.errorToastr(err.error.message.en);
          this.isApiSubmit = false;

        },
        () => {
          this.isApiSubmit = false;
        }
      );
    }
    else {
      this.toastr.errorToastr('You have no update entry, Please check an api!');
    }
  }

  registerAllRoutes() {
    this.isApiSubmitRefresh = true;
    this.authService.registerAllRoutes().subscribe(
      (res: any) => {
        this.toastr.successToastr(res.body.message.en);
        this.getAllRegisteredRoutes(false);
        this.isApiSubmitRefresh = false;
      },
      (err: any) => {
        this.toastr.errorToastr(err.error.message.en);
        this.isApiSubmitRefresh = false;
      },
      () => {
        this.isApiSubmitRefresh = false;
      }
    );
  }

}

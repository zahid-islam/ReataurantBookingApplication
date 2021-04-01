/**
 * Framework dependency
 */

import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ManageUsersComponent } from "./manage-users.component";
import { ManageUserComponent } from "./manage-user/manage-user.component";
import { ManageUserFormComponent } from "./manage-user-form/manage-user-form.component";
import { ManageUserViewComponent } from "./manage-user-view/manage-user-view.component";
import { UserAccessControlComponent } from "./user-access-control/user-access-control.component";
import { InternalUserProfileComponent } from './internal-user-profile/internal-user-profile.component';

const routes: Routes = [
  {
    path: "",
    component: ManageUsersComponent,
    data: {
      breadcrumb: ""
    },
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "user",
        data: {
          breadcrumb: ""
        }
      },
      {
        path: "user",
        component: ManageUserComponent,
        data: { title: "User", breadcrumb: "" }
      },
      {
        path: "user/:id",
        component: InternalUserProfileComponent,
        data: { title: "Internal User Profile", breadcrumb: "" }
      },
      {
        path: "user-view",
        component: ManageUserViewComponent,
        data: {
          title: "Internal User",
          breadcrumb: ""
        }
      },
      {
        path: "user-create",
        component: ManageUserFormComponent,
        data: {
          title: "User Create",
          breadcrumb: ""
        }
      },
      {
        path: "access-control",
        component: UserAccessControlComponent,
        data: { title: "Access control", breadcrumb: "" }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageUserRoutingModule {}

import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { BusinessComponent } from "./business.component";
import { TableReservationListComponent } from "./../layout/table-reservation-list/table-reservation-list.component";
import { AddOnsFormComponent } from "./food-menu/add-ons-form/add-ons-form.component";
import { AddOnsComponent } from "./food-menu/add-ons/add-ons.component";
import { MenuFormComponent } from "./food-menu/menu-form/menu-form.component";
import { MenuComponent } from "./food-menu/menu/menu.component";
import { BusinessInfoComponent } from "./business-info/business-info.component";
import { BusinessActivitiesComponent } from "./business-activities/business-activities.component";
import { BusinessProfileComponent } from "./business-profile/business-profile.component";

import { BusinessContainerDynamicComponent } from "./business-container-dynamic/business-container-dynamic.component";
import { ProfileContainerDynamicComponent } from "./business-container-dynamic/profile-container-dynamic.component";
import { MenuContainerDynamicComponent } from "./business-container-dynamic/menu-container-dynamic.component";
import { LayoutContainerDynamicComponent } from "./business-container-dynamic/layout-container-dynamic.component";

import { BusinessProfileFormComponent } from "./business-profile-form/business-profile-form.component";
import { LayoutComponent } from "../layout/layout.component";
import { LayoutListComponent } from "../layout/layout-list/layout-list.component";
import { LayoutViewComponent } from "../layout/layout-view/layout-view.component";
import { ReviewsComponent } from "./reviews/reviews.component";
import { BusinessPromotionComponent } from './business-promotion/business-promotion.component';
import { BusinessPromotionFormComponent } from './business-promotion/business-promotion-form/business-promotion-form.component';
import { BusinessPromotionMenuComponent } from './business-promotion/business-promotion-menu/business-promotion-menu.component';
const routes: Routes = [
  {
    path: "",
    component: BusinessComponent,
    children: [
      {
        path: "",
        component: BusinessInfoComponent,
        data: {
          title: "Business List",
          breadcrumb: ""
        }
      },
      {
        path: "manage-business/:id",
        component: BusinessContainerDynamicComponent,
        data: {
          title: "",
          breadcrumb: ""
        },
        children: [
          {
            path: "",
            component: ProfileContainerDynamicComponent,
            data: {
              title: "Business Profile",
              breadcrumb: "Profile"
            },
            children: [
              {
                path: "",
                component: BusinessProfileComponent,
                data: {
                  title: "Business Profile",
                  breadcrumb: ""
                }
              },
              {
                path: "profile-setting",
                component: BusinessProfileFormComponent,
                data: {
                  title: "Profile setting",
                  breadcrumb: "Setting"
                }
              }
            ]
          },
          {
            path: "food-menu",
            component: MenuContainerDynamicComponent,
            data: {
              title: "",
              breadcrumb: "Menu"
            },
            children: [
              {
                path: "",
                component: MenuComponent,
                data: {
                  title: "Menu",
                  breadcrumb: ""
                }
              },
              {
                path: "create",
                component: MenuFormComponent,
                data: {
                  title: "create-menu",
                  breadcrumb: "Create"
                }
              },
              {
                path: "create/:id",
                component: MenuFormComponent,
                data: {
                  title: "create-menu",
                  breadcrumb: "Create"
                }
              },
              {
                path: ":id",
                component: MenuContainerDynamicComponent,
                data: {
                  title: "Addons",
                  breadcrumb: "Addons"
                },
                children: [
                  {
                    path: "",
                    component: AddOnsComponent,
                    data: {
                      title: "Addons"
                    }
                  },
                  {
                    path: "create",
                    component: AddOnsFormComponent,
                    data: {
                      title: "Create Addons",
                      breadcrumb: "Create"
                    }
                  },
                  {
                    path: "create/:id",
                    component: AddOnsFormComponent,
                    data: {
                      title: "Edit Addons",
                      breadcrumb: "Edit"
                    }
                  }
                ]
              }
            ]
          },
          {
            path: "activities",
            component: BusinessActivitiesComponent,
            data: {
              title: "Business Reservations",
              breadcrumb: "Reservation"
            }
          },
          {
            path: "layout",
            component: LayoutContainerDynamicComponent,
            data: {
              title: "",
              breadcrumb: "Layout"
            },
            children: [
              {
                path: "floor/:data",
                component: LayoutComponent,
                data: {
                  title: "Create Floor Plan",
                  breadcrumb: "Create Floor Plan"
                }
              },
              {
                path: "",
                component: LayoutContainerDynamicComponent,
                data: {
                  title: "Layout",
                  breadcrumb: ""
                },
                children: [
                  {
                    path: "",
                    component: LayoutViewComponent,
                    data: {
                      title: "Layout",
                      breadcrumb: ""
                    }
                  },
                  {
                    path: "table-reservation",
                    component: TableReservationListComponent,
                    data: {
                      title: "Table Reservation",
                      breadcrumb: "Reservation"
                    }
                  }
                ]
              },
              {
                path: "layout-list",
                component: BusinessComponent,
                data: {
                  title: "",
                  breadcrumb: "Floor list"
                },
                children: [
                  {
                    path: "",
                    component: LayoutListComponent,
                    data: {
                      title: "Floor list",
                      breadcrumb: ""
                    }
                  },
                  {
                    path: "floor",
                    component: LayoutContainerDynamicComponent,
                    data: {
                      title: "",
                      breadcrumb: ""
                    },
                    children: [
                      {
                        path: "create/:data",
                        component: LayoutComponent,
                        data: {
                          title: "Create Floor Plan",
                          breadcrumb: "Create Floor Plan"
                        }
                      },
                      {
                        path: ":data",
                        component: LayoutComponent,
                        data: {
                          title: "Edit Floor Plan",
                          breadcrumb: "Edit Floor Plan"
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            path: "reviews",
            component: ReviewsComponent,
            data: {
              title: "Reviews",
              breadcrumb: "Review"
            }
          },
          {
            path: "business-promotion",
            component: BusinessPromotionComponent,
            data: {
              title: "Business Promotion",
              breadcrumb: "Promotion List"
            }
          },
          {
            path: "promotion-form",
            component: BusinessPromotionFormComponent,
            data: {
              title: "Business Promotion Create",
              breadcrumb: "New Promotion"
            }
          },
          {
            path: "promotion-form/:id",
            component: BusinessPromotionFormComponent,
            data: {
              title: "Business Promotion Edit",
              breadcrumb: "Promotion Edit"
            }
          },
          {
            path: "promotion-menu/:id",
            component: BusinessPromotionMenuComponent,
            data: {
              title: "Business Promotion Menu",
              breadcrumb: "Add Menu into Promotion"
            }
          },
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessRoutingModule { }

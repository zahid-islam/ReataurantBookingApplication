import { RectangleComponent } from "./../layout/components/rectangle/rectangle.component";
import { ShapeComponent } from "./../layout/components/shape/shape.component";
import { DynamicSvgDirective } from "./../layout/directives/dynamic-svg.directive";
import { LayoutComponent } from "./../layout/layout.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

/**
 * Third party dependency
 */
import { DropdownModule } from "primeng/dropdown";
import { PaginatorModule } from "primeng/paginator";
import { TableModule } from "primeng/table";
import { DialogModule } from "primeng/dialog";
import { CalendarModule } from "primeng/calendar";

import { BusinessRoutingModule } from "./business-routing.module";
import { BusinessComponent } from "./business.component";

import { BusinessInfoComponent } from "./business-info/business-info.component";
import { BusinessActivitiesComponent } from "./business-activities/business-activities.component";
import { BusinessProfileComponent } from "./business-profile/business-profile.component";

import { BusinessContainerDynamicComponent } from "./business-container-dynamic/business-container-dynamic.component";
import { ProfileContainerDynamicComponent } from "./business-container-dynamic/profile-container-dynamic.component";
import { MenuContainerDynamicComponent } from "./business-container-dynamic/menu-container-dynamic.component";
import { LayoutContainerDynamicComponent } from "./business-container-dynamic/layout-container-dynamic.component";

import { ProfileDynamicComponent } from "./profile-dynamic/profile-dynamic.component";
import { BusinessProfileFormComponent } from "./business-profile-form/business-profile-form.component";
import { MenuComponent } from "./food-menu/menu/menu.component";
import { AddOnsFormComponent } from "./food-menu/add-ons-form/add-ons-form.component";
import { AddOnsComponent } from "./food-menu/add-ons/add-ons.component";
import { MenuFormComponent } from "./food-menu/menu-form/menu-form.component";
import { FoodMenuContainerComponent } from "../../shared/comp-container/food-menu-container.component";
import { SharedModule } from "../../shared/shared.module";
import { LayoutViewComponent } from "../layout/layout-view/layout-view.component";
import { LayoutListComponent } from "../layout/layout-list/layout-list.component";
import { TableReservationListComponent } from "../layout/table-reservation-list/table-reservation-list.component";
import { ReviewsComponent } from "./reviews/reviews.component";
import { BusinessPromotionComponent } from './business-promotion/business-promotion.component';
import { BusinessPromotionFormComponent } from './business-promotion/business-promotion-form/business-promotion-form.component';
import { BusinessPromotionMenuComponent } from './business-promotion/business-promotion-menu/business-promotion-menu.component';

@NgModule({
  declarations: [
    BusinessComponent,
    BusinessInfoComponent,
    BusinessActivitiesComponent,
    BusinessProfileComponent,
    BusinessContainerDynamicComponent,
    ProfileDynamicComponent,
    BusinessProfileFormComponent,
    MenuComponent,
    MenuFormComponent,
    AddOnsComponent,
    AddOnsFormComponent,
    FoodMenuContainerComponent,
    LayoutComponent,
    RectangleComponent,
    ShapeComponent,
    DynamicSvgDirective,
    LayoutViewComponent,
    LayoutListComponent,
    TableReservationListComponent,
    ReviewsComponent,
    ProfileContainerDynamicComponent,
    MenuContainerDynamicComponent,
    LayoutContainerDynamicComponent,
    BusinessPromotionComponent,
    BusinessPromotionFormComponent,
    BusinessPromotionMenuComponent
  ],
  entryComponents: [ShapeComponent, RectangleComponent],
  imports: [
    CommonModule,
    BusinessRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    PaginatorModule,
    DialogModule,
    PaginatorModule,
    TableModule,
    DropdownModule,
    CalendarModule,
    SharedModule
  ]
})
export class BusinessModule {}

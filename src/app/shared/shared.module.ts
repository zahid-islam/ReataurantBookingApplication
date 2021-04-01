import { LayoutValidatorDirective } from './directives/layout-validator.directive';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentLoaderComponent } from './content-loader/content-loader.component';
import { EqualValidatorDirective } from './directives/equal-validator.directive';
import { SpinLoaderComponent } from './spin-loader/spin-loader.component';
import { HideIfUnauthorizedDirective } from './directives/hide-if-unauthorized.directive';
import { DisableIfUnauthorizedDirective } from './directives/disable-if-unauthorized.directive';
import { DateFormatePipe } from './pipe/date-formate.pipe';
import { SafePipe } from './pipe/safe.pipe';
import { ContextmenuComponent } from './common-componenet/contextmenu/contextmenu.component';
import { BusinessReviewStarRatingComponent } from './common-componenet/business-review-star-rating/business-review-star-rating.component';
import { SliderModule } from 'primeng/slider';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AddOrRemoveClassToFixedTableHeaderDirective } from './directives/add-or-remove-class-to-fixed-table-header.directive';
import { AutoCompleteModule } from 'primeng/autocomplete';

@NgModule({
  declarations: [
    ContentLoaderComponent,
    EqualValidatorDirective,
    LayoutValidatorDirective,
    SpinLoaderComponent,
    HideIfUnauthorizedDirective,
    DisableIfUnauthorizedDirective,
    DateFormatePipe,
    SafePipe,
    ContextmenuComponent,
    BusinessReviewStarRatingComponent,
    AddOrRemoveClassToFixedTableHeaderDirective
  ],
  imports: [
    CommonModule,
    SliderModule,
    InfiniteScrollModule,
    AutoCompleteModule
  ],
  exports: [
    ContentLoaderComponent,
    EqualValidatorDirective,
    LayoutValidatorDirective,
    SpinLoaderComponent,
    HideIfUnauthorizedDirective,
    DisableIfUnauthorizedDirective,
    DateFormatePipe,
    SafePipe,
    ContextmenuComponent,
    BusinessReviewStarRatingComponent,
    SliderModule,
    InfiniteScrollModule,
    AddOrRemoveClassToFixedTableHeaderDirective,
    AutoCompleteModule
  ]
})
export class SharedModule { }

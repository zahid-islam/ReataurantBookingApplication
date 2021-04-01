import { Component, OnInit, OnDestroy } from '@angular/core';
import { RatingsReview } from '../../models/business.model';
import { Subscription } from 'rxjs';
import { CreateBusinessService } from '../../services/create-business.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { PlatformLocation } from '@angular/common';
import { SharedDataService } from '../../../shared/services/shared-data.service';
@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styles: []
})
export class ReviewsComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  isLoading: boolean;
  allRatingsReview: RatingsReview[];
  businessId: number;
  isRetingExistingShow: boolean;
  isRetingExistingHide: boolean;

  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

  constructor(
    private businessService: CreateBusinessService,
    private toastr: ToastrManager,
    private platformLocation: PlatformLocation,
    private sharedDataService: SharedDataService,
  ) {
    this.isLoading = false;
    this.isRetingExistingShow = false;
    this.isRetingExistingHide = false;
  }

  ngOnInit() {
    let pathIdList: number[] = [];
    const fullPath = this.platformLocation.href;
    pathIdList = this.sharedDataService.getFillPathIDList(fullPath);
    if (pathIdList.length == 1) {
      this.businessId = pathIdList[0];
      this.getRatingsOfABusiness(this.businessId, this.offset.toString(), this.limit.toString());
    }
  }

  private getRatingsOfABusiness(businessId: number, offset: string, limit: string, loading?: boolean) {
    this.isLoading = loading == false ? loading : true;
    this.subscription = this.businessService.getRatingsOfABusiness(businessId, offset, limit).subscribe(
      (res: any) => {
        this.allRatingsReview = res.body.data.ratings;
        this.totalCount = res.body.data.count;
        if (this.totalCount == 0) {
          this.isRetingExistingHide = true;
          this.isRetingExistingShow = false;
        } else {
          this.isRetingExistingHide = false;
          this.isRetingExistingShow = true;
        }
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      }
    );

  }


  public paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.getRatingsOfABusiness(this.businessId, this.offset.toString(), this.limit.toString(), false);
  }



  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscription.unsubscribe();
  }
}

import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from "@angular/core";

import { Paginator } from "primeng/paginator";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription, forkJoin } from "rxjs";
import { ToastrManager } from "ng6-toastr-notifications";

import { CreateBusinessService } from "./../../services/create-business.service";
import { CommonType } from "src/app/shared/models/common.model";
import { PlatformLocation } from "@angular/common";
import { SharedDataService } from "src/app/shared/services/shared-data.service";
import { RestaurantOffer, UpdateRestaurantOffer } from '../../models/business.model';
declare var jQuery: any;

@Component({
  selector: "app-business-promotion",
  templateUrl: "./business-promotion.component.html",
  styles: []
})
export class BusinessPromotionComponent implements OnInit {
  @ViewChild("paginator", { static: false }) dataTable: ElementRef<Paginator>;
  @ViewChild("ReadParticularPromotion", { static: false }) ReadParticularPromotion: ElementRef;
  private subscription: Subscription;
  allRestauranOffers: any;
  viewParticularPromotion: RestaurantOffer = new RestaurantOffer();
  restaurantOfferTypes: CommonType = new CommonType();
  restaurantOfferStatuses: CommonType = new CommonType();
  restaurantOfferStatuse: string;
  restaurantOfferType: string;
  businesId: number;
  isLoading: boolean;
  // paginator variable
  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

  constructor(
    private businessService: CreateBusinessService,
    private toastr: ToastrManager,
    private platformLocation: PlatformLocation,
    private sharedDataService: SharedDataService
  ) { }

  ngOnInit() {
    let pathIdList: number[] = [];
    const fullPath = this.platformLocation.href;
    pathIdList = this.sharedDataService.getFillPathIDList(fullPath);
    if (pathIdList.length == 1) {
      this.businesId = pathIdList[0];
    }
    this.getAllRestaurantOffers(this.offset.toString(), this.limit.toString());
  }

  getAllRestaurantOffers(
    offset: string,
    limit: string,
    status?: string,
    type?: string
  ) {
    this.isLoading = this.isLoading == false ? this.isLoading : true;
    this.subscription = forkJoin([
      this.businessService.getAllRestaurantOffers(offset, limit, status, type),
      this.businessService.getAllRestaurantOfferStatus(),
      this.businessService.getAllRestaurantOfferTypes()
    ]).subscribe(
      (res: any) => {
        this.allRestauranOffers = res[0].body.data.restaurantOffers;
        this.totalCount = res[0].body.data.count;
        this.restaurantOfferStatuses = res[1].body.data.restaurantOfferStatuses;
        this.restaurantOfferTypes = res[2].body.data.restaurantOfferStatuses;
        let paginatorRef: any = this.dataTable;
        paginatorRef.first = this.offset;
        paginatorRef.rows = this.limit;
      },
      err => {
        this.isLoading = false;
        this.toastr.errorToastr(err.error.message.en);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  updateRestaurantOffer(promotion: any) {
    let restaurantOffer = new UpdateRestaurantOffer();
    restaurantOffer.markAsInactive = promotion.restaurantOfferStatus.name === "ACTIVE" ? true : false;
    this.businessService.updateRestaurantOffer(restaurantOffer, promotion.id).subscribe(
      (res: any) => {
        this.toastr.successToastr(res.body.message.en);
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  public paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.getAllRestaurantOffers(
      this.offset.toString(),
      this.limit.toString(),
      this.restaurantOfferStatuse,
      this.restaurantOfferType
    );
  }

  /**
   * Get particular promotion
   * @PromotionsId
   */
  public getParticularPromotion(promotionsID: number) {
    this.businessService.getParticularRestaurantOffer(promotionsID).subscribe(
      (res: any) => {
        this.viewParticularPromotion = res.body.data.restaurantOffer;
        jQuery(this.ReadParticularPromotion.nativeElement).modal("show");
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }
}

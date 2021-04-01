import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from "@angular/core";
import { Paginator } from "primeng/paginator";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { ToastrManager } from "ng6-toastr-notifications";

import { SortingObj } from "../../../../shared/models/common.model";
import { MarketingService } from "../../../../shared/services/marketing.service";
import { CommonType } from "../../../../shared/models/common.model";
import {
  Promotions,
  UpdatePromotion
} from "../../../../shared/models/marketing.model";
import { AppConstants } from "../../../../shared/constants/app-constants";

declare var jQuery: any;

@Component({
  selector: "app-promotion",
  templateUrl: "./promotion.component.html",
  styles: []
})
export class PromotionComponent implements OnInit, OnDestroy {
  @ViewChild("paginator", { static: false }) dataTable: ElementRef<Paginator>;
  @ViewChild("ReadParticularPromotion", { static: false })
  ReadParticularPromotion: ElementRef;
  private subscription: Subscription;
  promotionStatuses: CommonType[] = [];
  allPromotions: Promotions[] = [];
  viewParticularPromotion: Promotions = new Promotions();
  updatePromotion: UpdatePromotion = new UpdatePromotion();
  promotionStatus: string;

  // for filter table data based on status
  statusForFilter: any = 0;
  isLoading: boolean;

  // paginator variable
  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

  // Sort
  promotionSorting: SortingObj = new SortingObj();
  sortingColumnArr: any = [];
  sortedString: string = "";

  constructor(
    private marketingService: MarketingService,
    private toastr: ToastrManager,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.isLoading = false;
  }

  ngOnInit() {
    this.sortedString = "createdAt:desc";
    this.promotionSorting.createdAt = false;
    this.sortingColumnArr = ["createdAt"];
    this.getPromotionStatuses();
    this.subscription = this.route.queryParams.subscribe(params => {
      this.offset = +params["offset"] || 0;
      this.limit = +params["limit"] || 10;
    });
    this.getAllPromotionsPaginatedly(
      this.offset.toString(),
      this.limit.toString(),
      this.promotionStatus,
      true,
      this.sortedString
    );
  }

  private getAllPromotionsPaginatedly(
    offset: string,
    limit: string,
    status?: string,
    loading?: boolean,
    sortedString?: string
  ) {
    this.isLoading = loading == false ? loading : true;
    this.subscription = this.marketingService
      .getAllPromotionsPaginatedly(offset, limit, status, sortedString)
      .subscribe(
        (res: any) => {
          this.allPromotions = res.body.data.promotions;
          this.totalCount = res.body.data.count;
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

  private getPromotionStatuses() {
    this.subscription = this.marketingService.getPromotionStatuses().subscribe(
      (res: any) => {
        this.promotionStatuses = res.body.data.promotionStatuses;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  public filterPromotionOnStatusChange(statusId: number) {
    this.statusForFilter = statusId;
    this.promotionStatus = "";
    if (statusId != 0) {
      this.promotionStatus = this.promotionStatuses.find(item => {
        return item.id == statusId;
      }).name;
    }

    this.getAllPromotionsPaginatedly(
      this.offset.toString(),
      this.limit.toString(),
      this.promotionStatus,
      false
    );
  }

  public paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.router.navigate(["/admin/marketing/promotion"], {
      queryParams: { offset: this.offset, limit: this.limit }
    });
    this.promotionStatus = "";
    if (this.statusForFilter != 0) {
      this.promotionStatus = this.promotionStatuses.find(item => {
        return item.id == this.statusForFilter;
      }).name;
    }
    this.getAllPromotionsPaginatedly(
      this.offset.toString(),
      this.limit.toString(),
      this.promotionStatus,
      false
    );
  }

  public statusChangesAction(statusId, promotion: Promotions) {
    let promotionStatus = this.promotionStatuses.find(item => {
      return item.id == parseInt(statusId);
    }).name;

    if (promotionStatus) {
      this.updatePromotion.status = promotionStatus;
      this.marketingService
        .updateParticularPromotion(promotion.id, this.updatePromotion)
        .subscribe(
          (res: any) => {
            console.log(res);
            this.toastr.successToastr(res.body.message.en);
          },
          err => {
            this.toastr.errorToastr(err.error.message.en);
          }
        );
    }
  }

  public sortColumnWise(keyString: string) {
    this.sortedString = AppConstants.createSortedString(
      keyString,
      this.sortingColumnArr,
      this.promotionSorting
    );

    this.getAllPromotionsPaginatedly(
      this.offset.toString(),
      this.limit.toString(),
      this.promotionStatus,
      false,
      this.sortedString
    );
  }

  /**
   * Get particular promotion
   * @PromotionsId
   */
  public getParticularPromotion(promotionsID: number) {
    this.marketingService.getParticularPromotion(promotionsID).subscribe(
      (res: any) => {
        this.viewParticularPromotion = res.body.data.promotion;
        jQuery(this.ReadParticularPromotion.nativeElement).modal("show");
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  public addNewUserToPersonalPromotion(promotionsID: number) {
    this.router.navigate([
      `/admin/marketing/promotion/${promotionsID}/newuser`
    ]);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

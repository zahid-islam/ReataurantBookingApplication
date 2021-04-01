import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastrManager } from "ng6-toastr-notifications";

import { MarketingService } from "../../../../shared/services/marketing.service";
import {
  CreatePromotion,
  UpdatePromotion
} from "../../../../shared/models/marketing.model";

@Component({
  selector: "app-create-public-promotion",
  templateUrl: "./create-public-promotion.component.html",
  styles: []
})
export class CreatePublicPromotionComponent implements OnInit {
  activeFromMinDate: Date = new Date();
  expiredAtMinDate: Date = new Date();
  promotion: CreatePromotion = new CreatePromotion();
  updatePromotion: UpdatePromotion = new UpdatePromotion();
  promotionID: number;

  isPercentageContain: boolean;
  isStartFromNow: boolean;
  togglePersonalPublicPromotion: boolean;
  isUpdateMode: boolean;
  isApiSubmit: boolean;

  constructor(
    private marketingService: MarketingService,
    private toastr: ToastrManager,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.isApiSubmit = false;
    this.isUpdateMode = false;
    this.isPercentageContain = false;
    this.togglePersonalPublicPromotion = false;
    this.promotion.isPercentage = "false";
    this.promotion.autoActive = "false";
    this.promotion.shouldStartFromNow = "false";

    this.route.params.subscribe(params => {
      this.promotionID = +params["promotionID"];
      if (this.promotionID) {
        this.isUpdateMode = true;
        this.getParticularPromotion(this.promotionID);
      }
    });
  }


  public submitPublicPromotion(publicPromotion: NgForm) {
    this.isApiSubmit = true;
    // check value is valid
    if (this.promotionID) {
      // Update mode
      this.updatePromotion.promoCode = publicPromotion.value.promoCode;
      this.updatePromotion.title = publicPromotion.value.title;
      this.updatePromotion.description = publicPromotion.value.description;
      this.marketingService
        .updateParticularPromotion(this.promotionID, this.updatePromotion)
        .subscribe(
          (res: any) => {
            this.toastr.successToastr(res.body.message.en);
            this.router.navigate([`/admin/marketing/promotion`]);
          },
          err => {
            this.isApiSubmit = false;
            this.toastr.errorToastr(err.error.message.en);
          },
          () => {
            this.isApiSubmit = false;
          }
        );
    } else {
      // Create Mode
      if (publicPromotion.valid) {
        if (publicPromotion.value.activeFrom) {
          this.promotion.activeFrom = new Date(publicPromotion.value.activeFrom).getTime() + 300000;
        }

        this.promotion.expiredAt = new Date(publicPromotion.value.expiredAt).getTime();
        this.promotion.isPercentage = publicPromotion.value.isPercentage === "true" ? "true" : "false";
        this.promotion.autoActive = publicPromotion.value.autoActive === "true" ? "true" : "false";
        this.promotion.shouldStartFromNow = publicPromotion.value.shouldStartFromNow === "true" ? "true" : "false";
        // check expiredAt is getter then activeFrom

        if (this.promotion.shouldStartFromNow === "true") {
          this.promotion.activeFrom = null;
        }

        if (this.togglePersonalPublicPromotion) {
          this.marketingService.createPublicPromotion(this.promotion).subscribe(
            (res: any) => {
              this.toastr.successToastr(res.body.message.en);
              this.router.navigate(["/admin/marketing/promotion"]);
            },
            err => {
              this.isApiSubmit = false;
              this.toastr.errorToastr(err.error.message.en);
            },
            () => {
              this.isApiSubmit = false;
            }
          );
        } else {
          this.marketingService
            .createPersonalPromotion(this.promotion)
            .subscribe(
              (res: any) => {
                this.toastr.successToastr(res.body.message.en);
                this.router.navigate(["/admin/marketing/promotion"]);
              },
              err => {
                this.isApiSubmit = false;
                this.toastr.errorToastr(err.error.message.en);
              },
              () => {
                this.isApiSubmit = false;
              }
            );
        }
      } else {
        this.toastr.errorToastr("please full field input value!");
      }
    }
  }

  public onRadioChange(isChange: boolean) {
    this.isPercentageContain = isChange;

    if (isChange) {
      this.promotion.flatAmount = null;
      this.promotion.flatAmountMinThresholdAmount = null;
    }
    else {
      this.promotion.percentage = null;
      this.promotion.percentageAmountCap = null;
    }
  }

  checkActiveFrom(activeDate: any) {
    this.expiredAtMinDate = new Date(activeDate);
  }

  public shouldStartFromNowRadioChange(isChange: boolean) {
    this.isStartFromNow = isChange;
    if (isChange) {
      this.promotion.activeFrom = null;
    }
  }

  /**
   * Get particular promotion
   * @PromotionsId
   */
  public getParticularPromotion(promotionsID: number) {
    this.marketingService.getParticularPromotion(promotionsID).subscribe(
      (res: any) => {
        let particularPromotion = res.body.data.promotion;
        this.promotion.promoCode = particularPromotion.promoCode;
        this.promotion.activeFrom =
          particularPromotion.activeFrom == null
            ? null
            : new Date(particularPromotion.activeFrom);
        this.promotion.expiredAt =
          particularPromotion.expiredAt == null
            ? null
            : new Date(particularPromotion.expiredAt);
        this.promotion.title = particularPromotion.title;
        this.promotion.description = particularPromotion.description;
        this.promotion.autoActive =
          particularPromotion.autoActive == true
            ? "true"
            : "false";
        this.promotion.shouldStartFromNow =
          particularPromotion.shouldStartFromNow == true
            ? "true"
            : "false";
        this.promotion.isPercentage =
          particularPromotion.isPercentage == true
            ? "true"
            : "false";
        this.promotion.percentage = particularPromotion.percentage;
        this.promotion.percentageAmountCap =
          particularPromotion.percentageAmountCap;
        this.promotion.flatAmount = particularPromotion.flatAmount;
        this.promotion.flatAmountMinThresholdAmount =
          particularPromotion.flatAmountMinThresholdAmount;
        this.promotion.numberOfUsagePerUser =
          particularPromotion.numberOfUsagePerUser;
        if (particularPromotion.isPublic) {
          this.togglePersonalPublicPromotion = true;
        } else {
          this.togglePersonalPublicPromotion = false;
        }
        if (particularPromotion.isPercentage) {
          this.isPercentageContain = true;
        } else {
          this.isPercentageContain = false;
        }
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }
}

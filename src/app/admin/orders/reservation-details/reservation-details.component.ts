import { AppConstants } from "./../../../shared/constants/app-constants";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ToastrManager } from "ng6-toastr-notifications";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

import { OrdersService } from "../../../shared/services/orders.service";
import { Orders, FoodItem } from "src/app/shared/models/orders.model";
import { SharedDataService } from "src/app/shared/services/shared-data.service";

declare var jsPDF: any;

@Component({
  selector: "app-reservation-details",
  templateUrl: "./reservation-details.component.html",
  styles: []
})
export class ReservationDetailsComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  reservationId: string;
  reservationDetails: Orders = new Orders();
  isLoading: boolean;
  currentOrderStatus: string;
  foodItemList: FoodItem[] = [];
  netTotal: number;
  totalAmount: number;
  businessPhones: any[] = [];
  customerPhones: any[] = [];

  foodVerticalDistance: number = 252;

  constructor(
    private orderService: OrdersService,
    private toastr: ToastrManager,
    private route: ActivatedRoute,
    private sharedService: SharedDataService
  ) {}

  ngOnInit() {
    this.isLoading = false;
    this.netTotal = 0;
    this.totalAmount = 0;

    this.subscription = this.route.params.subscribe(params => {
      this.reservationId = params["refId"];
      if (this.reservationId) {
        this.geReservationIdById(this.reservationId);
      }
    });
  }

  geReservationIdById(id: string) {
    this.isLoading = true;
    this.subscription = this.orderService.getOrderById(id).subscribe(
      (res: any) => {
        this.reservationDetails = res.body.data.order;
        let order = this.reservationDetails;
        this.currentOrderStatus = this.reservationDetails.orderStatus.name;

        let fItems = order.foodOrders;
        if (fItems.length > 0) {
          fItems.forEach(item => {
            let foodItem = {} as FoodItem;
            foodItem.itemName = [];
            foodItem.price = [];
            let itemUnit = item.unitCount | 0;

            foodItem.primaryPhoto = item.foodMenu.primaryPhoto;
            foodItem.unitCount = item.unitCount;

            foodItem.itemName.push(item.menuName);
            foodItem.price.push(Number(item.excludingVatUnitPrice));

            item.foodOrderAddons.forEach(addon => {
              let addonAddedName =
                " (৳ " +
                Math.round(addon.excludingVatUnitPrice) +
                " x " +
                addon.unitCount +
                ")";
              foodItem.itemName.push(addon.optionName + addonAddedName);
              foodItem.price.push(
                Number(addon.excludingVatUnitPrice) * addon.unitCount
              );
            });

            let totalUnitPrice = 0;
            if (foodItem.price.length > 0) {
              foodItem.price.forEach(val => {
                totalUnitPrice = totalUnitPrice + val;
              });
            }
            foodItem.unitPrice = totalUnitPrice;
            foodItem.totalPrice = itemUnit * totalUnitPrice;
            this.foodItemList.push(foodItem);
          });

          if (this.foodItemList.length > 0) {
            this.foodItemList.forEach(eachItem => {
              this.netTotal = this.netTotal + eachItem.totalPrice;
            });
          }
        }

        let disAmount = order.orderPromotion
          ? Number(order.orderPromotion.discountAmount)
          : 0;
        let vatAmount = Number(order.vatAmount);
        let serviceChargeAmount = Number(order.serviceChargeAmount);
        let total = Number(this.netTotal);
        this.totalAmount = total + vatAmount + serviceChargeAmount - disAmount;
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

  totalAmountWithAddons(foodOrders) {
    let result: any = 0;
    if (foodOrders) {
      let addonsTotal = 0;
      if (foodOrders.foodOrderAddons.length > 0) {
        foodOrders.foodOrderAddons.forEach(addons => {
          addonsTotal += Number(addons.excludingVatTotalPrice);
        });
      }
      result =
        parseFloat(foodOrders.excludingVatUnitPrice) + Number(addonsTotal);
    }
    return Number(result).toFixed(2);
  }
  checkValueIsNumberAndPositive(value: any) {
    return AppConstants.checkValueIsNumberAndPositive(value);
  }

  servedAt(scheduled, serve) {
    if (serve) {
      const scheduledAt = new Date(scheduled);
      const serveTime = serve;
      return new Date(scheduledAt.getTime() + serveTime);
    }
  }

  generateReservationInvoicePDF() {
    let imgData =
      "data:image/jpeg;base64,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";
    const doc = new jsPDF({
      orientation: "p",
      unit: "px",
      format: [332, 1000],
      putOnlyUsedFonts: true,
      floatPrecision: 12, // or "smart", default is 16
      compress: true
    });
    doc.addImage(imgData, "JPEG", 0, 0, 250, 50, "", "SLOW");

    // Reservation ID
    doc
      .setFontType("bold")
      .setFontSize(12)
      .setTextColor("#C96B5D")
      .text(`Reservation ID: `, 10, 68);
    doc
      .setFontType("normal")
      .setFontSize(12)
      .setTextColor("#A1A1A1")
      .text(`${this.reservationDetails.refId}`, 78, 68);
    // Placed AT
    doc
      .setFontType("normal")
      .setFontSize(12)
      .setTextColor("#5D5D5D")
      .text(`Placed At:`, 10, 80);

    doc
      .setFontType("bold")
      .setFontSize(12)
      .setTextColor("#5D5D5D")
      .text(
        `${new Date(this.reservationDetails.createdAt).toLocaleString()}`,
        78,
        80
      );

    // B2C Info

    doc
      .setFontType("bold")
      .setFontSize(14)
      .setTextColor("#A1A1A1")
      .text(
        `${this.reservationDetails.customer.firstName} ${this.reservationDetails.customer.lastName}`,
        10,
        100
      );
    doc
      .setFontType("normal")
      .setFontSize(12)
      .setTextColor("#5D5D5D")
      .text(`${this.reservationDetails.customer.email}`, 10, 112);
    if (
      this.reservationDetails.creatorMobile) {
      doc

        .setFontType("normal")
        .setFontSize(13)
        .setTextColor("#C96B5D")
        .text(`${this.reservationDetails.creatorMobile}`, 10, 125);
    }

    // B2B Info

    doc
      .setFontType("bold")
      .setFontSize(14)
      .setTextColor("#A1A1A1")
      .text(`${this.reservationDetails.business.name}`, 10, 145);
    doc
      .setFontType("normal")
      .setFontSize(12)
      .setTextColor("#5D5D5D")
      .text(`${this.reservationDetails.business.address}`, 10, 157);

    if (
      this.reservationDetails.business.phones &&
      this.reservationDetails.business.phones.length > 0
    ) {
      doc
        .setFontType("normal")
        .setFontSize(13)
        .setTextColor("#C96B5D")
        .text(`${this.reservationDetails.business.phones[0].phone}`, 10, 170);
    }

    // Person Count
    doc
      .setFontType("normal")
      .setFontSize(12)
      .setTextColor("#5D5D5D")
      .text(`Person Count:`, 10, 190);

    doc
      .setFontType("bold")
      .setFontSize(12)
      .setTextColor("#5D5D5D")
      .text(`${this.reservationDetails.personCount}`, 78, 190);

    // Booking Time
    doc
      .setFontType("normal")
      .setFontSize(12)
      .setTextColor("#5D5D5D")
      .text(`Booking Time: `, 10, 202);

    doc
      .setFontType("bold")
      .setFontSize(12)
      .setTextColor("#5D5D5D")
      .text(
        `${new Date(this.reservationDetails.scheduledAt).toLocaleString()}`,
        78,
        202
      );

    // Serve Time
    if (this.reservationDetails.serveTimeAfterScheduledAt) {
      doc
        .setFontType("normal")
        .setFontSize(12)
        .setTextColor("#5D5D5D")
        .text(`Serve Time: `, 10, 214);
      doc
        .setFontType("bold")
        .setFontSize(12)
        .setTextColor("#5D5D5D")
        .text(
          `${this.servedAt(
            this.reservationDetails.scheduledAt,
            this.reservationDetails.serveTimeAfterScheduledAt
          ).toLocaleString()}`,
          78,
          214
        );
    }

    /**
     * Invoice
     */

    doc
      .setFontType("bold")
      .setFontSize(14)
      .setTextColor("#A1A1A1")
      .text(`Invoice`, 10, 234);
    // line
    doc
      .setLineWidth(0.5)
      .setDrawColor("#A3A3A3")
      .line(0, 240, 250, 240, "DF");
    // Front text option
    const foodTextOptions = {
      align: "right",
      baseline: "alphabetic",
      lineHeightFactor: "1.5"
    };

    if (
      this.reservationDetails.foodOrders &&
      this.reservationDetails.foodOrders.length > 0
    ) {
      this.reservationDetails.foodOrders.forEach((food, index) => {
        // Food Name and Price

        doc
          .setFontType("bold")
          .setFontSize(11)
          .setTextColor("#5E5E5E")
          .text(
            `${index + 1}. ${this.sharedService.ucFirstAllWords(
              food.foodMenu.itemName
            )} `,
            10,
            this.foodVerticalDistance
          );
        doc
          .setFontType("normal")
          .setFontSize(11)
          .setTextColor("#5D5D5D")
          .text(
            `${food.excludingVatTotalPrice} `,
            210,
            this.foodVerticalDistance,
            foodTextOptions
          );
        // Addons
        if (food.foodOrderAddons && food.foodOrderAddons.length > 0) {
          food.foodOrderAddons.forEach((addons, index) => {
            index === 0 ? (this.foodVerticalDistance += 12) : "";

            doc
              .setFontType("normal")
              .setFontSize(10)
              .setTextColor("#959595")
              .text(
                `${addons.optionName} (${addons.excludingVatUnitPrice} *  ${addons.unitCount})`,
                20,
                this.foodVerticalDistance
              );
            doc
              .setFontType("normal")
              .setFontSize(10)
              .setTextColor("#959595")
              .text(
                `${addons.excludingVatTotalPrice} `,
                210,
                this.foodVerticalDistance,
                foodTextOptions
              );

            this.foodVerticalDistance += 12;
          });
        } else {
          this.foodVerticalDistance += 12;
        }

        // Item Quantity
        doc
          .setFontType("normal")
          .setFontSize(11)
          .setTextColor("#5E5E5E")
          .text(
            `Item Quantity: (${this.totalAmountWithAddons(food)} * ${
              food.unitCount
            }) `,
            20,
            this.foodVerticalDistance
          );
        doc
          .setFontType("normal")
          .setFontSize(11)
          .setTextColor("#C96B5D")
          .text(
            `${(
              parseFloat(this.totalAmountWithAddons(food)) * food.unitCount
            ).toFixed(2)}`,
            210,
            this.foodVerticalDistance,
            foodTextOptions
          );

        this.foodVerticalDistance += 16;
      });
    }

    // line
    doc
      .setLineWidth(0.5)
      .setDrawColor("#A3A3A3")
      .line(
        10,
        this.foodVerticalDistance,
        238,
        this.foodVerticalDistance,
        "DF"
      );

    this.foodVerticalDistance += 12;
    // Menu Price
    doc
      .setFontType("bold")
      .setFontSize(11)
      .setTextColor("#5E5E5E")
      .text(`Menu Price`, 10, this.foodVerticalDistance);

    doc
      .setFontType("bold")
      .setFontSize(11)
      .setTextColor("#5E5E5E")
      .text(
        `${this.netTotal.toFixed(2)} `,
        210,
        this.foodVerticalDistance,
        foodTextOptions
      );

    if (
      this.checkValueIsNumberAndPositive(
        this.reservationDetails.orderPromotion &&
          this.reservationDetails.orderPromotion.discountAmount
      )
    ) {
      this.foodVerticalDistance += 12;
      doc
        .setFontType("normal")
        .setFontSize(10)
        .setTextColor("#9E9330")
        .text(
          `Discount Amount (${this.reservationDetails.orderPromotion.promotion.promoCode})`,
          10,
          this.foodVerticalDistance
        );

      doc
        .setFontType("normal")
        .setFontSize(10)
        .setTextColor("#9E9330")
        .text(
          `- ${this.reservationDetails.orderPromotion.discountAmount} `,
          210,
          this.foodVerticalDistance,
          foodTextOptions
        );
    }
    if (this.checkValueIsNumberAndPositive(this.reservationDetails.vatAmount)) {
      this.foodVerticalDistance += 12;
      doc
        .setFontType("normal")
        .setFontSize(10)
        .setTextColor("#959595")
        .text(
          `VAT (${this.reservationDetails.business.vatPercentage} %)`,
          10,
          this.foodVerticalDistance
        );

      doc
        .setFontType("normal")
        .setFontSize(10)
        .setTextColor("#959595")
        .text(
          `+ ${this.reservationDetails.vatAmount} `,
          210,
          this.foodVerticalDistance,
          foodTextOptions
        );
    }
    if (
      this.checkValueIsNumberAndPositive(
        this.reservationDetails.serviceChargeAmount
      )
    ) {
      this.foodVerticalDistance += 12;
      doc
        .setFontType("normal")
        .setFontSize(10)
        .setTextColor("#959595")
        .text(
          `Service Charge (${this.reservationDetails.business.serviceChargePercentage} %)`,
          10,
          this.foodVerticalDistance
        );

      doc
        .setFontType("normal")
        .setFontSize(10)
        .setTextColor("#959595")
        .text(
          `+ ${this.reservationDetails.serviceChargeAmount} `,
          210,
          this.foodVerticalDistance,
          foodTextOptions
        );
    }

    this.foodVerticalDistance += 12;

    // line
    doc
      .setLineWidth(0.5)
      .setDrawColor("#A3A3A3")
      .line(0, this.foodVerticalDistance, 250, this.foodVerticalDistance, "DF");

    this.foodVerticalDistance += 20;
    // Total
    doc
      .setFontType("bold")
      .setFontSize(14)
      .setTextColor("#5D5D5D")
      .text(`Total`, 10, this.foodVerticalDistance);

    doc
      .setFontType("bold")
      .setFontSize(14)
      .setTextColor("#5D5D5D")
      .text(
        `${this.totalAmount.toFixed(2)} `,
        210,
        this.foodVerticalDistance,
        foodTextOptions
      );

    // Print PDF file
    doc.save("reservation-invoice-" + this.reservationId + ".pdf");
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

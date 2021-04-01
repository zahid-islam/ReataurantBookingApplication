import { Component, EventEmitter, OnInit, Input, Output } from "@angular/core";

@Component({
  selector: 'app-business-review-star-rating',
  templateUrl: './business-review-star-rating.component.html',
  styleUrls: ["./business-review-star-rating.component.scss"]
})
export class BusinessReviewStarRatingComponent implements OnInit {

  /**
   * If you need to take input from star icon user
   *  <element
   * [maxScore]="5"
   * [score]="item.rating"
   * [forDisplay]="false"
   * (rateChanged)="onRateChange($event)"></element>
   *
   * If you need to show
   * <element
   * [maxScore]="5"
   * [score]="item.rating"
   * [forDisplay]="true"></element>
   */

  @Input() score;
  @Input() maxScore = 5;
  @Input() forDisplay = false;
  @Output() rateChanged = new EventEmitter();

  range = [];
  marked = -1;

  constructor() { }

  ngOnInit() {
    for (let i = 0; i < this.maxScore; i++) {
      this.range.push(i);
    }
  }

  public mark = index => {
    this.marked = this.marked == index ? index - 1 : index;
    this.score = this.marked + 1;
    this.rateChanged.next(this.score);
  }

  public isMarked = index => {
    if (!this.forDisplay) {
      if (index <= this.marked) {
        return "fa-star";
      } else {
        return "fa-star-half";
      }
    } else {
      if (this.score >= index + 1) {
        return "fa-star";
      } else if (this.score > index && this.score < index + 1) {
        return "fa-star-half-o";
      } else {
        return "fa-star-o";
      }
    }
  }

}

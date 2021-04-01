import { Component, OnInit, OnDestroy } from "@angular/core";
import { OrdersService } from "../../../shared/services/orders.service";
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  urlName: SafeResourceUrl = '';
  emptyUrl: any = '';
  windowsHeight: any;
  notAvailable: boolean = false;
  isLoading: boolean;
  constructor(
    private orderService: OrdersService,
    private sanitizer: DomSanitizer,
    ) {
  }

  ngOnInit() {
    this.isLoading = false;
    this.getAnalytics();
    this.windowsHeight = window.outerHeight;
  }

  getAnalytics() {
    this.isLoading = true;
    this.orderService.getAnalytics().subscribe(
      (res: any) => {
        const urlString = res.body.data.url;
        this.urlName = urlString ? urlString : '';
        this.notAvailable = urlString ? false : true;
      },
      err => {
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      }
    );
  }

}

import { Component, OnInit } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: "app-admin-dashboard",
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.scss"]
})
export class AdminDashboardComponent implements OnInit {

  urlName: SafeResourceUrl = '';
  emptyUrl: any = '';
  windowsHeight: any;
  notAvailable: boolean = false;
  isLoading: boolean;
  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    //this.urlName = this.sanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/c9F5kMUfFKk");
    // this.getDashboard();
    this.isLoading = false;
    this.windowsHeight = window.outerHeight;
  }

  // getDashboard() {
  //   this.orderService.getAnalytics().subscribe(
  //     (res: any) => {
  //       let urlString = res.body.data.url;
  //       this.urlName = urlString ? urlString : '';
  //       this.notAvailable = urlString ? false : true;
  //     },
  //     err => {
  //     }
  //   );
  // }

}

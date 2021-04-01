/**
 * Framework dependency
 */
import { Component, AfterViewInit, ElementRef } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { map, filter, mergeMap } from "rxjs/operators";

declare var $: any;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements AfterViewInit {
  private breadcrumbValue: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    protected elementRef: ElementRef
  ) { }

  ngOnInit() {
    // dinamicaly handle browser tab name

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          this.breadcrumbValue = route.data;
          if (this.breadcrumbValue) {
            if (this.breadcrumbValue._value["breadcrumb"]) {
              if (this.breadcrumbValue._value["breadcrumb"] === "Sign In") {
                this.breadcrumbHide();
              } else {
                this.breadcrumbShow();
              }
            }
          }
          return route;
        }),
        filter(route => route.outlet === "primary"),
        mergeMap(route => route.data)
      )
      .subscribe(event => {
        this.titleService.setTitle(event["title"]);
      });
  }

  ngAfterViewInit(): void {
    // let adminStarInserted = $('app-admin').hasClass("ng-star-inserted");
    // let userStarInserted = $('app-user').hasClass("ng-star-inserted");
    // if (adminStarInserted) {
    //   console.log(`adminStarInserted ${adminStarInserted}`);
    // } else if (userStarInserted) {
    //   console.log(`userStarInserted ${userStarInserted}`);
    // }
    this.globalSpinner();
  }



  private globalSpinner() {
    $("#global-spinner").hide();

  }
  private breadcrumbHide() {
    $(".pf-breadcrumb").hide();
  }
  private breadcrumbShow() {
    $("app-breadcrumb.pf-breadcrumb")
      .show()
      .prependTo(
        $("app-admin")
          .find(".page-wrapper")
          .children(".pf-admin-dynamic-containe")
      );
  }
}

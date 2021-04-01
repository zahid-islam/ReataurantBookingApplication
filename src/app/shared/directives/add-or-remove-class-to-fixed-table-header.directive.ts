import { Directive, HostListener, Inject, Input, OnInit } from "@angular/core";
import { DOCUMENT } from "@angular/common";

@Directive({
  selector: "[addOrRemoveClassToFixedTableHeader]"
})
export class AddOrRemoveClassToFixedTableHeaderDirective implements OnInit {
  @Input("addOrRemoveClassToFixedTableHeader") scrollYLimit: string;

  docElem = this.document.documentElement;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  @HostListener("window:scroll", ["$event"]) onScrollEvent() {
    let sy = this.scrollY();
    if ( sy >= parseInt(this.scrollYLimit, 10)) {
      let table = this.document.querySelector(".table");
      let pagination = this.document.querySelector(".pf-pagination-container");
      if (table) {
        table.classList.add("table-header-fixed");
      }
      if (pagination) {
        pagination.classList.add("pagination-fixed");
      }
    } else {
      let table = this.document.querySelector(".table");
      let pagination = this.document.querySelector(".pf-pagination-container");
      if (table) {
        table.classList.remove("table-header-fixed");
      }
      if (pagination) {
        pagination.classList.remove("pagination-fixed");
      }
    }
  }

  scrollY() {
    return window.pageYOffset || this.docElem.scrollTop;
  }

  ngOnInit(): void {}
}

import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-business-container-dynamic",
  template: `
    <router-outlet></router-outlet>
  `,
})
export class LayoutContainerDynamicComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}

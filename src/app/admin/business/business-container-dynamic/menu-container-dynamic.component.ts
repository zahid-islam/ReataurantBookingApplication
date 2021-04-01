import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-menu-container-dynamic",
  template: `
    <router-outlet></router-outlet>
  `,
})
export class MenuContainerDynamicComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}

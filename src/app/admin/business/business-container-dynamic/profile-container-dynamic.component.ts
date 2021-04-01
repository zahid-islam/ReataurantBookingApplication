import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-profile-container-dynamic",
  template: `
    <router-outlet></router-outlet>
  `,
})
export class ProfileContainerDynamicComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}

import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-profile-dynamic",
  template: `
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class ProfileDynamicComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}

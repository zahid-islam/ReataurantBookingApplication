import { Component } from "@angular/core";
import { PlatformLocation } from "@angular/common";

@Component({
  selector: "app-setting-container-dynamic",
  template: `
    <div class="row ">
      <div class="col-md-12 text-right mb-2">
        <div class="btn-group business-menu" role="group" aria-label="Setting">
          <a
            class="btn"
            [routerLink]="['/admin/setting/tags']"
            routerLinkActive="btn-menu-pimery"
            role="button"
          >
            Category
          </a>
          <a
            class="btn"
            [routerLink]="['/admin/setting/apps-versioning']"
            routerLinkActive="btn-menu-pimery"
            role="button"
          >
            App Versioning
          </a>
          <a
            class="btn"
            [routerLink]="['/admin/setting/business-classification']"
            routerLinkActive="btn-menu-pimery"
            role="button"
          >
            Business Classification
          </a>
          <a
            class="btn"
            [routerLink]="['/admin/setting/facilities']"
            routerLinkActive="btn-menu-pimery"
            role="button"
          >
            Facilities
          </a>
          <a
            class="btn"
            [routerLink]="['/admin/setting/facility-group']"
            routerLinkActive="btn-menu-pimery"
            role="button"
          >
            Facility Group
          </a>
          <a
            class="btn"
            [routerLink]="['/admin/setting/email']"
            routerLinkActive="btn-menu-pimery"
            role="button"
          >
            Email
          </a>
          <a
            class="btn"
            [routerLink]="['/admin/setting/refund-policy']"
            routerLinkActive="btn-menu-pimery"
            role="button"
          >
            Refund Policy
          </a>
          <a
            class="btn"
            [routerLink]="['/admin/setting/mobile-balance']"
            routerLinkActive="btn-menu-pimery"
            role="button"
          >
            Mobile Balance
          </a>
        </div>
      </div>
    </div>

    <router-outlet></router-outlet>
  `
})
export class SettingContainerDynamicComponent {
  constructor() {}
}

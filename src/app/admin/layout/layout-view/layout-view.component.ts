import { SharedDataService } from './../../../shared/services/shared-data.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ShapeService } from './../service/shape.service';
import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
declare var jQuery: any;
// import { DOCUMENT } from '@angular/common';

interface ILayout {
  id: number;
  floorName: string;
  svgUrl: string;
  floorPlanTables: any;
}

@Component({
  selector: 'app-layout-view',
  templateUrl: './layout-view.component.html',
  styles: []
})
export class LayoutViewComponent implements OnInit {

  public businessId: number;
  floorPlans: ILayout[] = [];
  selectedFloor: ILayout = {} as ILayout;
  isLoading: boolean;
  insertedSvg: string;

  hasFloor: boolean;
  showEmptyLayout: boolean;
  isPreviousFloor: boolean;
  isNextFloor: boolean;
  regex: any = /^table/;

  contextmenu = false;
  contextmenuX = 0;
  contextmenuY = 0;
  tableNameId: string = '';
  // @ViewChild('layoutViewModal', { static: false }) layoutViewModal: ElementRef;
  // @Inject(DOCUMENT) public document: Document;

  constructor(
    private shapeService: ShapeService,
    private toastr: ToastrManager,
    private sharedDataService: SharedDataService,
    private router: Router,
    private platformLocation: PlatformLocation,
    private sharedService: SharedDataService
  ) { }

  ngOnInit() {
    this.isLoading = false;
    this.hasFloor = false;
    this.showEmptyLayout = false;
    this.isPreviousFloor = false;
    this.isNextFloor = false;
    let fullPath = this.platformLocation.href;
    this.businessId = this.sharedService.getBusinessIdFromUrl(fullPath);
    if (this.businessId) {
      this.getAllFloorPlanUnderBusiness();
    }
  }

  getAllFloorPlanUnderBusiness() {
    this.shapeService.getAllFloorPlanUnderBusiness(this.businessId).subscribe(
      (res: any) => {
        res.floorPlans.forEach(item => {
          let floor: ILayout = {} as ILayout;
          floor.floorName = item.floorName;
          floor.id = item.id;
          floor.svgUrl = item.svgUrl;
          floor.floorPlanTables = item.floorPlanTables;
          this.floorPlans.push(floor);
        });

        if (this.floorPlans.length) {
          this.hasFloor = true;
          this.showEmptyLayout = false;
          if (this.floorPlans.length == 1) {
            this.isPreviousFloor = true;
            this.isNextFloor = true;
          } else if (this.floorPlans.length > 1) {
            this.isPreviousFloor = true;
          }
          this.selectedFloor = this.floorPlans[0];
          this.downlaodFloor();
        } else {
          this.hasFloor = false;
          this.showEmptyLayout = true;
        }

      },
      err => {
        this.hasFloor = false;
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  downlaodFloor() {
    this.isLoading = true;
    this.sharedDataService.getSvg(this.selectedFloor.svgUrl).subscribe(
      (res: any) => {

        this.insertedSvg = res.body;

        if (this.insertedSvg) {
          let svgElement = document.querySelector("svg");
          const domParser = new DOMParser();
          const dom = domParser.parseFromString(this.insertedSvg, "image/svg+xml");
          const layoutSvgElement = dom.children[0];

          for (let j = 0; j < layoutSvgElement.attributes.length; j++) {
            let attr = layoutSvgElement.attributes[j];
            if (attr.name != 'xmlns' && attr.name != 'xmlns:xlink') {
              svgElement.setAttribute(attr.name, attr.nodeValue);
            }
          }
          document.getElementsByTagName("svg")[0].innerHTML = layoutSvgElement.innerHTML;
        }
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  getPreviousFloor() {
    if (this.floorPlans.length) {
      let index = this.floorPlans.indexOf(this.selectedFloor);
      if (index > 0) {
        this.isNextFloor = false;
        this.selectedFloor = this.floorPlans[index - 1];
        this.downlaodFloor();
        if (index == 1) {
          this.isPreviousFloor = true;
        }
      }
    }
  }

  getNextFloor() {
    if (this.floorPlans.length) {
      let index = this.floorPlans.indexOf(this.selectedFloor);
      if (index != -1) {
        let getIndex = index + 1;
        if (getIndex < this.floorPlans.length) {
          this.isPreviousFloor = false;
          this.selectedFloor = this.floorPlans[getIndex];
          this.downlaodFloor();
          if (getIndex == (this.floorPlans.length - 1)) {
            this.isNextFloor = true;
          }
        } else if (getIndex == this.floorPlans.length) {
          this.isNextFloor = true;
        }
      }

    }
  }

  getTableReservation(event: any) {
    let elementId = event.target.id;
    this.tableNameId = elementId;
    if (this.regex.test(elementId)) {
      let height = jQuery(document).scrollTop();
      this.contextmenuX = event.clientX
      this.contextmenuY = event.clientY + height;
      this.contextmenu = true;
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent | any): void {
    let elementId = event.target.id;
    if (!this.regex.test(elementId)) {
      this.contextmenu = false;
    }
  }

  getUpcomingReservation(data: any) {
    if (this.selectedFloor.floorPlanTables.length) {
      let table = this.selectedFloor.floorPlanTables.find(item => item.svgId == this.tableNameId);
      let tableId = table ? table.id : 0;
      let floorId = this.selectedFloor.id;
      if (tableId > 0) {
        let paramObj = { 'tableId': tableId, 'floorId': floorId, 'afterDate': data, 'beforeDate': null, 'businessId': this.businessId };
        this.router.navigate([`/admin/business/manage-business/${this.businessId}/layout/table-reservation`], { state: { data: paramObj } });
      }
    }
  }

  getHistoryReservation(data: any) {
    if (this.selectedFloor.floorPlanTables.length) {
      let table = this.selectedFloor.floorPlanTables.find(item => item.svgId == this.tableNameId);
      let tableId = table ? table.id : 0;
      let floorId = this.selectedFloor.id;
      if (tableId > 0) {
        let paramObj = { 'tableId': tableId, 'floorId': floorId, 'afterDate': null, 'beforeDate': data, 'businessId': this.businessId };
        this.router.navigate(
          [`/admin/business/manage-business/${this.businessId}/layout/table-reservation`],
          { state: { data: paramObj } });
      }
    }
  }

  goToFloorCreatePage(actionData: string) {
    if (actionData) {
      this.router.navigate([`/admin/business/manage-business/${this.businessId}/layout/floor`,
      btoa(JSON.stringify({ action: actionData }))]);
    }
  }

}

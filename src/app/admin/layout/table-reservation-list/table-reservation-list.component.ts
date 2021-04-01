
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { ToastrManager } from 'ng6-toastr-notifications';

import { ShapeService } from './../service/shape.service';
import { Orders } from '../../../shared/models/orders.model';
import { SharedDataService } from '../../../shared/services/shared-data.service';

interface IParamas {
  tableId: number;
  floorId: number;
  date: number;
  businessId: number;
  afterDate: number;
  beforeDate: number;
}

@Component({
  selector: 'app-table-reservation-list',
  templateUrl: './table-reservation-list.component.html',
})
export class TableReservationListComponent implements OnInit {
  businessID: number;
  param: IParamas = {} as IParamas;
  reservationUnderTable: Orders[];
  isLoading: boolean;

  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

  constructor(
    private shapeService: ShapeService,
    private router: Router,
    private toastr: ToastrManager,
    private sharedDataService: SharedDataService,
    private platformLocation: PlatformLocation,
  ) {
    this.isLoading = false;
  }

  ngOnInit() {
    let pathIdList: number[] = [];
    const fullPath = this.platformLocation.href;
    this.param = history.state.data;
    pathIdList = this.sharedDataService.getFillPathIDList(fullPath);

    if (pathIdList.length) {
      this.businessID = pathIdList[0];
    }
    if (this.param) {
      this.getOrderPaginatedlyUnderTable(
        this.offset.toString(),
        this.limit.toString(),
        this.param.businessId,
        this.param.floorId,
        this.param.tableId,
        this.param.afterDate,
        this.param.beforeDate,
      );
    } else {
      this.router.navigate([`/admin/business/manage-business/${this.businessID}/layout`]);
    }
  }

  private getOrderPaginatedlyUnderTable(
    offset: string,
    limit: string,
    businessId: number,
    floorId: number,
    tableId: number,
    afterDate: any,
    beforeDate: any,
    loading?: boolean) {
    this.isLoading = loading == false ? loading : true;
    this.shapeService
      .getOrderPaginatedlyUnderTable(offset, limit, businessId, floorId, tableId, afterDate, beforeDate).subscribe(
        (res: any) => {
          this.reservationUnderTable = res.body.data.orders;
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

  public paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.getOrderPaginatedlyUnderTable(
      this.offset.toString(),
      this.limit.toString(),
      this.param.businessId,
      this.param.floorId,
      this.param.tableId,
      this.param.afterDate,
      this.param.beforeDate,
      false
    );
  }
}

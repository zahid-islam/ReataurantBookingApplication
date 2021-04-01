import { FoodItem } from './../models/orders.model';
import { Injectable } from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";

import { ApiService } from "./api.service";
import { UtilityService } from "./utility.service";

@Injectable({
  providedIn: "root"
})
export class OrdersService {
  constructor(
    private utilityService: UtilityService,
    private apiService: ApiService
  ) { }


  // Ticket
  getAllTickets(offset: string, limit: string, ticketData?: any) {
    let params = new HttpParams().set("offset", offset).set("limit", limit);
    return this.apiService
      .postWithParam(this.utilityService.getApiEndPointUrl('tickets/filtered'), ticketData, params)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  assignTicketMySelf(ticketRefId: string) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`tickets/${ticketRefId}/assignto/me`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  assignTicketByCustomerManager(ticketRefId: string, customerSupportId: number) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`tickets/${ticketRefId}/assignto/${customerSupportId}`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  pickAssignTicketToMe(ticketRefId: string) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`tickets/${ticketRefId}/pick`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getTicketById(ticketRefId: string) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`tickets/${ticketRefId}`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  public getOrderById(orderId: string) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`orders/${orderId}`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  waitAticketCurrentlyWorkingOn(ticketRefId: string, waitingTime?: any) {
    return this.apiService
      .put(
        this.utilityService.getApiEndPointUrl(`tickets/${ticketRefId}/wait`), waitingTime
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  submitNoteForActivitiy(ticketRefId: string, note: any) {
    return this.apiService
      .post(this.utilityService.getApiEndPointUrl(`tickets/${ticketRefId}/activities`), note)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getAllActivityUnderAticket(ticketRefId: string) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`tickets/${ticketRefId}/activities`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  approvedOrderByInternalOrBusiness(orderId: string) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`orders/${orderId}/approve`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  declineOrderByInternalOrBusiness(orderId: string, note?: any) {
    let noteObject: any;
    noteObject = note ? note : { note: "Restaurent won't be able to serve food" };
    return this.apiService
      .post(this.utilityService.getApiEndPointUrl(`orders/${orderId}/decline`), noteObject)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  cancelAnOrder(orderId: string) {
    let noteObject: any = { note: "Restaurent won't be able to serve food" };
    return this.apiService
      .post(this.utilityService.getApiEndPointUrl(`orders/${orderId}/cancel`), noteObject)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getTicketStatus() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl("tickets/statuses"))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getTicketTypes() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl("tickets/types"))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  addNewConversationEntriesIntoSupportTicket(ticketRefId: string, supportBody: any) {
    return this.apiService
      .post(this.utilityService.getApiEndPointUrl(`tickets/supportconversation/${ticketRefId}/support`), supportBody)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  markSupprotTicketAsResolved(ticketRefId: string, note?: any) {
    return this.apiService
      .put(
        this.utilityService.getApiEndPointUrl(`tickets/supportconversation/${ticketRefId}/resolve`), note)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getSupportConversationEntries(ticketRefId: string, offset: string, limit: string) {
    let sort = 'createdAt:desc';
    let params = new HttpParams().set("offset", offset).set("limit", limit).set("sort", sort);
    return this.apiService
      .getWithParam(this.utilityService.getApiEndPointUrl(`tickets/supportconversation/${ticketRefId}`), params)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getSupportConversationAfterSpecEntry(ticketRefId: string, lastEntryId: number, offset?: string, limit?: string) {
    let sort = 'createdAt:desc';
    let params = new HttpParams().set("offset", offset).set("limit", limit).set("sort", sort);
    return this.apiService
      .getWithParam(this.utilityService.getApiEndPointUrl(`tickets/supportconversation/${ticketRefId}/after/${lastEntryId}`), params)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getTicketStatistics() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl('tickets/_statistics'))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  // Ticket end

  getAllOrders(offset: string, limit: string, status?: string) {
    let params = new HttpParams().set("offset", offset).set("limit", limit).set("status", status);
    return this.apiService
      .getWithParam(this.utilityService.getApiEndPointUrl("orders"), params)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getAllOrderByBusiness(businessId: number, offset: string, limit: string, status?: string) {
    let params;
    if (status) {
      params = new HttpParams()
        .set("offset", offset)
        .set("limit", limit)
        .set("status", status);
    } else {
      params = new HttpParams().set("offset", offset).set("limit", limit);
    }
    return this.apiService
      .getWithParam(this.utilityService.getApiEndPointUrl(`businesses/${businessId}/orders`), params)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getOrdersStatus() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl("orders/statuses"))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getAnalytics() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl("analytics"))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  processOrderFoods(orderFoods: any) {
    let netTotal = 0;
    let foodItemList = [];
    if (orderFoods.length > 0) {
      orderFoods.forEach(item => {
        let foodItem = {} as FoodItem;
        foodItem.itemName = [];
        foodItem.price = [];
        let itemUnit = item.unitCount | 0;

        foodItem.primaryPhoto = item.foodMenu.primaryPhoto;
        foodItem.unitCount = item.unitCount;

        foodItem.itemName.push(item.menuName);
        foodItem.price.push(Number(item.excludingVatUnitPrice));

        item.foodOrderAddons.forEach(addon => {
          let addonAddedName =
            " (৳ " +
            Math.round(addon.excludingVatUnitPrice) +
            " x " +
            addon.unitCount +
            ")";
          foodItem.itemName.push(addon.optionName + addonAddedName);
          foodItem.price.push(Number(addon.excludingVatUnitPrice) * addon.unitCount);
        });

        let totalUnitPrice = 0;
        if (foodItem.price.length > 0) {
          foodItem.price.forEach(val => {
            totalUnitPrice = totalUnitPrice + val;
          });
        }
        foodItem.unitPrice = totalUnitPrice;
        foodItem.totalPrice = itemUnit * totalUnitPrice;
        foodItemList.push(foodItem);
      });

      if (foodItemList.length > 0) {
        foodItemList.forEach(eachItem => {
          netTotal = netTotal + eachItem.totalPrice;
        });
      }
    }

    return { foodItemList, netTotal };
  }

  getSearchResultOfAllOrders(searchObj: any, offset: string, limit: string, status?: any) {
    const params = new HttpParams().set("offset", offset).set("limit", limit).set("status", status);
    return this.apiService
      .postWithParam(this.utilityService.getApiEndPointUrl('orders/search'), searchObj, params)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getSearchResultInAllOrderUnderABusiness(businessId: number, searchObj: any, offset: string, limit: string, status?: any) {
    const params = new HttpParams().set("offset", offset).set("limit", limit).set("status", status);
    return this.apiService
      .postWithParam(this.utilityService.getApiEndPointUrl(`businesses/${businessId}/orders/search`), searchObj, params)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }
}

import { CustomerService } from './../../services/customer.service';
import { AppConstants } from './../../../shared/constants/app-constants';
import { UtilityService } from "./../../../shared/services/utility.service";
import { UserModel } from "./../../../user/models/user.model";
import { SharedDataService } from "./../../../shared/services/shared-data.service";
import { Orders, Activitiy } from "./../../../shared/models/orders.model";
import { OrdersService } from "./../../../shared/services/orders.service";
import { ToastrManager } from "ng6-toastr-notifications";
import { Router, ActivatedRoute } from "@angular/router";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  OnDestroy
} from "@angular/core";
import { Subscription } from "rxjs";
declare var jQuery: any;

@Component({
  selector: "app-ticket-support-details",
  templateUrl: "./ticket-support-details.component.html",
  styles: []
})
export class TicketSupportDetailsComponent
  implements OnInit, OnDestroy {
  @ViewChild("supportParticularImages", { static: false })
  supportParticularImages: ElementRef;

  @ViewChild("messageScrollContainer", { static: false })
  private messageScrollContainer: ElementRef;

  @ViewChild("userProfileModal", { static: false })
  private userProfileModal: ElementRef;

  @ViewChild(InfiniteScrollDirective, { static: true })
  infiniteScroll: InfiniteScrollDirective;

  private subscription: Subscription;
  isInvoiceCollapse: boolean = false;
  ticketRefId: string = null;
  ticketDetails: any;
  orderDetails: Orders = new Orders();
  currentUser: UserModel = new UserModel();
  noteActivity: any[] = [];
  allActivities: any = [];

  // paginator variable
  offset: number = 0;
  pageNumber: number = 1;
  limit: number = 10;
  totalCount: number;

  currentTicketStatus: string;
  isTicketStatusResolved: boolean;
  conversationEntries: any[] = [];

  subTotal: number = 0;
  netTotal: number = 0;
  eachUnitPriceTotalWithAddons = [];
  messageObject: any = {};

  fileData: File = null;
  fileDataList: File[] = [];
  imageUrls: any[] = [];
  showSupportMessageImageList: any[] = [];
  itm: number = 1;

  isConversationLoading: boolean;
  isImgLoading: boolean;
  isConversationSubmitted: boolean = false;

  customerDetails: UserModel = new UserModel();
  age: number;

  constructor(
    private router: Router,
    private orderService: OrdersService,
    private toastr: ToastrManager,
    private route: ActivatedRoute,
    private sharedService: SharedDataService,
    private utility: UtilityService,
    private customerService: CustomerService
  ) { }

  ngOnInit() {
    this.isTicketStatusResolved = false;
    this.isImgLoading = true;
    let user: UserModel = this.utility.getUserPayload();
    this.currentUser = user;
    this.route.params.subscribe(params => {
      this.ticketRefId = params["id"];
      if (this.ticketRefId) {
        this.getTicketById(this.ticketRefId);
      }
    });
    this.getAllActivityUnderAticket();
    this.getSupportConversationEntries(this.ticketRefId, this.offset, this.limit);
  }

  hideButtonIfNotValidToShow() {
    let assignedId = this.ticketDetails ? this.ticketDetails.assignedTo : 0;
    if (!this.isTicketStatusResolved && this.currentUser.id === assignedId) {
      return true;
    }
    else {
      return false;
    }
  }

  onLoad() {
    this.isImgLoading = false;
  }

  scrollToBottom() {
    this.messageScrollContainer.nativeElement.scrollTop = this.messageScrollContainer.nativeElement.scrollHeight;
  }

  onScrollDown() {
    const insert = (arr, index, newItem) => [
      // part of the array before the specified index
      ...arr.slice(0, index),
      // inserted item
      newItem,
      // part of the array after the specified index
      ...arr.slice(index)
    ]

    this.isConversationLoading = false;
    let lastEntryId = this.conversationEntries[0].id;

    this.orderService.getSupportConversationAfterSpecEntry(
      this.ticketRefId,
      lastEntryId)
      .subscribe(
        (res: any) => {
          if (res.body.data.conversationEntries.length) {
            res.body.data.conversationEntries.forEach(item => {
              item.body = JSON.parse(item.body);
            });
            let convEntries = [];
            convEntries = res.body.data.conversationEntries.length
              ? res.body.data.conversationEntries
              : [];
            // Reverse response data.
            convEntries = convEntries.slice().reverse();

            // Push response data into conversation entries.
            convEntries.forEach(item => {
              this.conversationEntries = this.utility.pushItemIntoArrayListAtZeroIndex(this.conversationEntries, 0, item);
            });
            this.totalCount = res.body.data.count;
          }
        },
        err => {
          this.isConversationLoading = false;
          this.toastr.errorToastr(err.error.message.en);
        },
        () => {
          this.isConversationLoading = false;
        }
      );

    this.infiniteScroll.ngOnDestroy();
    this.infiniteScroll.setup();
  }

  onScrollUp() {
    this.pageNumber += 1;
    this.offset = 10 * (this.pageNumber - 1);
    this.limit = 10;
    if (this.offset <= this.totalCount) {
      this.getSupportConversationEntries(
        this.ticketRefId,
        this.offset,
        this.limit
      );
    }
    else {
      this.pageNumber -= 1;
      this.offset = 10 * (this.pageNumber - 1);
      this.limit = 10;
    }
    this.infiniteScroll.ngOnDestroy();
    this.infiniteScroll.setup();
  }

  getAllActivityUnderAticket() {
    this.orderService.getAllActivityUnderAticket(this.ticketRefId).subscribe(
      (res: any) => {
        this.allActivities = [];
        res.body.data.activities.forEach(activity => {
          let item = new Activitiy();
          item.id = activity.id;
          item.createdAt = activity.createdAt;
          item.isPerformedBySystem = activity.isPerformedBySystem;
          item.ticketStatus = activity.ticketStatus.name;

          item.note = activity.note;
          item.waitTime = activity.waitTime;

          item.performerEmail = activity.performer ? activity.performer.email : null;
          item.userType = activity.performer ? activity.performer.userType.name : null;
          item.performerFirstName = activity.performer ? activity.performer.firstName : null;
          item.performerLastName = activity.performer ? activity.performer.lastName : null;

          item.assigneeEmail = activity.assignee
            ? activity.assignee.email
            : null;
          item.assigneeFirstName = activity.assignee
            ? activity.assignee.firstName
            : null;
          item.assigneeLastName = activity.assignee
            ? activity.assignee.lastName
            : null;

          if (
            item.assigneeEmail == null &&
            item.performerEmail &&
            item.ticketStatus == "PENDING"
          ) {
            item.message = "Ticket created by <b>SYSTEM</b>";
          } else if (
            item.assigneeEmail &&
            item.performerEmail &&
            item.ticketStatus == "PENDING"
          ) {
            item.message = `Ticket assigned to <b>${item.assigneeEmail}</b> by <b>${item.performerEmail}</b>`;
          } else if (
            item.assigneeEmail &&
            item.performerEmail &&
            item.ticketStatus == "SUPPORT_CONVERSATION_IN_PROGRESS"
          ) {
            item.message = `Ticket moved to <b>${item.ticketStatus}</b> by <b>${item.performerEmail}</b>`;
          } else if ((item.userType == 'CUSTOMER_SUPPORT' || item.userType == 'CUSTOMER_SUPPORT_MANAGER') && item.ticketStatus == 'RESOLVED') {
            item.message = `Ticket moved to <b>${item.ticketStatus}</b> by <b>USER: ${item.performerEmail}</b>`;
          } else if (
            item.performerEmail &&
            item.ticketStatus == "SUPPORT_CONVERSATION_CUSTOMER_SUPPORT_PENDING"
          ) {
            item.message = `Ticket moved to <b>${item.ticketStatus}</b> by <b>${item.performerEmail}</b>`;
          }
          else if (item.isPerformedBySystem) {
            item.message = `Ticket moved to <b>${item.ticketStatus}</b> by <b>SYSTEM</b>`;
          }

          this.allActivities.push(item);
        });
      },
      err => { }
    );
  }

  getSupportConversationEntries(
    ticketRefId: string,
    offset: number,
    limit: number
  ) {
    this.isConversationLoading = true;
    this.orderService
      .getSupportConversationEntries(
        ticketRefId,
        offset.toString(),
        limit.toString()
      )
      .subscribe(
        (res: any) => {
          res.body.data.conversationEntries.forEach(item => {
            item.body = JSON.parse(item.body);
          });
          if (this.isConversationSubmitted) {
            this.conversationEntries = [];
            this.isConversationSubmitted = false;
          }
          let convEntries = [];
          convEntries = res.body.data.conversationEntries.length
            ? res.body.data.conversationEntries
            : [];
          if (convEntries.length) {
            this.conversationEntries.push(...convEntries);
          }
          this.totalCount = res.body.data.count;
        },
        err => {
          this.isConversationLoading = false;
          this.toastr.errorToastr(err.error.message.en);
        },
        () => {
          this.isConversationLoading = false;
        }
      );
  }

  getTicketById(ticketRefId: string) {
    this.subscription = this.orderService.getTicketById(ticketRefId).subscribe(
      (res: any) => {
        this.ticketDetails = res.body.data.ticket;
        let orderRefId = this.ticketDetails.order ? this.ticketDetails.order.refId : null;
        if (orderRefId) {
          this.getOrderById(this.ticketDetails.order.refId);
        }
        this.currentTicketStatus = this.ticketDetails.ticketStatus ? this.ticketDetails.ticketStatus.name : "";
        this.isTicketStatusResolved = this.currentTicketStatus === "RESOLVED" ? true : false;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      },
      () => { }
    );
  }

  getOrderById(id: string) {
    this.subscription = this.orderService.getOrderById(id).subscribe(
      (res: any) => {
        this.orderDetails = res.body.data.order;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      },
      () => {
        this.orderInvoiceControl(this.orderDetails.foodOrders);
      }
    );
  }

  orderInvoiceControl(foodOrders) {
    const eachTotalItemPrice: any[] = [];
    if (foodOrders.length > 0) {
      foodOrders.forEach(item => {
        let addonsTotal = 0;
        if (item.foodOrderAddons.length > 0) {
          item.foodOrderAddons.forEach(addons => {
            addonsTotal += Number(addons.excludingVatTotalPrice);
          });
        }
        let value =
          `৳ ${Number(item.excludingVatUnitPrice) + Number(addonsTotal)} * ${item.unitCount} = ৳ ${(Number(item.excludingVatUnitPrice) + Number(addonsTotal)) * Number(item.unitCount)}`;
        this.eachUnitPriceTotalWithAddons.push(value);
        eachTotalItemPrice.push((Number(item.excludingVatUnitPrice) + Number(addonsTotal)) * Number(item.unitCount));
      });
    }
    if (eachTotalItemPrice.length > 0) {
      eachTotalItemPrice.forEach((value, index) => {
        this.subTotal += eachTotalItemPrice[index];
      });
    }

    let vat = Number(this.orderDetails.vatAmount);
    let service = Number(this.orderDetails.serviceChargeAmount);
    let discount = Number(this.orderDetails.orderPromotion ? this.orderDetails.orderPromotion.discountAmount : 0);
    this.netTotal = ((this.subTotal - discount) + (vat + service));
  }

  checkValueIsNumberAndPositive(value: any) {
    return AppConstants.checkValueIsNumberAndPositive(value);
  }

  deleteThisImage(index: any) {
    let exsitingItem = this.imageUrls[index];
    if (exsitingItem.id == 0) {
      this.fileDataList.splice(index, 1);
    }
    this.imageUrls.splice(index, 1);
  }

  markSupprotTicketAsResolved() {
    this.orderService.markSupprotTicketAsResolved(this.ticketRefId).subscribe(
      res => {
        this.getTicketById(this.ticketRefId);
        this.toastr.successToastr("Ticket is resolved");
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  leaveAssignedTicket() {
    if (this.currentTicketStatus === 'SUPPORT_CONVERSATION_IN_PROGRESS') {
      this.orderService.waitAticketCurrentlyWorkingOn(this.ticketRefId).subscribe(
        (res: any) => {
          this.getTicketById(this.ticketRefId);
          this.toastr.successToastr("Ticket leaved successfully.");
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
    }
  }

  onSelectedFiles(photo: any) {
    if (photo.files.length > 0) {
      for (let file of photo.files) {
        this.fileDataList.push(<File>file);
        let reader = new FileReader();
        let newImage: any = {};
        reader.onload = (event: any) => {
          newImage.id = 0;
          newImage.photo = event.target.result;
          this.imageUrls.push(newImage);
        };
        reader.readAsDataURL(<File>file);
      }
    }
  }

  submitMessage() {
    let conversationObj: any = {};
    let supportBody: any = {};
    if (this.fileDataList.length > 0) {
      const formDataMultiple = new FormData();
      this.fileDataList.forEach(item => {
        formDataMultiple.append("files", item);
      });

      this.sharedService
        .uploadMultipleImages(formDataMultiple)
        .subscribe((uploadRes: any) => {
          conversationObj.images = [];
          uploadRes.body.data.results.forEach(item => {
            conversationObj.images.push(item.Location);
          });

          conversationObj.text = this.messageObject.text
            ? this.messageObject.text
            : "";
          supportBody.body = JSON.stringify(conversationObj);
          this.orderService
            .addNewConversationEntriesIntoSupportTicket(
              this.ticketRefId,
              supportBody
            )
            .subscribe(
              res => {
                this.fileDataList = [];
                this.imageUrls = [];
                this.messageObject.text = "";
                this.isConversationSubmitted = true;
                this.getSupportConversationEntries(this.ticketRefId, 0, 10);
              },
              err => {
                this.toastr.errorToastr(err.error.message.en);
              }
            );
        });
    } else {
      if (this.messageObject.text) {
        conversationObj.text = this.messageObject.text;
        supportBody.body = JSON.stringify(conversationObj);
        this.orderService
          .addNewConversationEntriesIntoSupportTicket(
            this.ticketRefId,
            supportBody
          )
          .subscribe(
            res => {
              this.messageObject.text = "";
              this.isConversationSubmitted = true;
              this.getSupportConversationEntries(this.ticketRefId, 0, 10);
            },
            err => {
              this.toastr.errorToastr(err.error.message.en);
            }
          );
      }
    }
  }

  showIsGatterThanThreeImages(images) {
    this.showSupportMessageImageList = images;
    jQuery(this.supportParticularImages.nativeElement).modal("show");
  }

  getCustomerById(converstion: any) {
    if (converstion.sender.userType.name == 'END_USER') {
      this.customerService.getCustomerById(converstion.sender.id).subscribe(
        (res: any) => {
          this.customerDetails = res.body.data.user;

          //Calculate age from dob
          if (this.customerDetails.dob) {
            const bdate = new Date(this.customerDetails.dob);
            let timeDiff = Math.abs(Date.now() - bdate.getTime());
            this.age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25);
          }
          jQuery(this.userProfileModal.nativeElement).modal("show");
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

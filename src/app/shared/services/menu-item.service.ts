import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";

import { ApiService } from "./api.service";
import { UtilityService } from "./utility.service";
import { RoleType } from "./../models/common.model";

@Injectable({
  providedIn: "root"
})
export class MenuItemService {
  menuItems: any;
  constructor(private utility: UtilityService, private apiService: ApiService) {
    this.menuItems = {
      SUPER_ADMIN: [
        {
          displayName: "Dashboard",
          imagePath: "/assets/images/icon/menu-dashboard.svg",
          route: "/admin/admin-dashboard"
        },
        {
          displayName: "Sales",
          imagePath: "/assets/images/icon/menu-sales.svg",
          listElementId: "collapseSales",
          children: [
            {
              displayName: "Business",
              route: "/admin/sales/create-business"
            }
          ]
        },
        {
          displayName: "Reservation",
          imagePath: "/assets/images/icon/menu-reservations.svg",
          route: "/admin/orders/reservation"
        },
        {
          displayName: "Marketing",
          imagePath: "/assets/images/icon/menu-marketing.svg",
          listElementId: "collapseMarketing",
          children: [
            {
              displayName: "Notifications",
              route: "/admin/marketing/notifications"
            },
            {
              displayName: "Promotion",
              route: "/admin/marketing/promotion"
            }
          ]
        },
        {
          displayName: "Analytics",
          imagePath: "/assets/images/icon/menu-analytics.svg",
          route: "/admin/analytics"
        },
        {
          displayName: "Accounts",
          imagePath: "/assets/images/icon/menu-accounts.svg",
          listElementId: "collapseAccounts",
          children: [
            {
              displayName: "Account",
              route: "/admin/accounts/receivable"
            },
            {
              displayName: "Reservation Promotion",
              route: "/admin/accounts/order-promotion"
            }
          ]
        },
        {
          displayName: "Support",
          imagePath: "/assets/images/icon/menu-support.svg",
          listElementId: "collapseSupport",
          children: [
            {
              displayName: "Non Resolved",
              route: "/admin/orders/ticket-list"
            },
            {
              displayName: "Resolved",
              route: "/admin/orders/resolve-ticket-list"
            }
          ]
        },
        {
          displayName: "Customer",
          imagePath: "/assets/images/icon/menu-customer.svg",
          route: "/admin/customer"
        },
        {
          displayName: "Manage Business",
          imagePath: "/assets/images/icon/menu-business.svg",
          route: "/admin/business"
        },
        {
          displayName: "Manage User",
          imagePath: "/assets/images/icon/menu-manage-user.svg",
          listElementId: "collapseManageUser",
          children: [
            {
              displayName: "User",
              route: "/admin/manage-user/user"
            },
            {
              displayName: "Access Control",
              route: "/admin/manage-user/access-control"
            }
          ]
        },
        {
          displayName: "Activity Logs",
          imagePath: "/assets/images/icon/menu-activity-logs.svg",
          route: "/admin/activity-logs"
        },
        {
          displayName: "Settings",
          imagePath: "/assets/images/icon/menu-settings.svg",
          route: "/admin/setting/tags"
        }
      ],
      ADMIN: [
        {
          displayName: "Dashboard",
          imagePath: "/assets/images/icon/menu-dashboard.svg",
          route: "/admin/admin-dashboard"
        },
        {
          displayName: "Sales",
          imagePath: "/assets/images/icon/menu-sales.svg",
          listElementId: "collapseSales",
          children: [
            {
              displayName: "Business",
              route: "/admin/sales/create-business"
            }
          ]
        },
        {
          displayName: "Reservation",
          imagePath: "/assets/images/icon/menu-reservations.svg",
          route: "/admin/orders/reservation"
        },
        {
          displayName: "Marketing",
          imagePath: "/assets/images/icon/menu-marketing.svg",
          listElementId: "collapseMarketing",
          children: [
            {
              displayName: "Notifications",
              route: "/admin/marketing/notifications"
            },
            {
              displayName: "Promotion",
              route: "/admin/marketing/promotion"
            }
          ]
        },
        {
          displayName: "Analytics",
          imagePath: "/assets/images/icon/menu-analytics.svg",
          route: "/admin/analytics"
        },
        {
          displayName: "Accounts",
          imagePath: "/assets/images/icon/menu-accounts.svg",
          listElementId: "collapseAccounts",
          children: [
            {
              displayName: "Account",
              route: "/admin/accounts/receivable"
            },
            {
              displayName: "Reservation  Promotion",
              route: "/admin/accounts/order-promotion"
            }
          ]
        },
        {
          displayName: "Support",
          imagePath: "/assets/images/icon/menu-support.svg",
          listElementId: "collapseSupport",
          children: [
            {
              displayName: "Non Resolved",
              route: "/admin/orders/ticket-list"
            },
            {
              displayName: "Resolved",
              route: "/admin/orders/resolve-ticket-list"
            }
          ]
        },
        {
          displayName: "Customer",
          imagePath: "/assets/images/icon/menu-customer.svg",
          route: "/admin/customer"
        },
        {
          displayName: "Manage Business",
          imagePath: "/assets/images/icon/menu-business.svg",
          route: "/admin/business"
        },
        {
          displayName: "Manage User",
          imagePath: "/assets/images/icon/menu-manage-user.svg",
          listElementId: "collapseManageUser",
          children: [
            {
              displayName: "User",
              route: "/admin/manage-user/user"
            }
          ]
        }
      ],
      SALES: [
        {
          displayName: "Dashboard",
          imagePath: "/assets/images/icon/menu-dashboard.svg",
          route: "/admin/admin-dashboard"
        },
        {
          displayName: "Sales",
          imagePath: "/assets/images/icon/menu-sales.svg",
          listElementId: "collapseSales",
          children: [
            {
              displayName: "Business",
              route: "/admin/sales/create-business",
              action: ["business_create", "business_status", "business_create"]
            }
          ]
        }
      ],
      SALES_MANAGER: [
        {
          displayName: "Dashboard",
          imagePath: "/assets/images/icon/menu-dashboard.svg",
          route: "/admin/admin-dashboard"
        },
        {
          displayName: "Sales",
          imagePath: "/assets/images/icon/menu-sales.svg",
          listElementId: "collapseSales",
          children: [
            {
              displayName: "Business",
              route: "/admin/sales/create-business",
              action: ["business_create", "business_status", "business_create"]
            }
          ]
        }
      ],
      ACCOUNTS_MANAGER: [
        {
          displayName: "Dashboard",
          imagePath: "/assets/images/icon/menu-dashboard.svg",
          route: "/admin/admin-dashboard"
        },
        {
          displayName: "Accounts",
          imagePath: "/assets/images/icon/menu-accounts.svg",
          listElementId: "collapseAccounts",
          children: [
            {
              displayName: "Account",
              route: "/admin/accounts/receivable"
            },
            {
              displayName: "Reservation  Promotion",
              route: "/admin/accounts/order-promotion"
            }
          ]
        }
      ],
      ACCOUNTS: [
        {
          displayName: "Dashboard",
          imagePath: "/assets/images/icon/menu-dashboard.svg",
          route: "/admin/admin-dashboard"
        },
        {
          displayName: "Accounts",
          imagePath: "/assets/images/icon/menu-accounts.svg",
          listElementId: "collapseAccounts",
          children: [
            {
              displayName: "Account",
              route: "/admin/accounts/receivable"
            },
            {
              displayName: "Reservation  Promotion",
              route: "/admin/accounts/order-promotion"
            }
          ]
        }
      ],
      MARKETING_MANAGER: [
        {
          displayName: "Dashboard",
          imagePath: "/assets/images/icon/menu-dashboard.svg",
          route: "/admin/admin-dashboard"
        },
        {
          displayName: "Marketing",
          imagePath: "/assets/images/icon/menu-marketing.svg",
          listElementId: "collapseMarketing",
          children: [
            {
              displayName: "Notifications",
              route: "/admin/marketing/notifications"
            },
            {
              displayName: "Promotion",
              route: "/admin/marketing/promotion"
            }
          ]
        }
      ],
      MARKETING: [
        {
          displayName: "Dashboard",
          imagePath: "/assets/images/icon/menu-dashboard.svg",
          route: "/admin/admin-dashboard"
        },
        {
          displayName: "Marketing",
          imagePath: "/assets/images/icon/menu-marketing.svg",
          listElementId: "collapseMarketing",
          children: [
            {
              displayName: "Notifications",
              route: "/admin/marketing/notifications"
            },
            {
              displayName: "Promotion",
              route: "/admin/marketing/promotion"
            }
          ]
        }
      ],
      CUSTOMER_SUPPORT_MANAGER: [
        {
          displayName: "Dashboard",
          imagePath: "/assets/images/icon/menu-dashboard.svg",
          route: "/admin/admin-dashboard"
        },
        {
          displayName: "Support",
          imagePath: "/assets/images/icon/menu-support.svg",
          listElementId: "collapseSupport",
          children: [
            {
              displayName: "Non Resolved",
              route: "/admin/orders/ticket-list"
            },
            {
              displayName: "Resolved",
              route: "/admin/orders/resolve-ticket-list"
            }
          ]
        },
        {
          displayName: "Sales",
          imagePath: "/assets/images/icon/menu-sales.svg",
          listElementId: "collapseSales",
          children: [
            {
              displayName: "Business",
              route: "/admin/sales/create-business",
              action: ["business_edit", "create"]
            }
          ]
        }
      ],
      CUSTOMER_SUPPORT: [
        {
          displayName: "Dashboard",
          imagePath: "/assets/images/icon/menu-dashboard.svg",
          route: "/admin/admin-dashboard"
        },
        {
          displayName: "Support",
          imagePath: "/assets/images/icon/menu-support.svg",
          listElementId: "collapseSupport",
          children: [
            {
              displayName: "Non Resolved",
              route: "/admin/orders/ticket-list"
            },
            {
              displayName: "Resolved",
              route: "/admin/orders/resolve-ticket-list"
            }
          ]
        },
        {
          displayName: "Sales",
          imagePath: "/assets/images/icon/menu-sales.svg",
          listElementId: "collapseSales",
          children: [
            {
              displayName: "Business",
              route: "/admin/sales/create-business",
              action: ["business_edit", "create"]
            }
          ]
        }
      ]
    };
  }

  userRoles: RoleType[] = [
    {
      id: 1,
      name: "SUPER_ADMIN",
      display: "Super Admin"
    },
    {
      id: 2,
      name: "ADMIN",
      display: "Admin"
    },
    {
      id: 3,
      name: "SALES_MANAGER",
      display: "Sales Manager"
    },
    {
      id: 4,
      name: "SALES",
      display: "Sales"
    },
    {
      id: 5,
      name: "MARKETING_MANAGER",
      display: "Marketing Manager"
    },
    {
      id: 6,
      name: "MARKETING",
      display: "Marketing"
    },
    {
      id: 7,
      name: "CUSTOMER_SUPPORT_MANAGER",
      display: "Customer Support Manager"
    },
    {
      id: 8,
      name: "CUSTOMER_SUPPORT",
      display: "Customer Support"
    },
    {
      id: 9,
      name: "ACCOUNTS_MANAGER",
      display: "Account Manager"
    },
    {
      id: 10,
      name: "ACCOUNTS",
      display: "Account"
    },
    {
      id: 11,
      name: "BUSINESS",
      display: "Business"
    },
    {
      id: 12,
      name: "END_USER",
      display: "End User"
    }
  ];

  getAllUserType() {
    return this.apiService
      .get(this.utility.getApiEndPointUrl("userTypes"))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getInternalUserType() {
    return this.apiService
      .get(this.utility.getApiEndPointUrl("userTypes/internals"))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }
}

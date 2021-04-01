import { UserModel } from './../../user/models/user.model';
import { UtilityService } from './utility.service';
import { Injectable } from '@angular/core';

export interface menuAceess {
  displayMenu: string;
  action?: any[];
  children?: menuAceess[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  permissions: any; // Store the actions for which this user has permission
  actionAccessList: any;
  actionPermissions: any;
  userType: string;
  userPermissions: any = [];

  constructor(private utilityService: UtilityService) {
    let user: UserModel = this.utilityService.getUserPayload();
    this.userType = user.userType ? user.userType.name : null;

    this.actionPermissions = {
      SUPER_ADMIN: [
        {
          actionRoot: 'business',
          action: ['create', 'edit', 'status', 'user', 'bank']
        },
        {
          actionRoot: 'businessUser',
          action: ['create', 'edit', 'status']
        },
        {
          actionRoot: 'businessBank',
          action: ['create', 'edit']
        },
        {
          actionRoot: 'marketing',
          action: ['notification', 'sms', 'email']
        },
        {
          actionRoot: 'support',
          action: ['viewTicket', 'assign']
        },
        {
          actionRoot: 'customer',
          action: ['status']
        },
        {
          actionRoot: 'mangeBusiness',
          action: ['status', 'profile', 'reservation', 'foodMenu', 'layout', 'reviews', 'promotion']
        },
        {
          actionRoot: 'businessProfile',
          action: ['setting']
        },
        {
          actionRoot: 'reservation',
          action: ['viewOrderDetail']
        },
        {
          actionRoot: 'businessMenu',
          action: ['create', 'edit', 'status', 'addons']
        },
        {
          actionRoot: 'businessMenuAddons',
          action: ['create', 'edit', 'status']
        },
        {
          actionRoot: 'businessLayout',
          action: ['list']
        },
        {
          actionRoot: 'businessLayoutList',
          action: ['create', 'edit']
        },
        {
          actionRoot: 'user',
          action: ['create', 'edit', 'status']
        },
      ],
      ADMIN: [
        {
          actionRoot: 'business',
          action: ['create', 'edit', 'status', 'user', 'bank']
        },
        {
          actionRoot: 'businessUser',
          action: ['create', 'edit', 'status']
        },
        {
          actionRoot: 'businessBank',
          action: ['create', 'edit']
        },
        {
          actionRoot: 'marketing',
          action: ['notification', 'sms', 'email']
        },
        {
          actionRoot: 'support',
          action: ['viewTicket', 'assign']
        },
        {
          actionRoot: 'customer',
          action: ['status']
        },
        {
          actionRoot: 'mangeBusiness',
          action: ['status', 'profile', 'reservation', 'foodMenu', 'layout', 'reviews']
        },
        {
          actionRoot: 'businessProfile',
          action: ['setting']
        },
        {
          actionRoot: 'reservation',
          action: ['viewOrderDetail']
        },
        {
          actionRoot: 'businessMenu',
          action: ['create', 'edit', 'status', 'addons']
        },
        {
          actionRoot: 'businessMenuAddons',
          action: ['create', 'edit', 'status']
        },
        {
          actionRoot: 'businessLayout',
          action: ['list']
        },
        {
          actionRoot: 'businessLayoutList',
          action: ['create', 'edit']
        },
        {
          actionRoot: 'user',
          action: ['create', 'edit', 'status']
        },
      ],
      BUSINESS: [
        {
          actionRoot: 'business',
          action: ['create', 'edit', 'status', 'user', 'bank']
        },
        {
          actionRoot: 'businessUser',
          action: ['create', 'edit', 'status']
        },
        {
          actionRoot: 'businessBank',
          action: ['create', 'edit']
        },
        {
          actionRoot: 'marketing',
          action: ['notification', 'sms', 'email']
        },
        {
          actionRoot: 'support',
          action: ['viewTicket', 'assign']
        },
        {
          actionRoot: 'customer',
          action: ['status']
        },
        {
          actionRoot: 'mangeBusiness',
          action: ['status', 'profile', 'reservation', 'foodMenu', 'layout']
        },
        {
          actionRoot: 'businessProfile',
          action: ['setting']
        },
        {
          actionRoot: 'reservation',
          action: ['viewOrderDetail']
        },
        {
          actionRoot: 'businessMenu',
          action: ['create', 'edit', 'status', 'addons']
        },
        {
          actionRoot: 'businessMenuAddons',
          action: ['create', 'edit', 'status']
        },
        {
          actionRoot: 'businessLayout',
          action: ['list']
        },
        {
          actionRoot: 'businessLayoutList',
          action: ['create', 'edit']
        },
        {
          actionRoot: 'user',
          action: ['create', 'edit', 'status']
        },
      ],
      SALES: [
        {
          actionRoot: 'business',
          action: ['create', 'edit', 'status', 'user', 'bank']
        },
        {
          actionRoot: 'businessMenu',
          action: ['create', 'edit', 'status', 'addons']
        },
        {
          actionRoot: 'businessProfile',
          action: ['setting']
        },
        {
          actionRoot: 'mangeBusiness',
          action: ['profile', 'reservation', 'foodMenu', 'layout', 'reviews']
        }
      ],
      SALES_MANAGER: [
        {
          actionRoot: 'business',
          action: ['create', 'edit', 'status', 'user', 'bank']
        },
        {
          actionRoot: 'businessMenu',
          action: ['create', 'edit', 'status', 'addons']
        },
        {
          actionRoot: 'businessProfile',
          action: ['setting']
        },
        {
          actionRoot: 'mangeBusiness',
          action: ['status', 'profile', 'reservation', 'foodMenu', 'layout', 'reviews']
        }
      ],
      CUSTOMER_SUPPORT_MANAGER: [
        {
          actionRoot: 'support',
          action: ['viewTicket', 'assign']
        },
        {
          actionRoot: 'business',
          action: ['create', 'edit', 'status', 'user', 'bank']
        },
        {
          actionRoot: 'businessMenu',
          action: ['create', 'edit', 'status', 'addons']
        },
        {
          actionRoot: 'businessProfile',
          action: ['setting']
        },
        {
          actionRoot: 'mangeBusiness',
          action: ['status', 'profile', 'reservation', 'foodMenu', 'layout', 'reviews']
        }
      ],
      CUSTOMER_SUPPORT: [
        {
          actionRoot: 'support',
          action: ['viewTicket', 'assign']
        },
        {
          actionRoot: 'business',
          action: ['create', 'edit', 'status', 'user', 'bank']
        },
        {
          actionRoot: 'businessMenu',
          action: ['create', 'edit', 'status', 'addons']
        },
        {
          actionRoot: 'businessProfile',
          action: ['setting']
        },
        {
          actionRoot: 'mangeBusiness',
          action: ['status', 'profile', 'reservation', 'foodMenu', 'layout', 'reviews']
        }
      ]
    }
  }

  hasPermission(actionToPermit: string, actionRoot: string) {
    let userTypeKeys = Object.keys(this.actionPermissions);
    userTypeKeys.forEach(key => {
      if (key == this.userType) {
        this.userPermissions = this.actionPermissions[key];
      }
    });

    if (this.userPermissions) {
      this.permissions = {};
      this.permissions = this.userPermissions.find(permission => {
        if (permission.actionRoot == actionRoot) {
          return permission;
        }
      });
    }
    if (this.permissions && this.permissions.action.find(item => { return item === actionToPermit; })) {
      return true;
    }
    else {
      return false;
    }
  }
}

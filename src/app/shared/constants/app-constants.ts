export class AppConstants {
  public static readonly CURRENT_USER = "currentUser";
  public static readonly TOKEN = "token";
  public static readonly BUSINESS_ID = "businessId";
  public static readonly BUSINESS_USER = "businessUser";
  public static readonly USER_TYPE = "userType";
  public static readonly INTERNAL_USER = "internalUser";
  public static readonly FOOD_MENU_ID = "foodMenuId";
  public static readonly TICKET_REF_ID = "ticketRefId";
  public static readonly PREFEEX = "Prefeex LTD.";
  public static readonly INTERNAL = "INTERNAL";
  public static readonly BUSINESS = "BUSINESS";
  public static readonly SEARCH_OBJ = "SearchObj";
  public static readonly END_USER = "END_USER";

  static startTimeInMillis(date) {
    // TODO: date type validation
    const millisInADay = 1000 * 3600 * 24;
    const millis = date.getTime();
    return millis - (millis % millisInADay);
  }

  static startTimeInDate(date) {
    // TODO: Date type validation
    return new Date(AppConstants.startTimeInMillis(date));
  }

  static createSortedString(keyString: string, sortingColumnArr: string[], sortingObj: any) {
    // Start from blank string
    let sortedString: string = "";
    // Get index
    let index = sortingColumnArr.findIndex(val => val === keyString);
    // Get 0 index
    let firstValueSortingArray = sortingColumnArr[0];

    // Delete item by which we want to sort
    sortingColumnArr.splice(index, 1);

    // Insert item in first position to get expected sortingColumnArr
    sortingColumnArr.splice(0, 0, firstValueSortingArray);


    // Create and update True and false value on sorting array default value.
    for (let key of Object.keys(sortingObj)) {
      if (key === keyString) {
        sortingObj[key] = !sortingObj[key];
      }
    }

    // Create final sort sting .
    sortingColumnArr.forEach(item => {
      sortedString += `${item}:${sortingObj[item] ? "asc" : "desc"},`;
    });

    return sortedString;
  }

  /**
   * validate an email address in JavaScript
   * basic email address structure, _@_._.
   * emailIsValid('tyler@tyler@tylermcginnis.com') // false
   * emailIsValid('tyler@tylermcginnis.com') // true
   */

  static emailIsValid(email: string) {
    let result = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return result;
  }

  static phoneIsValid(phone: string) {
    let result = /^\d{0,15}$/.test(phone);
    return result;
  }

  static checkValueIsNumberAndPositive(value: any) {
    value = Number(value ? value : 0);
    if (value > 0) {
      return true;
    } else {
      return false;
    }
  }

}

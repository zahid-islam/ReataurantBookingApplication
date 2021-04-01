import { AppConstants } from "../constants/app-constants";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";

import { ApiService } from "./api.service";
import { UtilityService } from "./utility.service";

@Injectable({
  providedIn: "root"
})
export class SharedDataService {
  private messageSource = new BehaviorSubject([]);
  subscribingData = this.messageSource.asObservable();

  constructor(
    private utilityService: UtilityService,
    private apiService: ApiService
  ) { }

  changeId(id: number) {
    if (id > 0) {
      localStorage.setItem(AppConstants.BUSINESS_ID, id.toString());
    }
  }

  setCurrentSelectedNotifiedIds(ids: any) {
    if (ids.length > 0) {
      this.messageSource.next(ids);
    }
  }

  setMenuId(id: number) {
    if (id > 0) {
      localStorage.setItem(AppConstants.FOOD_MENU_ID, id.toString());
    }
  }

  changeBusinessUser(businessUser: any) {
    if (businessUser) {
      localStorage.setItem(
        AppConstants.BUSINESS_USER,
        JSON.stringify(businessUser)
      );
    }
  }

  getBusinessIdFromUrl(path: string) {
    let businessId = 0;
    let splitArray = path.split("/");
    let index = splitArray.findIndex(x => x == "manage-business");
    if (index != -1) {
      businessId = Number(splitArray[index + 1]);
    }
    return businessId;
  }

  getFillPathIDList(fullpath) {
    const regex = /\/\d+/g;
    let allID: number[] = [];
    const fullPath = fullpath;
    allID = fullPath.match(regex).map(str => parseInt(str.substr(1), 10));
    if (allID.length) {
      return allID;
    }
  }

  changeInternalUser(internalUser: any) {
    if (internalUser) {
      localStorage.setItem(
        AppConstants.INTERNAL_USER,
        JSON.stringify(internalUser)
      );
    }
  }

  capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  ucFirstAllWords(str: string) {
    let pieces = str.toLocaleLowerCase().split(" ");
    for (var i = 0; i < pieces.length; i++) {
      let j = pieces[i].charAt(0).toUpperCase();
      pieces[i] = j + pieces[i].substr(1);
    }
    return pieces.join(" ");
  }

  replaceUnderscoreAndFirstLetterCapital(str: string) {
    return str
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b[a-z]/g, letter => {
        return letter.toUpperCase();
      });
  }

  replaceUnderscoreWithSpace(str: string) {
    if (str) {
      return str.replace(/_/g, " ");
    }
    else {
      return null;
    }
  }

  uploadMultipleImages(formData: any) {
    return this.apiService
      .post(this.utilityService.getApiEndPointUrl("upload"), formData)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getSvg(url: string) {
    return this.apiService.getSvgFile(url).pipe(
      map((response: any) => {
        return response;
      })
    );
  }
}

import {
  RefundPolicy,
  CreateAppVersioning,
  UpdateAppVersioningStatus
} from "./../models/setting.model";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { HttpParams } from "@angular/common/http";
import { ApiService } from "../../shared/services/api.service";
import { UtilityService } from "../../shared/services/utility.service";
import {
  CreateTags,
  CreateFacilities,
  CreateEmailTemplate,
  UpdateEmailTemplate,
  CreateFacilityGroup,
  BusinessClassificationsModel
} from "../models/setting.model";
import { CommonType } from "src/app/shared/models/common.model";

@Injectable({
  providedIn: "root"
})
export class SettingService {
  constructor(
    private utilityService: UtilityService,
    private apiService: ApiService
  ) {}

  /**
   * ------------------------- Tags CRUD & Other Methods -----------------
   *
   */
  getAllTagStatuses() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`tags/statuses`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getAllTags(offset: string, limit: string) {
    let params = new HttpParams().set("offset", offset).set("limit", limit);
    return this.apiService
      .getWithParam(this.utilityService.getApiEndPointUrl(`tags`), params)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  createNewTag(tags: CreateTags) {
    return this.apiService
      .post(this.utilityService.getApiEndPointUrl(`tags`), tags)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  updateTag(tags: any, tagId: number) {
    return this.apiService
      .put(this.utilityService.getApiEndPointUrl(`tags/${tagId}`), tags)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  updateTagsEntity(status: any, tagId: number) {
    return this.apiService
      .put(this.utilityService.getApiEndPointUrl(`tags/${tagId}`), status)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getParticularTag(tagId: number) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`tags/${tagId}`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  /**
   * ------------------- Facilities CRUD & Other Methods  ---------------------------
   */

  getAllFacilityStatuses() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl("facilities/statuses"))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getAllFacilities(offset: string, limit: string) {
    let params = new HttpParams().set("offset", offset).set("limit", limit);
    return this.apiService
      .getWithParam(this.utilityService.getApiEndPointUrl("facilities"), params)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  createNewFacility(facilities: CreateFacilities) {
    return this.apiService
      .post(this.utilityService.getApiEndPointUrl(`facilities`), facilities)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  updateFacility(facilitId: number, facilities: any) {
    return this.apiService
      .put(
        this.utilityService.getApiEndPointUrl(`facilities/${facilitId}`),
        facilities
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getParticularFacility(facilityId: number) {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`facilities/${facilityId}`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  /**
   * ------------------- Facility Group CRUD & Other Methods  ---------------------------
   */

  getAllFacilityGroupStatuses() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl("facilities/groups/statuses"))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getAllFacilityGroup(
    offset: string,
    limit: string,
    status?: string,
    paginate?: string
  ) {
    let params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("status", status)
      .set("paginate", paginate);
    return this.apiService
      .getWithParam(
        this.utilityService.getApiEndPointUrl("facilities/groups"),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  createNewFacilityGroup(facilityGroup: CreateFacilityGroup) {
    return this.apiService
      .post(
        this.utilityService.getApiEndPointUrl("facilities/groups"),
        facilityGroup
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  updateFacilityGroup(facilityGroupId: number, facilityGroup: any) {
    return this.apiService
      .put(
        this.utilityService.getApiEndPointUrl(
          `facilities/groups/${facilityGroupId}`
        ),
        facilityGroup
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getParticularFacilityGroup(facilityId: number) {
    return this.apiService
      .get(
        this.utilityService.getApiEndPointUrl(`facilities/groups/${facilityId}`)
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  /**
   *  ------------------- Email CRUD & Other Methods  ---------------------------
   */

  getTemplateTypes() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`emails/templates/types`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getEmailTemplateVariables() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`emails/templates/variables`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getEmailTemplates(offset: string, limit: string) {
    let params = new HttpParams().set("offset", offset).set("limit", limit);
    return this.apiService
      .getWithParam(
        this.utilityService.getApiEndPointUrl(`emails/templates`),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getParticularEmailTemplate(templatesId: number) {
    return this.apiService
      .get(
        this.utilityService.getApiEndPointUrl(`emails/templates/${templatesId}`)
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  createEmailTemplate(templates: CreateEmailTemplate) {
    return this.apiService
      .post(
        this.utilityService.getApiEndPointUrl(`emails/templates`),
        templates
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  updateEmailTemplate(
    updateTemplates: UpdateEmailTemplate,
    templatesId: number
  ) {
    return this.apiService
      .put(
        this.utilityService.getApiEndPointUrl(
          `emails/templates/${templatesId}`
        ),
        updateTemplates
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  /**
   *  ------------------- Refund Policy CRUD   ---------------------------
   */

  createNewRefundPolicy(refundPpolicy: RefundPolicy) {
    return this.apiService
      .post(
        this.utilityService.getApiEndPointUrl("refundpolicies"),
        refundPpolicy
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getActiveRefundPolicy() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`refundpolicies/active`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getRefundPolicyList(offset: string, limit: string) {
    let params = new HttpParams().set("offset", offset).set("limit", limit);
    return this.apiService
      .getWithParam(
        this.utilityService.getApiEndPointUrl(`refundpolicies`),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getParticularRefundPolicy(refundPolicieId: number) {
    return this.apiService
      .get(
        this.utilityService.getApiEndPointUrl(
          `refundpolicies/${refundPolicieId}`
        )
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  /**
   *  ------------------- SMS Gateway   ---------------------------
   */

  getSMSGatewayBalance() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl(`smsgatewaybalance`))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  /**
   *  ------------------- Business Classification   ---------------------------
   */

  getClassifications(
    offset: string,
    limit: string,
    status?: string,
    paginate?: string
  ) {
    const params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("status", status)
      .set("paginate", paginate);

    return this.apiService
      .getWithParam(
        this.utilityService.getApiEndPointUrl("classifications"),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getClassificationStatuses() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl("classifications/statuses"))
      .pipe(
        map((response: CommonType[]) => {
          return response;
        })
      );
  }

  createClassification(
    businessClassificationsModel: BusinessClassificationsModel
  ) {
    return this.apiService
      .post(
        this.utilityService.getApiEndPointUrl(`classifications`),
        businessClassificationsModel
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  updateClassification(
    classificationID: number,
    updateClassificationsModel: BusinessClassificationsModel
  ) {
    return this.apiService
      .put(
        this.utilityService.getApiEndPointUrl(
          `classifications/${classificationID}`
        ),
        updateClassificationsModel
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }
  /*
   *  ------------------- App Versioning   ---------------------------
   */

  getAllAppVersioning(
    offset: string,
    limit: string,
    status?: string,
    clientPlatform?: string,
    sort?: string,
    forced?: any
  ) {
    let params = new HttpParams()
      .set("offset", offset)
      .set("limit", limit)
      .set("status", status)
      .set("clientPlatform", clientPlatform)
      .set("sort", sort)
      .set("forced", forced);

    return this.apiService
      .getWithParam(
        this.utilityService.getApiEndPointUrl("appversioning"),
        params
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  getAllAppVersioningStatuses() {
    return this.apiService
      .get(this.utilityService.getApiEndPointUrl("appversioning/statuses"))
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  createAppVersioning(appVersioning: CreateAppVersioning) {
    return this.apiService
      .post(
        this.utilityService.getApiEndPointUrl(`appversioning`),
        appVersioning
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  updateAppVersioningStatus(
    appVersioningID: number,
    updateAppVersioningStatus: UpdateAppVersioningStatus
  ) {
    return this.apiService
      .put(
        this.utilityService.getApiEndPointUrl(
          `appversioning/${appVersioningID}`
        ),
        updateAppVersioningStatus
      )
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }
}

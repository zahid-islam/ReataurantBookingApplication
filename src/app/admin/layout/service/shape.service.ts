import { RectangleComponent } from './../components/rectangle/rectangle.component';
import { ApiService } from './../../../shared/services/api.service';
import { UtilityService } from './../../../shared/services/utility.service';
import { Injectable } from '@angular/core';
import { ShapeComponent } from '../components/shape/shape.component';
import { HttpClient, HttpParams } from "@angular/common/http";
import { FloorPlan, UpdateFloorPlan } from '../model/shape';
import { map } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class ShapeService {

    public shapesComponents: RectangleComponent[] = [];

    private selectedComponent: ShapeComponent;

    constructor(private _http: HttpClient, private utilityService: UtilityService,
        private apiService: ApiService) {
    }

    getShapeComponents(): ShapeComponent[] {
        return this.shapesComponents;
    }

    removeAllShapeComponents(): void {
        this.shapesComponents = [];
    }

    setShapeComponent(component: RectangleComponent): void {
        this.selectedComponent = component;
        this.shapesComponents.push(component);
    }

    setMultipleShapes(shapes: ShapeComponent[]): void {
        // used apply() to add all elements of a second array.
        this.shapesComponents.push.apply(this.shapesComponents, shapes);
    }
    getShapeComponent(): ShapeComponent {
        return this.selectedComponent;
    }

    findShapeComponent(name: string): RectangleComponent {
        return this.shapesComponents.find(x => x.shape.shapeProperties.name == name);
    }

    submitFloorPlan(floorPlan: FloorPlan, businessId: number) { // Dynamic endpoint
        return this.apiService
            .post(this.utilityService.resolvedEndPoint.submitFloorPlan(businessId), floorPlan)
            .pipe(
                map((response: any) => {
                    return response;
                })
            );
    }

    updateFloorPlan(updateFloorPlan: UpdateFloorPlan, businessId: number, floorId: number) { // Dynamic endpoint
        return this.apiService
            .put(this.utilityService.resolvedEndPoint.updateFloorPlan(businessId, floorId), updateFloorPlan)
            .pipe(
                map((response: any) => {
                    return response;
                })
            );
    }

    deleteTablesFromFloorPlan(updateFloorPlan: any, businessId: number, floorId: number) { // Dynamic endpoint
        return this.apiService
            .put(this.utilityService.resolvedEndPoint.deleteTablesFromFloorPlan(businessId, floorId), updateFloorPlan)
            .pipe(
                map((response: any) => {
                    return response;
                })
            );
    }

    // Dynamic endpoint
    updateBusinessFloorPlanStatuses(updateFloorPlan: any, businessId: number, floorId: number) {
        return this.apiService
            .put(this.utilityService.resolvedEndPoint.updateBusinessFloorPlanStatuses(businessId, floorId), updateFloorPlan)
            .pipe(
                map((response: any) => {
                    return response;
                })
            );
    }

    getAllFloorPlanUnderBusiness(businessId: number) { // Dynamic endpoint
        return this.apiService
            .get(this.utilityService.resolvedEndPoint.getAllFloorPlanUnderBusiness(businessId))
            .pipe(
                map((response: any) => {
                    return response.body.data;
                })
            );
    }

    getFloorPlanStatuses() {
        return this.apiService
            .get(this.utilityService.getApiEndPointUrl(`businesses/floorplanstatuses`))
            .pipe(
                map((response: any) => {
                    return response;
                })
            );
    }

    getFloorPlanById(businessId: number, floorId: number) { // Dynamic endpoint
        return this.apiService
            .get(this.utilityService.resolvedEndPoint.getFloorPlanById(businessId, floorId))
            .pipe(
                map((response: any) => {
                    return response.body.data;
                })
            );
    }

    // Dynamic endpoint
    getOrderPaginatedlyUnderTable(offset: string, limit: string,
        businessId: number, floorPlanId: number, tableId: number,
        afterDate?: string, beforeDate?: string) {
        let params = new HttpParams().set("offset", offset).set("limit", limit)
            .set("beforeDate", beforeDate)
            .set("afterDate", afterDate);
        return this.apiService
            .getWithParam(this.utilityService.resolvedEndPoint.getOrderPaginatedlyUnderTable(businessId, floorPlanId, tableId), params)
            .pipe(
                map((response: any) => {
                    return response;
                })
            );
    }

    getMaxSvgIdUnderFloorPlan(businessId: number, floorId: number) { // Dynamic endpoint
        return this.apiService
            .get(this.utilityService.resolvedEndPoint.getMaxSvgIdUnderFloorPlan(businessId, floorId))
            .pipe(
                map((response: any) => {
                    return response.body.data;
                })
            );
    }
}

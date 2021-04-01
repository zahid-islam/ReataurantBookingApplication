import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Shape, MousePosition } from '../../model/shape';
import { ShapeType } from '../../model/shape-types';

import { Field } from 'dynaform';

@Component({
    selector: 'app-shape',
    templateUrl: './shape.component.html',
    styleUrls: ['./shape.component.css']
})
export class ShapeComponent implements OnInit {

    @ViewChild('shapeTemplate', { static: true }) shapeTemplate: TemplateRef<any>;

    formFields: Field[] = [];

    public shape: Shape;
    shapeType: ShapeType;
    offset: MousePosition;
    isSelected: boolean = false;
    selectionPoints: MousePosition[] = [];

    constructor() {
    }

    ngOnInit() {
    }

    getFormFields(): Field[] {
        return this.formFields;
    }

    updateShapeProperties(value: any) {
    }

    startDrawing(beginPosition: MousePosition): void {
    }

    endDrawing(): void {
    }

    draw(currentPosition: MousePosition): void {
    }

    setPoint(point: MousePosition): void {
    }

    drag(draqPosition: MousePosition): void {
        if (this.offset == undefined) {
            this.offset = Object.assign({}, draqPosition);
            this.offset.x -= this.shape.originX;
            this.offset.y -= this.shape.originY;
        }
        this.shape.originX = (draqPosition.x - this.offset.x);
        this.shape.originY = (draqPosition.y - this.offset.y);

        // this.shape.originX = draqPosition.x;
        // this.shape.originY = draqPosition.y;
    }

    resizeShape(resizePosition: MousePosition) {
    }

}

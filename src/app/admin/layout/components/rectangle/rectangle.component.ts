import { Component, OnInit } from '@angular/core';
import { ShapeComponent } from '../shape/shape.component';
import { ShapeType } from '../../model/shape-types';
import { MousePosition, Rectangle } from '../../model/shape';

import { Field } from 'dynaform';

@Component({
    selector: 'app-rectangle',
    templateUrl: './rectangle.component.html',
    styleUrls: ['./rectangle.component.css']
})
export class RectangleComponent extends ShapeComponent implements OnInit {
    shape: Rectangle;

    value: string = `M55.2171 19.9639H48.7677V9.21074H37.0175L37.0617 2.86458V0.0440705H34.2346L24.4722 0H21.6451V2.82051L21.6009 
    9.21074H9.8949V19.9639H2.82711H0V22.7845V32.524V35.3445H2.82711H9.8949V46.0978H21.6009V52.1795V55H24.428H34.1904H37.0175V52.1795V46.0978H48.7235V35.3445H55.1729H58V32.524V22.7845V19.9639H55.2171V19.9639ZM9.8949 
    32.524H2.82711V22.7845H9.8949V32.524ZM24.428 2.82051L34.1904 2.86458L34.1462 9.21074H24.3839L24.428 
    2.82051ZM34.1904 52.1795H24.428V46.0978H34.1904V52.1795ZM44.7037 41.6026H14.4448V13.6178H43.7319V14.0585H14.8865V41.2059H44.262V13.8381H44.7037V41.6026ZM55.2171 
    32.524H48.7677V22.7845H55.2171V32.524Z`;

    primaryId: number = 0;

    fillColor: string = '';
    isValid: boolean = false;

    formFields: Field[] = [
        {
            name: 'details',
            label: 'Details:',
            type: 'input',
            inputType: 'text',
            value: ''
        },
        {
            name: 'capacity',
            label: 'Capacity:',
            type: 'input',
            inputType: 'number',
            value: ''
        },
        {
            name: 'range',
            label: 'Range:',
            type: 'input',
            inputType: 'range',
            value: 1
        },
        {
            name: 'tableNo',
            label: 'Table No:',
            type: 'input',
            inputType: 'number',
            value: ''
        }
    ];

    constructor() {
        super();
        this.shape = new Rectangle();
        this.shapeType = ShapeType.Rectangle;
    }

    ngOnInit() {
    }

    setStyles() {
        let styles = {
            'stroke': this.shape.shapeProperties.strokeColor,
            'fill': this.fillColor ? this.fillColor : this.shape.shapeProperties.fillColor,
            'stroke-width': this.shape.shapeProperties.strokeWidth
        };
        return styles;
    }

    startDrawing(beginPosition: MousePosition): void {
        if (this.shape instanceof Rectangle) {
            this.shape.originX = beginPosition.x;
            this.shape.originY = beginPosition.y;
        }
    }

    draw(currentPosition: MousePosition): void {
        if (this.shape instanceof Rectangle) {
            this.shape.width = Math.abs(currentPosition.x - this.shape.originX);
            this.shape.height = Math.abs(currentPosition.y - this.shape.originY);
        }
    }

}

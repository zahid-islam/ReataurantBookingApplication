import { Directive, Input, ViewContainerRef, OnInit } from '@angular/core';
import { ShapeComponent } from '../components/shape/shape.component';
import { ShapeService } from '../service/shape.service';

@Directive({
    selector: '[dynamic-svg]'
})
export class DynamicSvgDirective {

    @Input() component: ShapeComponent;

    constructor(private viewContainerRef: ViewContainerRef, private shapeService: ShapeService) {
    }

    ngOnInit() {
        this.viewContainerRef.createEmbeddedView(this.component.shapeTemplate);
    }

    ngOnDestroy() {
        this.viewContainerRef.clear();
    }
}

import { Directive, Input, ElementRef } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';

@Directive({
    selector: '[confirmLayoutValidator]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: LayoutValidatorDirective,
        multi: true
    }]
})
export class LayoutValidatorDirective implements Validator {
    @Input() confirmLayoutValidator: any;

    constructor(private element: ElementRef) { }

    validate(control: AbstractControl): { [key: string]: any } | null {
        let val = control.value;
        if (val.details || val.capacity) {
            if (val.details && val.capacity) {
                const event = new CustomEvent('fireLayoutDataSendingEvent', {
                    detail: true,
                    bubbles: true,
                    cancelable: true,
                });

                this.element.nativeElement.dispatchEvent(event);
            }
            else {
                const event = new CustomEvent('fireLayoutDataSendingEvent', {
                    detail: false,
                    bubbles: true,
                    cancelable: true,
                });

                this.element.nativeElement.dispatchEvent(event);
            }
        }
        return null;
    }
}
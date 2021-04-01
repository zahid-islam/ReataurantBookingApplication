import { Directive, Input } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';

@Directive({
    selector: '[confirmEqualValidator]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: EqualValidatorDirective,
        multi: true
    }]
})
export class EqualValidatorDirective implements Validator {
    @Input() confirmEqualValidator: string;

    validate(control: AbstractControl): { [key: string]: any } | null {
        const controlToCompare = control.parent.get(this.confirmEqualValidator);

        if (controlToCompare && controlToCompare.value !== control.value) {
            return { 'notEqual': true }
        }
        return null;
    }
}
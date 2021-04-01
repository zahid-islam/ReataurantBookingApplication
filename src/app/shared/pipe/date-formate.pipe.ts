import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
    name: 'dateformate'
})
export class DateFormatePipe implements PipeTransform {

    constructor() { }

    transform(date: Date | string): Date | string {
        let resultString: string;
        let incomingDate = new Date(date);
        let compareDate = new Date(date).setHours(0, 0, 0, 0);

        let today = new Date().setHours(0, 0, 0, 0);

        let nxtDay = new Date().setDate(new Date().getDate() + 1);
        let tomorrow = new Date(nxtDay).setHours(0, 0, 0, 0);

        let prevDay = new Date().setDate(new Date().getDate() - 1);
        let yesterday = new Date(prevDay).setHours(0, 0, 0, 0);

        if (compareDate == today) {
            resultString = 'Today ' + incomingDate.toLocaleTimeString();
        }
        else if (compareDate == tomorrow) {
            resultString = 'Tomorrow ' + incomingDate.toLocaleTimeString();
        }
        else if (compareDate == yesterday) {
            resultString = 'Yesterday ' + incomingDate.toLocaleTimeString();
        }
        else {
            resultString = null;
        }
        
        return resultString ? resultString : new DatePipe('en-US').transform(date, 'MMM d, y h:mm a');
    }

}
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-contextmenu',
  templateUrl: './contextmenu.component.html',
  styleUrls: ['./contextmenu.component.scss']
})
export class ContextmenuComponent implements OnInit {

  @Input() xCoordinate = 0;
  @Input() yCoordinate = 0;
  @Input() context = false;
  @Output() upcomingReservation = new EventEmitter();
  @Output() historyReservation = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

  pendingReservation() {
    let afterDate = new Date().getTime();
    this.upcomingReservation.emit(afterDate);
  }

  previousReservation() {
    let beforeDate = new Date().getTime();
    this.historyReservation.emit(beforeDate);
  }

}

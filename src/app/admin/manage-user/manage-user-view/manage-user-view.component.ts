import { Component, OnInit } from '@angular/core';
import { AppConstants } from 'src/app/shared/constants/app-constants';

@Component({
  selector: 'app-manage-user-view',
  templateUrl: './manage-user-view.component.html',
  styleUrls: ['./manage-user-view.component.scss']
})
export class ManageUserViewComponent implements OnInit {

  internalUser: any = {};

  constructor() { }

  ngOnInit() {
    this.internalUser = history.state.data;
  }


}

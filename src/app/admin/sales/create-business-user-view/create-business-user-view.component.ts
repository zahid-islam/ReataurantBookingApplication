import { AppConstants } from './../../../shared/constants/app-constants';
import { Component, OnInit } from '@angular/core';
import { UserModel } from 'src/app/user/models/user.model';

@Component({
  selector: 'app-create-business-user-view',
  templateUrl: './create-business-user-view.component.html',
})
export class CreateBusinessUserViewComponent implements OnInit {
  businessUser: UserModel = new UserModel();
  constructor() { }

  ngOnInit() {
    this.businessUser = history.state.data;
  }

}

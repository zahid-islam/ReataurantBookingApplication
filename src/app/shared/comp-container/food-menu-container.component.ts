import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-food-menu-container',
  template: `
  <router-outlet></router-outlet>
  `
})
export class FoodMenuContainerComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

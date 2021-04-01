import { Component, OnInit, Input } from '@angular/core';
@Component({
  selector: 'app-content-loader',
  templateUrl: './content-loader.component.html',
  styles: []
})
export class ContentLoaderComponent implements OnInit {
  @Input() theadcount: number = 0;
  @Input() rowlength?: any;
  public countvalue: number[] = [];
  public rowLengthArray: number[] = [];
  public fractionValue: any;
  constructor() { }
  ngOnInit() {

    this.fractionValue = `${(100/this.theadcount)-1}%`;
    this.countvalue = this.generateEffect(this.theadcount);
    this.rowLengthArray = this.generateEffect(this.rowlength);

  }
  private generateEffect(arrayLenght) {
    let elementarra = [];
    if (arrayLenght) {
      for (let index = 0; index < arrayLenght; index++) {
        elementarra[index] = index;
      }
      return elementarra;
    }
  }

  ngOnDestroy(): void {

  }

}

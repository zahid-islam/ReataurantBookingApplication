import { ToastrManager } from 'ng6-toastr-notifications';
import { SharedDataService } from './../../shared/services/shared-data.service';
import { FormGroup } from '@angular/forms';
import {
  Component, ContentChild, TemplateRef, ElementRef, OnInit, OnChanges, ComponentFactoryResolver,
  ViewContainerRef, Injector, ViewChild, HostListener
} from '@angular/core';

import { ShapeComponent } from './components/shape/shape.component';
import { ShapeProperties, MousePosition, FloorPlan, TableCollection, UpdateFloorPlan } from './model/shape';
import { ShapeType, ToolType, TableType, TableDeleteModel } from './model/shape-types';
import { ShapeService } from './service/shape.service';
import { RectangleComponent } from './components/rectangle/rectangle.component';
import { PlatformLocation } from '@angular/common';

import { Field } from 'dynaform';
import { Router, ActivatedRoute, ParamMap } from "@angular/router";
declare var jQuery: any;

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  title = 'SVG Drawing Tool';
  data: any = {};
  isSubmit: boolean;
  isLoading: boolean;
  @ViewChild('photo', { static: false }) photo: ElementRef;
  @ViewChild('properties', { static: false }) properties: ElementRef;
  @ViewChild('propertiesAnchor', { static: false }) propertiesAnchor: ElementRef;
  @ViewChild('alertModal', { static: false }) alertModal: ElementRef;

  svg: any;
  currentPosition: MousePosition = new MousePosition();
  currentPositionSet: MousePosition = new MousePosition();

  shapeProperties: ShapeProperties = new ShapeProperties();

  selectedShape: ShapeType;
  selectedTable: TableType;
  shapeValue: string;

  selectedTool: ToolType;

  selectedComponent: RectangleComponent;
  regex: any = /^table/;

  isDragging: boolean = false;
  isDrawing: boolean = false;
  isResizing: boolean = false;
  isSelectingPoints: boolean = false;

  formFields: Field[] = [];

  scale: number = 1;
  fileData: File = null;
  imagePath: any;

  public myForm: FormGroup;

  insertedSVG: string;
  floorPlan: FloorPlan = new FloorPlan();
  updateFloorPlan: UpdateFloorPlan = new UpdateFloorPlan();
  businessId: number;
  floorId: number = null;
  showTableFormDialog: boolean = false; // for showing dialog.

  selectedTableIdForDelete: any = null;
  tableDeleteModel: TableDeleteModel = new TableDeleteModel();
  action: string;
  formData: any = null;
  maxSvgId: number = 0;

  @ContentChild(TemplateRef, { static: true }) shapeTemplate: TemplateRef<any>;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
    private viewContainerRef: ViewContainerRef,
    public shapeService: ShapeService,
    private sharedDataService: SharedDataService,
    private toastr: ToastrManager,
    private router: Router,
    private route: ActivatedRoute,
    private platformLocation: PlatformLocation) {
  }

  ngOnInit(): void {
    this.isSubmit = false;
    this.isLoading = false;

    const fullPath = this.platformLocation.href;
    let pathIdList = this.sharedDataService.getFillPathIDList(fullPath);
    if (pathIdList.length) {
      this.businessId = pathIdList[0];
    }
    this.clearShapes();

    this.svg = document.querySelector('svg');
    this.selectedShape = ShapeType.NoShape;

    this.route.paramMap
      .subscribe((params: ParamMap) => {
        let getRouteByData = this.route.snapshot.params['data'];

        let decodedRoute = atob(getRouteByData);
        let parsedRouteData = JSON.parse(decodedRoute);

        this.floorId = parsedRouteData.floorId ? parsedRouteData.floorId : null;
        this.action = parsedRouteData.action;
        if (this.floorId) {
          this.getFloorPlanById();
          this.getMaxSvgIdUnderFloorPlan();
        }
      });
  }

  getMaxSvgIdUnderFloorPlan() {
    this.shapeService.getMaxSvgIdUnderFloorPlan(this.businessId, this.floorId).subscribe(
      (res: any) => {
        let maxSvgId = res.maxSVGId ? res.maxSVGId : null;
        let maxTableNo = (maxSvgId).match(/\d+/g);
        if (maxTableNo && maxTableNo[0]) {
          this.maxSvgId = Number(maxTableNo[0]);
        }
      },
      err => {
        this.toastr.errorToastr(err);
      }
    );
  }

  addCollapse() {
    this.properties.nativeElement.classList.add("collapse");
    this.propertiesAnchor.nativeElement.classList.add("collapsed");
  }

  removeCollapse() {
    this.properties.nativeElement.classList.remove("collapse");
    this.propertiesAnchor.nativeElement.classList.remove("collapsed");
  }

  openPropertiesToggle() {
    if (this.properties.nativeElement.classList.length == 1) {
      this.addCollapse();
    }
    else {
      this.removeCollapse();
    }
  }

  getFloorPlanById() {
    this.shapeService.getFloorPlanById(this.businessId, this.floorId).subscribe(
      (res: any) => {
        this.floorPlan.tableInfos = [];
        this.floorPlan.newTableInfos = [];
        if (res.floorPlan) {
          this.floorPlan.id = res.floorPlan.id;
          this.floorPlan.floor = res.floorPlan.floorName;
          this.floorPlan.svg = res.floorPlan.svgUrl;
        }

        if (res.floorPlan.floorPlanTables.length) {
          let tables = res.floorPlan.floorPlanTables;
          tables.forEach(item => {
            let tableCollection: TableCollection = {} as TableCollection;
            tableCollection.svgId = item.svgId;
            tableCollection.capacity = item.capacity;
            tableCollection.details = item.details;
            tableCollection.id = item.id;
            this.floorPlan.tableInfos.push(tableCollection);
          });
        }

        if (this.floorPlan) {
          this.downlaodFloor();
        }
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      }
    );
  }

  downlaodFloor() {
    this.isLoading = true;
    this.sharedDataService.getSvg(this.floorPlan.svg).subscribe(
      (res: any) => {
        this.insertedSVG = res.body;

        if (this.insertedSVG) {
          this.loadSVG(this.insertedSVG);
        }
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  @HostListener('fireLayoutDataSendingEvent', ['$event'])
  onfireLayoutDataSendingEvent(event: CustomEvent) {
    if (!event.detail) {
      this.selectedComponent.fillColor = '#dc3545';
      this.selectedComponent.isValid = false;
      this.selectedComponent.setStyles();
    }
    else {
      this.selectedComponent.fillColor = '';
      this.selectedComponent.isValid = true;
      this.selectedComponent.setStyles();
    }
  }

  clearLayout(identifier?: string): void {
    if (this.properties.nativeElement.classList.length == 1) {
      this.addCollapse();
    }
    this.shapeService.removeAllShapeComponents();
    this.selectedShape = ShapeType.NoShape;
    this.shapeValue = ShapeType[this.selectedShape];
    this.formFields = [];

    let layoutElement = document.querySelector("svg");
    var child = layoutElement.lastElementChild;
    while (child) {
      layoutElement.removeChild(child);
      child = layoutElement.lastElementChild;
    }

    if (identifier) {
      this.photo.nativeElement.value = "";
    }
  }

  removeTableFromLayout() {
    let index = this.shapeService.shapesComponents.indexOf(this.selectedComponent);
    if (this.regex.test(this.selectedTableIdForDelete) && index !== -1) {
      if (this.selectedComponent.primaryId) {
        this.tableDeleteModel.tableIds.push(this.selectedComponent.primaryId);
        let elem = document.getElementById(this.selectedTableIdForDelete) as HTMLElement;
        elem.parentNode.removeChild(elem);
        this.shapeService.shapesComponents.splice(index, 1);
        this.toastr.successToastr('Table removed and need to update.');
      }
    }
  }

  deleteFloorTable() {
    if (this.tableDeleteModel.tableIds.length) {
      this.sharedDataService.uploadMultipleImages(this.formData).subscribe(
        (res: any) => {
          this.tableDeleteModel.svg = res.body.data.results[0].Location;
          this.shapeService.deleteTablesFromFloorPlan(this.tableDeleteModel, this.businessId, this.floorId).subscribe(
            (res: any) => {
              this.tableDeleteModel.tableIds = [];
              this.getFloorPlanById();
              this.toastr.successToastr(res.body.message.en);
            },
            err => {
              this.isSubmit = false;
              this.toastr.errorToastr(err.error.message.en);
            }
          );
        },
        err => {
          this.toastr.errorToastr(err.error.message.en);
          this.isSubmit = false;
        },
        () => {
          this.isSubmit = false;
        }
      );
    }
    else {
      this.isSubmit = false;
      this.toastr.infoToastr('There is no table to delete');
    }
  }

  appendSvgIntoFormData() {
    this.formData = null;
    this.formData = new FormData();
    let svgFinalLayout = document.getElementsByTagName("svg")[0].outerHTML;
    let curTimeStamp = new Date().getTime();
    var file = new File([svgFinalLayout], `${curTimeStamp}.svg`, {
      type: "image/svg+xml",
    });
    this.formData.append('files', file);
  }

  saveLayout() {
    //used for save spinning
    this.isSubmit = true;
    this.appendSvgIntoFormData();

    if (this.action === 'edit') {//Update portion
      let tableCount = 0;
      let allTableForm: TableCollection[] = [];
      this.shapeService.shapesComponents.forEach(item => {
        tableCount = item.shape.shapeProperties.isTable ? (tableCount + 1) : tableCount;
        if (item.isValid && item.shape.shapeProperties.isTable) {
          let tableObj = new TableCollection();
          tableObj.svgId = item.shape.shapeProperties.name;
          tableObj.details = item.formFields[0].value;
          tableObj.capacity = Number(item.formFields[1].value);
          allTableForm.push(tableObj);
        }
      });

      if (this.floorId) {//Update floor when floorId exist.
        this.updateFloorPlan.newTableInfos = [];
        this.updateFloorPlan.updatingTableInfos = [];
        allTableForm.forEach(item => {
          let table = this.floorPlan.tableInfos.find(val => {
            return val.svgId == item.svgId;
          });
          if (table) {//Making array of updating table infoes.
            if (item.capacity !== table.capacity || item.details !== table.details) {
              table.capacity = item.capacity;
              table.details = item.details;
              this.updateFloorPlan.updatingTableInfos.push(table);
            }
          }
          else {//Making array of new table infoes.
            this.updateFloorPlan.newTableInfos.push(item);
          }
        });

        this.updateFloorPlan.floor = this.floorPlan.floor;
        //Updating floor with api call if Data valid.
        if (allTableForm.length == tableCount && this.updateFloorPlan.floor) {
          this.sharedDataService.uploadMultipleImages(this.formData).subscribe(
            (res: any) => {
              this.updateFloorPlan.svg = res.body.data.results[0].Location;
              this.shapeService.updateFloorPlan(this.updateFloorPlan, this.businessId, this.floorId).subscribe(
                (res: any) => {
                  this.getFloorPlanById();
                  this.getMaxSvgIdUnderFloorPlan();
                  this.toastr.successToastr(res.body.message.en);
                },
                err => {
                  this.toastr.errorToastr(err.error.message.en);
                }
              );
            },
            err => {
              this.toastr.errorToastr(err.error.message.en);
              this.isSubmit = false;
            },
            () => {
              this.isSubmit = false;
            }
          );
        }
        else {
          this.colorRedIfAllTheTableNotValid();
        }
      } else {//Create new Floor.
        if (allTableForm.length == tableCount && this.floorPlan.floor) {
          if (allTableForm.length > 0) {
            this.sharedDataService.uploadMultipleImages(this.formData).subscribe(
              (res: any) => {
                this.floorPlan.svg = res.body.data.results[0].Location;
                this.floorPlan.tableInfos = allTableForm;
                if (this.floorPlan.svg) {
                  this.shapeService.submitFloorPlan(this.floorPlan, this.businessId).subscribe(
                    (res: any) => {
                      this.toastr.successToastr(res.body.message.en);
                      this.router.navigate(["/admin/business/manage-business/" + this.businessId + "/layout/layout-list"]);
                    },
                    err => {
                      this.toastr.errorToastr(err.error.message.en);
                    }
                  );
                }
              },
              err => {
                this.toastr.errorToastr(err.error.message.en);
                this.isSubmit = false;

              },
              () => {
                this.isSubmit = false;
              }
            );
          }
          else {
            this.isSubmit = false;
            this.toastr.warningToastr('There is no table for this layout');
          }
        }
        else {
          this.colorRedIfAllTheTableNotValid();
        }
      }
    }
    else {//Delete portion
      this.deleteFloorTable()
    }
  }

  colorRedIfAllTheTableNotValid() {
    this.toastr.infoToastr('Please set floor name and All table properties!');
    this.shapeService.shapesComponents.forEach(item => {
      if (!item.isValid && item.shape.shapeProperties.isTable) {
        item.fillColor = '#dc3545';
        item.setStyles();
      }
      else {
        item.fillColor = '';
        item.setStyles();
      }
    });
    this.isSubmit = false;
  }

  fileProcess(photo: any) {
    this.fileData = <File>photo.files[0];
    var reader = new FileReader();
    this.imagePath = <File>photo.files;
    reader.readAsText(this.fileData);
    reader.onload = (_event) => {
      this.insertedSVG = reader.result ? reader.result as string : null;
      if (this.insertedSVG) {
        this.loadSVG(this.insertedSVG);
      }
    }

    //read data from specific path
    // this.http.get('assets/test.txt', {responseType: 'text'})
    // .subscribe(data => console.log(data));
  }

  loadSVG(svg: string) {
    if (this.action === 'edit') {
      this.clearLayout();
    }
    this.shapeService.removeAllShapeComponents();

    let svgElement = document.querySelector("svg");

    const domParser = new DOMParser();
    const dom = domParser.parseFromString(svg, "image/svg+xml");
    const layoutSvgElement = dom.children[0];

    for (let k = 0; k < layoutSvgElement.children.length; k++) {
      let tag = layoutSvgElement.children[k];
      if (tag.nodeName != 'path') {
        svgElement.appendChild(layoutSvgElement.children[k]);
        k--;
      }
    }

    for (let j = 0; j < layoutSvgElement.attributes.length; j++) {
      let attr = layoutSvgElement.attributes[j];
      if (attr.name != 'xmlns' && attr.name != 'xmlns:xlink' && attr.nodeValue) {
        svgElement.setAttribute(attr.name, attr.nodeValue);
      }
    }

    let shapes: ShapeComponent[] = []

    for (let i = 0; i < layoutSvgElement.children.length; i++) {
      let element = layoutSvgElement.children[i];

      switch (element.nodeName) {
        case "path": {
          let injector = Injector.create([], this.viewContainerRef.parentInjector);
          let factory = this.componentFactoryResolver.resolveComponentFactory(this.buildComponent(ShapeType['Rectangle']));
          let component = factory.create(injector);

          let newRectangle = <RectangleComponent>component.instance;

          let properties = new ShapeProperties();
          properties.name = element.getAttribute('id') ? element.getAttribute('id') : newRectangle.shape.shapeProperties.name;

          let tableNo = (properties.name).match(/\d+/g);
          if (tableNo && tableNo[0]) {
            newRectangle.formFields[3].value = Number(tableNo[0]);
          }

          properties.isTable = this.regex.test(properties.name) ? true : false;
          newRectangle.shape.shapeProperties = Object.assign({}, properties);
          let value = element.getAttribute('d');
          newRectangle.value = value ? value : newRectangle.value;

          let translateString = element.getAttribute('transform');
          if (translateString != null) {
            let numbers = translateString.match(/([0-9]*[.])?[0-9]+/g).map(Number);
            newRectangle.shape.originX = numbers[0] ? numbers[0] : 0;
            newRectangle.shape.originY = numbers[1] ? numbers[1] : 0;
            newRectangle.formFields[2].value = numbers[2] ? numbers[2] : 0;
          }

          if (this.floorId) {
            let table = this.floorPlan.tableInfos.find(item => {
              if (properties.isTable) {
                return item.svgId == newRectangle.shape.shapeProperties.name;
              }
            });

            if (table) {
              newRectangle.formFields[0].value = table.details;
              newRectangle.formFields[1].value = table.capacity;
              newRectangle.isValid = true;
              newRectangle.primaryId = table.id ? table.id : 0;
            }
          }

          shapes.push(newRectangle);
          break;
        }
        default: {
        }
      }
    }
    this.shapeService.setMultipleShapes(shapes);
  }

  parseSvg() {
    let svg = document.getElementsByTagName("svg")[0].outerHTML;
    this.insertedSVG = svg;
    let curTimeStamp = new Date().getTime();
    var file = new File([svg], `${curTimeStamp}.svg`, {
      type: "image/svg+xml",
    });

    const formData = new FormData();
    formData.append('files', file);
  }

  selectShape(shapeType: string, tableType: string): void {
    this.selectedShape = ShapeType[shapeType];
    this.selectedTable = TableType[tableType];
    this.shapeValue = ShapeType[this.selectedShape];
    this.isSelectingPoints = false;
  }

  clearShapes(): void {
    this.shapeService.removeAllShapeComponents();
    this.selectedShape = ShapeType.NoShape;
    this.shapeValue = ShapeType[this.selectedShape];
    this.formFields = [];
  }

  getShapes(): ShapeComponent[] {
    return this.shapeService.getShapeComponents();
  }

  selectTool(toolType: string): void {
    this.selectedTool = ToolType[toolType];
    this.selectedShape = ShapeType.NoShape;
    this.shapeValue = ShapeType[this.selectedShape];
    if (this.selectedTool == ToolType.Pointer) {
      if (this.isSelectingPoints) {
        this.selectedComponent.endDrawing();
        this.isSelectingPoints = false;
      }
    }
  }

  getMousePosition(event: MouseEvent) {
    var CTM = this.svg.getScreenCTM();
    this.currentPosition.x = (event.clientX - CTM.e) / CTM.a;
    this.currentPosition.y = (event.clientY - CTM.f) / CTM.d;
  }

  setScale(profileForm: any) {
    if (profileForm) {
      let obj = this.selectedComponent.formFields[2];
    }
  }

  private buildComponent(shapeType: ShapeType): any {
    switch (shapeType) {
      case ShapeType.Rectangle:
        return RectangleComponent;
    }
    return null;
  }

  canSelectPoints(): boolean {
    if (this.selectedShape == ShapeType.PolyLine || this.selectedShape == ShapeType.Path) {
      return true;
    }
    return false;
  }

  deSelectComponents() {
    var shapes = this.getShapes();
    for (var i = 0; i < shapes.length; i++) {
      shapes[i].isSelected = false;
    }
  }

  onMouseDown(event): void {
    this.getMousePosition(event);
    this.currentPositionSet = (Object.assign({} as MousePosition, this.currentPosition));

    let elementId = event.target.id;
    if (this.regex.test(elementId)) {
      this.selectedTableIdForDelete = elementId;
    }

    this.deSelectComponents();
    if (event.target.classList.contains('draggable')) {
      this.selectedComponent = this.shapeService.findShapeComponent(event.target.id);
      if (this.selectedComponent) {
        this.selectedComponent.isSelected = true;
        this.shapeProperties = Object.assign({}, this.selectedComponent.shape.shapeProperties);
        if (this.regex.test(this.shapeProperties.name) && this.formFields.length === 0) {
          if (this.action === 'edit') {
            this.openPropertiesToggle();
          }
        }
        this.formFields = this.selectedComponent.getFormFields();
        this.startDragging(event);
      }
    } else if (event.target.classList.contains('resize')) {
      this.selectedComponent = this.shapeService.findShapeComponent(event.target.id);
      if (this.selectedComponent) {
        this.isResizing = true;
      }
    } else if (this.selectedShape != ShapeType.NoShape && !this.isSelectingPoints) {
      let injector = Injector.create([], this.viewContainerRef.parentInjector);
      let factory = this.componentFactoryResolver.resolveComponentFactory(this.buildComponent(this.selectedShape));
      let component = factory.create(injector);
      this.selectedComponent = <RectangleComponent>component.instance;

      this.shapeProperties = new ShapeProperties();

      this.maxSvgId = this.maxSvgId + 1;
      console.log(this.maxSvgId);
      this.shapeProperties.name = `table${this.maxSvgId}`;
      this.shapeProperties.isTable = this.regex.test(this.shapeProperties.name) ? true : false;
      this.selectedComponent.shape.shapeProperties = Object.assign({}, this.shapeProperties);
      this.selectedComponent.value = this.getTableValue(this.selectedTable);
      this.selectedComponent.formFields[3].value = this.maxSvgId;
      this.selectedComponent.isSelected = true;

      this.shapeService.setShapeComponent(this.selectedComponent);

      this.isDrawing = true;
      this.selectedComponent.startDrawing(this.currentPosition);
    }
  }

  onMouseMove(event): void {
    this.getMousePosition(event);
    if (this.selectedComponent && (this.isDrawing || this.isSelectingPoints)) {
      this.selectedComponent.draw(this.currentPosition);
    } else if (this.selectedComponent && this.isDragging) {
      if (this.currentPosition.x != this.currentPositionSet.x || this.currentPosition.y != this.currentPositionSet.y) {
        this.selectedComponent.drag(this.currentPosition);
      }
    } else if (this.isResizing) {
      this.selectedComponent.resizeShape(this.currentPosition);
    }
  }

  onMouseUp(event): void {
    this.getMousePosition(event);
    if (this.isSelectingPoints) {
      this.selectedComponent.setPoint(this.currentPosition);
    }
    this.selectedShape = ShapeType.NoShape;
    this.shapeValue = ShapeType[this.selectedShape];
    this.isDrawing = false;
    this.isDragging = false;
    this.isResizing = false;
  }

  getTableValue(tableType: TableType): any {
    switch (tableType) {
      case TableType.One:
        return `M13.3254 9.40618V2.74347H22.8622V9.40618H13.3254V9.40618ZM0.130641 46.1164H10.7126V55H25.7363V46.247H36.1877V9.40618H25.6057V0H10.5819V9.40618H0L0.130641 
        46.1164ZM4.44181 42.3278V13.7173H31.7458V41.4133H31.3539V14.1093H4.83373V41.9359H31.6152V42.3278H4.44181ZM13.3254 
        52.2565V46.1164H22.8622V52.2565H13.3254Z`;
      case TableType.Two:
        return `M55.2171 19.9639H48.7677V9.21074H37.0175L37.0617 2.86458V0.0440705H34.2346L24.4722 0H21.6451V2.82051L21.6009 
        9.21074H9.8949V19.9639H2.82711H0V22.7845V32.524V35.3445H2.82711H9.8949V46.0978H21.6009V52.1795V55H24.428H34.1904H37.0175V52.1795V46.0978H48.7235V35.3445H55.1729H58V32.524V22.7845V19.9639H55.2171V19.9639ZM9.8949 
        32.524H2.82711V22.7845H9.8949V32.524ZM24.428 2.82051L34.1904 2.86458L34.1462 9.21074H24.3839L24.428 
        2.82051ZM34.1904 52.1795H24.428V46.0978H34.1904V52.1795ZM44.7037 41.6026H14.4448V13.6178H43.7319V14.0585H14.8865V41.2059H44.262V13.8381H44.7037V41.6026ZM55.2171 
        32.524H48.7677V22.7845H55.2171V32.524Z`;
      case TableType.Three:
        return `M65.6834 20.4436V9.36451H56.5827V0H41.4149V9.36451H33.8969V0H18.9928V9.36451H8.57314V20.4436H0V35.0839H8.57314V46.1631H18.8609V55H33.765L33.8969 
        46.1631H41.4149V55H56.4508V46.1631H65.6834V35.0839H74.6523V20.4436H65.6834ZM44.0528 2.76978H53.4173V8.83693H44.0528V2.76978ZM21.8945 
        2.63789H31.259V9.36451H21.8945V2.63789ZM8.83693 32.3141H2.90167V23.0815H8.83693V32.3141ZM31.259 
        52.2302H21.8945V46.1631H31.259V52.2302ZM53.8129 52.2302H44.4484V46.1631H53.8129V52.2302ZM61.0671 
        41.4149H60.6715V13.9808H13.4532V41.8105H60.8034V42.2062L13.0576 42.3381V13.5851H61.0671V41.4149V41.4149ZM72.0144 
        32.3141H65.9472V23.0815H72.0144V32.3141Z`;
      case TableType.Four:
        return `M86.8765 20.2494V9.27553H77.8622V0H62.9691V9.27553H55.2613V0H40.4988V9.27553H33.5748V0H18.8124V9.27553H8.49169V20.2494H0V34.7506H8.49169V45.7245H18.6817V54.4774H33.4442L33.5748 
        45.7245H40.4988V55H55.2613V45.7245H62.8385V54.4774H77.7316V45.7245H86.8765V34.7506H95.6295V20.2494H86.8765ZM65.4513 
        2.74347H74.7268V8.75297H65.4513V2.74347ZM43.3729 2.61283H52.6485V9.27553H43.3729V2.61283ZM21.6865 
        2.61283H30.962V9.27553H21.6865V2.61283ZM8.75298 32.0071H2.87412V22.8622H8.75298V32.0071ZM30.962 
        51.734H21.6865V45.7245H30.962V51.734ZM52.3872 52.3872H43.1116V45.7245H52.3872V52.3872ZM75.1188 
        51.734H65.8432V45.7245H75.1188V51.734ZM82.304 41.0214H81.9121V13.848H13.3254V41.4133H82.0428V41.8052L12.9335 
        41.9359V13.4561H82.304V41.0214V41.0214ZM93.1473 32.0071H87.1378V22.8622H93.1473V32.0071Z`;
      case TableType.Five:
        return `M25.5,31.3c0-8.5-2.7-15.9-6.6-19.7c0.5-1.1,0.8-2.3,0.8-3.6c0-4.4-3.1-8-6.9-8C9,0,5.9,3.6,5.9,8
        c0,1.3,0.3,2.5,0.8,3.6C2.7,15.5,0,22.9,0,31.3c0,8.6,2.7,16,6.7,19.8c-0.5,1.1-0.9,2.4-0.9,3.8c0,4.4,3.1,8,6.9,8
        c3.8,0,6.9-3.6,6.9-8c0-1.4-0.3-2.7-0.9-3.8C22.8,47.3,25.5,39.9,25.5,31.3z M12.7,2.5c2.7,0,4.8,2.5,4.8,5.5c0,0.8-0.2,1.6-0.4,2.2
        c-1.3-0.8-2.8-1.3-4.4-1.3c-1.5,0-3,0.5-4.4,1.4C8,9.6,7.9,8.9,7.9,8.1C7.9,4.9,10.1,2.5,12.7,2.5z M1.4,31.3
        c0-11.5,5.1-20.8,11.4-20.8c3.6,0,7,3.1,9.1,8.4L21.7,19c-2.1-5.2-5.4-8.3-8.9-8.3C6.6,10.7,1.6,20,1.6,31.3
        c0,11.4,5,20.6,11.2,20.6S24,42.6,24,31.3c0-4.4-0.7-8.6-2.2-12.2L22,19c1.4,3.6,2.2,7.8,2.2,12.3c0,11.5-5.1,20.8-11.4,20.8
        C6.5,52.2,1.4,42.8,1.4,31.3z M17.6,54.9c0,3.1-2.2,5.5-4.8,5.5c-2.7,0-4.8-2.5-4.8-5.5c0-0.9,0.2-1.7,0.5-2.5
        c1.3,0.8,2.8,1.3,4.3,1.3s3-0.5,4.3-1.3C17.4,53.2,17.6,54.1,17.6,54.9z`;
      case TableType.Six:
        return `M23.3,47.4v6.8h-9.7v-7C13.6,47.4,23.3,47.4,23.3,47.4z M0.1,47.4h10.6v9.7h15.4v-9.7h10.8
        V35.9h8.9V20.7h-8.9V9.2H26.3V0H10.9l-0.1,9l0,0l0,0H0L0.1,47.4z M42.8,23.4V33h-6.1v-9.6H42.8z M32.3,13.1v29.8h-28V14h0.4v28.4
        h27.2V13.6H4.6v-0.4L32.3,13.1L32.3,13.1z M23.3,2.8v6.3h-9.7V2.8H23.3z`;
      case TableType.Seven:
        return `M44.2,11.1H29c-0.3,0-0.5,0.2-0.5,0.5v2.5c0,0.3,0.2,0.5,0.5,0.5h0.3v16.7h-3.9l0,0c0-8.5-2.7-15.9-6.6-19.7
        c0.5-1.1,0.8-2.3,0.8-3.6c0-4.4-3.1-8-6.9-8S5.8,3.6,5.8,8c0,1.3,0.3,2.5,0.8,3.6C2.7,15.4,0,22.8,0,31.3c0,8.6,2.7,16,6.7,19.8
        c-0.5,1.1-0.9,2.4-0.9,3.8c0,4.4,3.1,8,6.9,8s6.9-3.6,6.9-8c0-1.4-0.3-2.7-0.9-3.8c4-3.8,6.7-11.2,6.7-19.7h3.9v16.8H29
        c-0.2,0-0.4,0.2-0.4,0.4v2.7c0,0.2,0.2,0.4,0.4,0.4h15.2c0.4,0,0.8-0.3,0.8-0.8V11.8C44.9,11.4,44.6,11.1,44.2,11.1z M12.7,2.3
        c2.7,0,4.8,2.5,4.8,5.5c0,0.8-0.2,1.6-0.4,2.2c-1.4-0.9-2.9-1.4-4.4-1.4s-3,0.5-4.4,1.4C8,9.3,7.9,8.6,7.9,7.8
        C7.9,4.8,10,2.3,12.7,2.3z M12.7,60.4c-2.7,0-4.8-2.5-4.8-5.5c0-0.9,0.2-1.7,0.5-2.5c1.3,0.8,2.8,1.3,4.3,1.3s3-0.5,4.3-1.3
        c0.3,0.7,0.5,1.6,0.5,2.5C17.5,57.9,15.3,60.4,12.7,60.4z M12.7,52C6.4,52,1.3,42.7,1.3,31.2s5.1-20.8,11.4-20.8
        c3.6,0,7,3.1,9.1,8.4l-0.2,0.1c-2.1-5.2-5.4-8.3-8.9-8.3c-6.2,0-11.2,9.3-11.2,20.6c0,11.4,5,20.6,11.2,20.6s11.2-9.3,11.2-20.6
        c0-4.4-0.7-8.6-2.2-12.2l0.2-0.1c1.4,3.6,2.2,7.8,2.2,12.3C24,42.7,18.9,52,12.7,52z M44.2,49.2c0,0.7-0.6,1.3-1.3,1.3H41h-0.1
        L40,49.6v-0.1v-0.7h-9.9c-0.1,0-0.1,0-0.1-0.1c0-0.1,0-0.1,0.1-0.1s9.6,0,9.6,0l-0.3-0.2h-9.3c-0.1,0-0.2-0.1-0.2-0.3
        s0.1-0.4,0.2-0.4h8L38,31.4h1.9L40,48.1l0.2,0.4l0,0v0.1v0.7l0.7,0.7l-0.1-18.6h0.6L41.5,48H43c0.6,0,1-0.5,1-1l-0.1-15.6h0.3V49.2
        L44.2,49.2z M44.2,31.3h-0.3V15.7c0-0.6-0.5-1-1-1h-1.5v16.6h-0.6V12.7l-0.7,0.7v0.7v0.1l0,0l-0.2,0.4v16.7H38V15.1h-8
        c-0.1,0-0.1-0.1-0.1-0.3s0.1-0.3,0.1-0.3h9.3l0.3-0.2H30c0,0-0.1,0-0.1-0.1s0.1-0.1,0.1-0.1h9.9v-0.7v-0.1l0.9-0.9h0.1h1.9
        c0.7,0,1.3,0.6,1.3,1.3L44.2,31.3L44.2,31.3z`;
      case TableType.Eight:
        return `M36.4,46c0-0.3,0-0.8-0.1-1.1c3.4-1.8,6.3-4.7,8.2-8.2c0.4,0.1,1,0.1,1.4,0.1c5,0,9-4,9-9
        s-4-9-9-9c-0.4,0-1,0-1.4,0.1c-1.8-3.6-4.7-6.4-8.2-8.2c0.1-0.6,0.1-1.1,0.1-1.7c0-5-4-9-9-9s-9,4-9,9c0,0.6,0.1,1.1,0.1,1.7
        c-3.6,1.8-6.4,4.7-8.2,8.2c-0.4-0.1-0.9-0.1-1.3-0.1c-5,0-9,4-9,9s4,9,9,9c0.4,0,0.9,0,1.3-0.1c1.8,3.4,4.7,6.3,8.2,8.2
        c0,0.3-0.1,0.8-0.1,1.1c0,5,4,9,9,9S36.4,50.9,36.4,46z M46,21.5c3.4,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1c-0.1,0-0.2,0-0.3,0
        c0.7-1.9,1-4,1-6.1s-0.3-4.2-1-6.1C45.8,21.6,45.9,21.5,46,21.5z M21.3,9c0-3.4,2.8-6.1,6.1-6.1c3.4,0,6.1,2.8,6.1,6.1
        c0,0.1,0,0.3,0,0.4c-1.9-0.7-4-1-6.1-1s-4.2,0.3-6.1,1C21.3,9.3,21.3,9.2,21.3,9z M9.1,33.9c-3.4,0-6.1-2.8-6.1-6.1
        c0-3.4,2.8-6.1,6.1-6.1c0.1,0,0.1,0,0.2,0c-0.7,1.9-1,4-1,6.1s0.3,4.2,1,6.1C9.2,33.9,9.1,33.9,9.1,33.9z M11.3,27.7
        c0-8.9,7.2-16.1,16.1-16.1c8.7,0,15.9,7.1,16.1,15.8h-0.3C43.1,18.8,36,12,27.4,12c-8.7,0-15.8,7.1-15.8,15.8s7.1,15.8,15.8,15.8
        c8.6,0,15.6-6.9,15.8-15.4h0.3C43.3,36.9,36.1,44,27.4,44C18.5,43.9,11.3,36.6,11.3,27.7z M21.3,46c1.9,0.7,4,1,6.1,1s4.2-0.3,6.1-1
        c0,3.3-2.8,6.1-6.1,6.1C24,52.1,21.3,49.3,21.3,46z`;
      case TableType.Nine:
        return `M0.6,16.4h2.5c0.3,0,0.5-0.2,0.5-0.5v-0.3h22.9V19H4.1v16.6h22.6v3.5H9.9v-0.4c0-0.2-0.2-0.4-0.4-0.4H6.8
        c-0.2,0-0.4,0.2-0.4,0.4v15.2c0,0.4,0.3,0.8,0.8,0.8h39.1c0.4,0,0.8-0.3,0.8-0.8V38.8c0-0.3-0.2-0.5-0.5-0.5h-2.5
        c-0.3,0-0.5,0.2-0.5,0.5v0.3H26.9v-3.5h22.6V19.1L26.8,19v-3.4l23.1,0.1V16c0,0.2,0.2,0.4,0.4,0.4H53c0.2,0,0.4-0.2,0.4-0.4V0.8
        c0-0.4-0.3-0.8-0.8-0.8H0.8C0.4,0,0,0.3,0,0.8v15.1C0.1,16.2,0.3,16.4,0.6,16.4z M10,49.7l-0.4,0.2l0,0H9.5H8.8l-0.7,0.7h18.5v0.6
        H10.1v1.5c0,0.6,0.5,0.9,1,0.9h15.6v0.3L8.9,54c-0.7,0-1.3-0.6-1.3-1.3v-1.9v-0.1l0.9-0.9h0.1h0.7v-9.9c0-0.1,0-0.1,0.1-0.1
        s0.1,0.1,0.1,0.1c0,0,0,9.6,0,9.6l0.2-0.3v-9.3c0-0.1,0.1-0.2,0.3-0.2s0.4,0.1,0.4,0.2v7.9h16.2v1.9C26.6,49.7,10,49.7,10,49.7z
         M43,39.8c0-0.1,0.1-0.1,0.3-0.1s0.3,0.1,0.3,0.1v9.3l0.2,0.3v-9.6c0-0.1,0-0.1,0.1-0.1s0.1,0,0.1,0.1s0,9.9,0,9.9h0.7h0.1l0.9,0.9
        v0.1v1.9c0,0.7-0.6,1.3-1.3,1.3H26.8v-0.3h15.6c0.6,0,1-0.5,1-1v-1.5l-16.6,0.1v-0.6h18.6L44.7,50H44h-0.1l0,0l-0.4-0.3H26.8v-1.9
        H43V39.8z M45.7,31.9L45.7,31.9h-0.3v-9.1H8v9.4h37.5v0.3L7.6,32.6V22.4h38.1C45.7,22.4,45.7,31.9,45.7,31.9z M26.8,5h23.1l0.4-0.2
        l0,0h0.1h0.7l0.7-0.7h-25V3.5h23V2c0-0.6-0.5-1-1-1h-22V0.7H51c0.7,0,1.3,0.6,1.3,1.3v1.9V4l-1,0.9h-0.1h-0.7v10
        c0,0.1-0.1,0.1-0.1,0.1c0,0-0.1,0-0.1-0.1V5.3l-0.2,0.3v9.3c0,0.1-0.1,0.2-0.3,0.2s-0.4-0.1-0.4-0.2V7H26.8V5z M1.3,2
        c0-0.7,0.6-1.3,1.3-1.3h24.1V1h-22c-0.6,0-1,0.5-1,1v1.5h23v0.6h-25l0.7,0.7h0.7h0.1l0,0L3.6,5h23v2H4.1v7.9C4.1,15,4,15,3.8,15
        s-0.3,0-0.3-0.1s0-9.3,0-9.3L3.3,5.3v9.6c0,0.1,0,0.1-0.1,0.1s-0.1,0-0.1-0.1s0-9.9,0-9.9H2.3H2.2L1.3,4V3.9V2z`;
      case TableType.Ten:
        return `M51.5 17.2V8.7C51.5 9.1 52.1 9.5 52.9 9.5H53.7C54.4 9.5 55.1 9.1 55.1 8.7V0H51.6H3.6H0V8.7C0 
          9.1 0.6 9.5 1.4 9.5H2.2C2.9 9.5 3.6 9.1 3.6 8.7V17.2H27.5V20.2H10.4V32.5H27.5V35.5H3.5V44C3.5 43.6 2.9 
          43.2 2.1 43.2H1.4C0.7 43.2 0 43.6 0 44V52.7H3.5H51.5H55V44C55 43.6 54.4 43.2 53.6 43.2H52.8C52.1 43.2 51.4 
          43.6 51.4 44V35.5H27.6V32.5H44.7V20.2H27.6V17.2H51.5ZM49.5 38.1V50C49.5 50.5 49 50.9 48.3 50.9C47.6 50.9 
          47.1 50.5 47.1 50V39H8.5V50C8.5 50.6 8 51 7.3 51C6.6 51 6.1 50.6 6.1 50.1V38.1C6.1 37.6 6.6 37.2 7.3 37.2H48.2C48.9 
          37.2 49.5 37.6 49.5 38.1ZM43.4 21.2C43.6 21.2 43.8 21.4 43.8 21.6V30.9C43.8 31.1 43.6 31.3 43.4 31.3H13C12.8 31.3 
          12.6 31.1 12.6 30.9C12.6 30.7 12.8 30.5 13 30.5H43V22H12.3V30.9C12.3 31.1 12.1 31.3 11.9 31.3C11.7 31.3 11.5 31.1 
          11.5 30.9V21.6C11.5 21.4 11.7 21.2 11.9 21.2H27.4H27.5H43.4ZM5.5 14.6V2.7C5.5 2.2 6 1.8 6.7 1.8C7.4 1.8 7.9 2.2 7.9 
          2.7V13.7H46.4V2.7C46.4 2.2 46.9 1.8 47.6 1.8C48.3 1.8 48.8 2.2 48.8 2.7V14.6C48.8 15.1 48.3 15.5 47.6 15.5H6.7C6.1 
          15.6 5.5 15.1 5.5 14.6Z`;
    }
  }

  startDragging(event): void {
    this.isDragging = true;
  }

  dragComponent(event): void {
  }

  endDragging(): void {
    this.selectedComponent = null;
  }

  setTableName(tableNumber: any): void {
    let selectedTableNo = this.selectedComponent.shape.shapeProperties.name.match(/(\d+)/)[0];
    let allTableNo = [];
    // Find all uniqe table number
    if (this.shapeService.shapesComponents.length) {
      for (let i = 0; i < this.shapeService.shapesComponents.length; i++) {
        let tableNo = 0;
        let currentShape = this.shapeService.shapesComponents[i];
        if (this.regex.test(currentShape.shape.shapeProperties.name)) {
          let numberFromShape = currentShape.shape.shapeProperties.name.match(/(\d+)/);
          tableNo = numberFromShape == null ? tableNo : Number(numberFromShape[0]);
          let index = allTableNo.findIndex(x => x == tableNo);
          if (index == -1 && tableNo != Number(selectedTableNo)) {
            allTableNo.push(tableNo);
          }
        }
      }
    }

    let currentTabNo = Number(tableNumber);
    let currentTableIndex = allTableNo.findIndex(x => x == currentTabNo);
    if (currentTableIndex == -1) {
      if (currentTabNo > 0) {
        this.selectedComponent.shape.shapeProperties.name = `table${currentTabNo}`
      }
    }
    else {
      this.formFields[3].value = selectedTableNo;
      jQuery(this.alertModal.nativeElement).modal('show');
      setTimeout(() => {
        jQuery(this.alertModal.nativeElement).modal('hide');
      }, 2000);
    }
  }

  rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
      throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
  }

  submit(value: any) {
    this.selectedComponent.updateShapeProperties(value);
  }
}

import { ShapeType, State } from './shape-types';

/*
 * The MousePosition object
 */
export class MousePosition {
    x: number;
    y: number;

    constructor() {
        this.x = 0;
        this.y = 0;
    }
}

export class FloorPlan {
    id?: number;
    floor: string;
    svg: string;
    tableInfos: TableCollection[] = [];
    newTableInfos?: TableCollection[] = [];
}

export class UpdateFloorPlan {
    id?: number;
    floor: string;
    svg: string;
    updatingTableInfos?: TableCollection[] = [];
    newTableInfos?: TableCollection[] = [];
}

export class TableCollection {
    svgId: string;
    capacity: number;
    details: string;
    id?: number;
}

/*
 * The ShapeProperties object
 */
export class ShapeProperties {
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    fill: boolean;
    stroke: boolean;
    shapeType: ShapeType;
    name: string;
    isTable: boolean;
    visible: boolean;

    constructor() {
        this.fill = true;
        this.fillColor = 'rgb(173, 179, 179)';
        this.stroke = true;
        this.strokeColor = '#9d8484';
        this.strokeWidth = 1;
        this.name = 'unknown';
        this.visible = true;
        this.isTable = false;
    }
}

/*
 * Interface for the shapes 
 */
export interface BaseShape {
}

/*
 * The Shape object
 */
export class Shape implements BaseShape {
    public shapeProperties: ShapeProperties;
    public originX: number;
    public originY: number;
    constructor() {
        this.shapeProperties = new ShapeProperties();
        this.originX = this.originY = 0;
        //this.shapeProperties.name = name;
        //console.log('Shape constructor name : ', this.shapeProperties);
    }
}

/*
 * The Line class.
 */
export class Line extends Shape {

    private static id: number = 0;

    public x2: number;
    public y2: number;

    constructor() {
        super();
        this.x2 = this.y2 = 0;
        console.log('Line constructor ', this);
    }
}

/*
 * The Circle class.
 */
export class Circle extends Shape {
    private static id: number = 0;

    public r: number;

    constructor() {
        super();
        this.r = 0;
        console.log('Circle constructor ', this);
    }
}

/*
 * The Rectangle class.
 */
export class Rectangle extends Shape {
    private static id: number = 0;
    public scale: number = 1;
    public width: number;
    public height: number;

    constructor() {
        super();
        this.width = this.height = 0;
    }
}

/*
 * The Square class.
 */
export class Square extends Shape {
    private static id: number = 0;

    public width: number;

    constructor() {
        super();
        this.width = 0;
        console.log('Rectangle constructor ', this);
    }
}

/*
 * The Ellipse class.
 */
export class Ellipse extends Shape {
    private static id: number = 0;

    public rx: number;
    public ry: number;

    constructor() {
        super();
        this.rx = this.ry = 0;
        console.log('Ellipse constructor ', this);
    }
}

/*
 * The TextBox class.
 */
export class TextBox extends Shape {
    private static id: number = 0;

    public value: string;

    constructor() {
        super();
        this.value = 'Some text';
        console.log('Text constructor ', this);
    }
}

/*
 * The Image class.
 */
export class ImageBox extends Shape {
    private static id: number = 0;

    public width: number;
    public height: number;
    public url: string;

    constructor() {
        super();
        // super((ImageBox.id++).toString());
        this.width = this.height = 0;
        this.url = 'assets/pictures/table.svg';
        console.log('Image constructor ', this);
    }
}

/*
 * The PolyLine class.
 */
export class PolyLine extends Shape {
    private static id: number = 0;

    public points: MousePosition[];

    constructor() {
        super();
        this.points = [];
        console.log('PolyLine constructor ', this);
    }
}

/*
 * The Path class.
 */
export class Path extends Shape {
    private static id: number = 0;

    public points: MousePosition[];
    public state: State;

    constructor() {
        super();
        this.points = [];
        this.state = State.None;
        console.log('Path constructor ', this);
    }
}

export enum ShapeType {
    NoShape,
    Line,
    Circle,
    Ellipse,
    Rectangle,
    TextBox,
    Path,
    PolyLine,
    Image,
    Square
}

export class TableDeleteModel {
    tableIds: number[] = [];
    svg: string;
}

export enum TableType {
    One,
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten
}

export enum ToolType {
    Pointer,
    Move,
    Rotate,
    SelectArea,
    Flipvertical,
    Fliphorizontal
}

export enum State {
    None,
    Moving,
    Finished

}
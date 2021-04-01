import { CommonType } from './../../../../shared/models/common.model';
export class FoodMenu {
    id: number;
    itemName: string;
    primaryPhoto: string;
    itemDescription: string;
    price: number;
    businessId: number;
    foodType: CommonType;
    foodMenuStatus: CommonType;
    checked?: boolean = false;
}
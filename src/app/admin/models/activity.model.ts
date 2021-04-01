import { UserModel } from './../../user/models/user.model';
export class Activity {
    id: number;
    performer: UserModel = new UserModel();
    performedBy: number;
    action: string;
    ip: string;
    userAgent: string;
    previousValue?: string;
    createdAt: Date;
    finalValue?: string;
    resourceId: number;
}
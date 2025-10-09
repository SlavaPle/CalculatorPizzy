import mongoose, { Document } from 'mongoose';
export interface IPizza extends Document {
    type: string;
    size: 'small' | 'medium' | 'large' | 'xlarge';
    price: number;
    slices: number;
    isFree: boolean;
}
export interface ISauce extends Document {
    type: string;
    price: number;
    size: 'small' | 'medium' | 'large';
    isPersonal: boolean;
    userId?: string;
}
export interface IUserOrder extends Document {
    userId: string;
    name: string;
    minSlices: number;
    maxSlices: number;
    preferredTypes?: string[];
    personalSauces: ISauce[];
    totalCost: number;
    assignedSlices: any[];
}
export interface IOrder extends Document {
    userId: string;
    users: IUserOrder[];
    pizzas: IPizza[];
    sharedSauces: ISauce[];
    totalCost: number;
    freePizzaCount: number;
    calculationResult: {
        optimalPizzas: IPizza[];
        userCosts: {
            [key: string]: number;
        };
        totalCost: number;
        freePizzaValue: number;
        distribution: {
            [key: string]: any;
        };
    };
    settings: {
        freePizzaThreshold: number;
        freePizzaSize: string;
        currency: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Order.d.ts.map
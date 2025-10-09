import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    preferences: {
        defaultMinSlices: number;
        defaultMaxSlices: number;
        preferredPizzaTypes: string[];
    };
    settings: {
        currency: string;
        language: string;
        notifications: boolean;
        autoSave: boolean;
    };
    statistics: {
        totalCalculations: number;
        totalSaved: number;
        lastCalculation: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map
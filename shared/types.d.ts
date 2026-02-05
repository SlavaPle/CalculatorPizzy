export interface Pizza {
    id: string;
    type: string;
    size: PizzaSize;
    price: number;
    slices: number;
    isFree: boolean;
}
export interface PizzaSlice {
    id: string;
    pizzaId: string;
    type: string;
    price: number;
    size: PizzaSize;
    userAssigned?: string;
}
export interface Sauce {
    id: string;
    type: string;
    price: number;
    size: SauceSize;
    isPersonal: boolean;
    userId?: string;
}
export interface User {
    id: string;
    name: string;
    minSlices: number;
    maxSlices: number;
    canBeMore: boolean;
    preferredTypes?: string[];
    personalSauces: Sauce[];
    totalCost: number;
    assignedSlices: PizzaSlice[];
}
export interface Order {
    id: string;
    users: User[];
    pizzas: Pizza[];
    sharedSauces: Sauce[];
    totalCost: number;
    freePizzaCount: number;
    createdAt: Date;
}
export interface CalculationResult {
    optimalPizzas: Pizza[];
    userCosts: {
        [userId: string]: number;
    };
    totalCost: number;
    freePizzaValue: number;
    distribution: {
        [userId: string]: {
            slices: PizzaSlice[];
            cost: number;
            sauces: Sauce[];
        };
    };
}
export type PizzaSize = 'small' | 'medium' | 'large' | 'xlarge';
export type SauceSize = 'small' | 'medium' | 'large';
export interface PizzaType {
    id: string;
    name: string;
    basePrice: {
        [K in PizzaSize]: number;
    };
    slices: {
        [K in PizzaSize]: number;
    };
}
export interface SauceType {
    id: string;
    name: string;
    price: {
        [K in SauceSize]: number;
    };
}
export interface Settings {
    defaultPizzaTypes: PizzaType[];
    defaultSauceTypes: SauceType[];
    freePizzaThreshold: number;
    freePizzaSize: PizzaSize;
    currency: string;
    language: 'ru' | 'en';
}
//# sourceMappingURL=types.d.ts.map
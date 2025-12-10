export class CalculationResultStore {
    private static instance: CalculationResultStore
    private data: any = null

    private constructor() { }

    public static getInstance(): CalculationResultStore {
        if (!CalculationResultStore.instance) {
            CalculationResultStore.instance = new CalculationResultStore()
        }
        return CalculationResultStore.instance
    }

    public setData(data: any): void {
        this.data = data
    }

    public getData(): any {
        return this.data
    }

    public clear(): void {
        this.data = null
    }
}

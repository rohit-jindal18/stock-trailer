export default abstract class BaseDataProvider<T> {

    private dataPromise: Promise<T | undefined>;

    constructor() {
        this.dataPromise = this.prepareData();
    }

    protected abstract prepareData(): Promise<T | undefined>;

    public getData(): Promise<T | undefined> {
        return this.dataPromise;
    }

    public resetData(): void {
        this.dataPromise = this.prepareData();
    }

}
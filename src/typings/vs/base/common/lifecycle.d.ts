export interface IDisposable {
    dispose(): void;
}

export declare function createDecorator<T>(serviceId: string): ServiceIdentifier<T>;

export interface ServiceIdentifier<T> {
    (...args: any[]): void;
    type: T;
}
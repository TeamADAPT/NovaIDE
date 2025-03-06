import { ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';

export class ServiceCollection {
    private readonly _entries = new Map<ServiceIdentifier<any>, any>();

    constructor(...entries: [ServiceIdentifier<any>, any][]) {
        for (const [id, service] of entries) {
            this.set(id, service);
        }
    }

    set<T>(id: ServiceIdentifier<T>, instance: T): T {
        this._entries.set(id, instance);
        return instance;
    }

    get<T>(id: ServiceIdentifier<T>): T {
        return this._entries.get(id);
    }

    has(id: ServiceIdentifier<any>): boolean {
        return this._entries.has(id);
    }

    // Implement iterator protocol
    [Symbol.iterator](): IterableIterator<ServiceIdentifier<any>> {
        return this._entries.keys();
    }

    // Additional iterator methods
    keys(): IterableIterator<ServiceIdentifier<any>> {
        return this._entries.keys();
    }

    values(): IterableIterator<any> {
        return this._entries.values();
    }

    entries(): IterableIterator<[ServiceIdentifier<any>, any]> {
        return this._entries.entries();
    }
}

// Create and export the singleton instance
export const serviceCollection = new ServiceCollection();
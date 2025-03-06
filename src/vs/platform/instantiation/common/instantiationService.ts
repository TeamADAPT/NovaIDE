import { ILogService } from 'vs/platform/log/common/log';
import { ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';
import { getSingletonServiceDescriptors } from 'vs/platform/instantiation/common/extensions';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';

export interface IInstantiationService {
    createInstance<T>(ctor: any, ...args: any[]): T;
    invokeFunction<R>(fn: (accessor: any) => R): R;
}

class InstantiationService implements IInstantiationService {
    private readonly _services: ServiceCollection;

    constructor() {
        this._services = new ServiceCollection();
        this.initializeServices();
    }

    private initializeServices(): void {
        // Register core services
        const descriptors = getSingletonServiceDescriptors();
        for (const [id, descriptor] of descriptors) {
            const instance = new descriptor.ctor(this);
            this._services.set(id, instance);
        }
    }

    createInstance<T>(ctor: any, ...args: any[]): T {
        const injectArgs = this.resolveInjectArgs(ctor);
        return new ctor(...injectArgs, ...args);
    }

    invokeFunction<R>(fn: (accessor: any) => R): R {
        const accessor = {
            get: <T>(id: ServiceIdentifier<T>) => this.getService<T>(id)
        };
        return fn(accessor);
    }

    private resolveInjectArgs(ctor: any): any[] {
        const injectArgs: any[] = [];
        const params = ctor.toString().match(/constructor\((.*?)\)/)?.[1]?.split(',') || [];
        
        for (const param of params) {
            const match = param.trim().match(/@(\w+)/);
            if (match) {
                const serviceName = match[1];
                for (const id of this._services.keys()) {
                    if (id.toString() === serviceName) {
                        injectArgs.push(this._services.get(id));
                        break;
                    }
                }
            }
        }

        return injectArgs;
    }

    private getService<T>(id: ServiceIdentifier<T>): T {
        const service = this._services.get(id);
        if (!service) {
            throw new Error(`Service not found: ${id}`);
        }
        return service;
    }
}

// Create and export the singleton instance
export const instantiationService = new InstantiationService();
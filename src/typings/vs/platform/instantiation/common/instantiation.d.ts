import { ILogService } from 'vs/platform/log/common/log';

export interface IInstantiationService {
    createInstance<T>(ctor: any, ...args: any[]): T;
    invokeFunction<R>(fn: (accessor: any) => R): R;
}

export const ILogService = createDecorator<ILogService>('logService');

export function createDecorator<T>(serviceId: string): ServiceIdentifier<T> {
    const id = serviceId;
    const decorator = function (target: Function, key: string, index: number): any {
        if (arguments.length !== 3) {
            throw new Error('@IServiceName-decorator can only be used to decorate a parameter');
        }
        storeServiceDependency(id, target, index, false);
        return target;
    };

    decorator.toString = () => id;
    return decorator;
}

export interface ServiceIdentifier<T> {
    (...args: any[]): void;
    type: T;
}

function storeServiceDependency(id: string, target: Function, index: number, optional: boolean): void {
    // This is just a type definition file, no implementation needed
}
import { ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';

const _registry: Map<ServiceIdentifier<any>, any> = new Map();

export function registerSingleton<T>(identifier: ServiceIdentifier<T>, ctor: any, supportsDelayedInstantiation?: boolean): void {
    _registry.set(identifier, {
        ctor,
        supportsDelayedInstantiation: !!supportsDelayedInstantiation
    });
}

export function getSingletonServiceDescriptors(): Array<[ServiceIdentifier<any>, any]> {
    return Array.from(_registry.entries());
}
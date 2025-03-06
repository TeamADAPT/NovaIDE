import { ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';

export function registerSingleton<T>(identifier: ServiceIdentifier<T>, ctor: any, supportsDelayedInstantiation?: boolean): void;
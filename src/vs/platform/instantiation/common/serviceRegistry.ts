import { ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { LogService } from 'vs/platform/log/common/log';
import { instantiationService } from './instantiationService';

// Initialize core services
export function initCoreServices(): void {
    // Register LogService
    const logService = new LogService();
    instantiationService.invokeFunction(accessor => {
        const services = new Map<ServiceIdentifier<any>, any>();
        services.set(ILogService, logService);
        return services;
    });
}

// Call initialization
initCoreServices();
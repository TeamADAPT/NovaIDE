import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface ILogService {
    error(message: string | Error, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
}

export const ILogService = createDecorator<ILogService>('logService');

export class LogService implements ILogService {
    error(message: string | Error, ...args: any[]): void {
        console.error(message, ...args);
    }

    warn(message: string, ...args: any[]): void {
        console.warn(message, ...args);
    }

    info(message: string, ...args: any[]): void {
        console.info(message, ...args);
    }

    debug(message: string, ...args: any[]): void {
        console.debug(message, ...args);
    }
}

// Register the service
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
registerSingleton(ILogService, LogService);
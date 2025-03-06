import { MongoClient, Collection, Db } from 'mongodb';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface NovaContext {
    id: string;
    state: any;
    timestamp: Date;
}

export interface NovaOperation {
    id: string;
    novaId: string;
    type: string;
    details: any;
    timestamp: Date;
}

export interface INovaMemoryService extends IDisposable {
    // Redis Operations
    setActiveContext(novaId: string, context: NovaContext): Promise<void>;
    getActiveContext(novaId: string): Promise<NovaContext>;
    
    // MongoDB Operations
    saveOperation(operation: NovaOperation): Promise<void>;
    getOperationHistory(novaId: string): Promise<NovaOperation[]>;
    
    // Elasticsearch Operations (to be implemented)
    searchContexts(query: string): Promise<any[]>;
    indexOperation(operation: NovaOperation): Promise<void>;
}

export const INovaMemoryService = createDecorator<INovaMemoryService>('novaMemoryService');

class NovaMemoryService implements INovaMemoryService {
    private client: MongoClient | undefined;
    private db: Db | undefined;
    private operations: Collection<NovaOperation> | undefined;
    private contexts: Collection<NovaContext> | undefined;

    constructor(
        @ILogService private readonly logService: ILogService
    ) {
        this.initialize().catch((err: unknown) => {
            const error = err instanceof Error ? err : new Error(String(err));
            this.logService.error('Failed to initialize NovaMemoryService:', error);
        });
    }

    private async initialize(): Promise<void> {
        try {
            // MongoDB Connection
            const url = 'mongodb://vscodium_service:VSC0d1um_N0v4_2025!@localhost:27017/nova_genesis?authSource=admin';
            this.client = await MongoClient.connect(url);
            this.db = this.client.db('nova_genesis');
            
            // Collections
            this.operations = this.db.collection<NovaOperation>('operations');
            this.contexts = this.db.collection<NovaContext>('contexts');

            // Indexes
            await this.operations.createIndex({ novaId: 1, timestamp: -1 });
            await this.contexts.createIndex({ id: 1 }, { unique: true });

            this.logService.info('NovaMemoryService initialized successfully');
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error(String(err));
            this.logService.error('Error initializing NovaMemoryService:', error);
            throw error;
        }
    }

    // Redis Operations (placeholder - to be implemented with Redis)
    async setActiveContext(novaId: string, context: NovaContext): Promise<void> {
        if (!this.contexts) {
            throw new Error('NovaMemoryService not initialized');
        }
        // TODO: Implement with Redis
        // For now, store in MongoDB
        await this.contexts.updateOne(
            { id: novaId },
            { $set: { ...context, timestamp: new Date() } },
            { upsert: true }
        );
    }

    async getActiveContext(novaId: string): Promise<NovaContext> {
        if (!this.contexts) {
            throw new Error('NovaMemoryService not initialized');
        }
        // TODO: Implement with Redis
        // For now, retrieve from MongoDB
        const context = await this.contexts.findOne({ id: novaId });
        return context || { id: novaId, state: {}, timestamp: new Date() };
    }

    // MongoDB Operations
    async saveOperation(operation: NovaOperation): Promise<void> {
        if (!this.operations) {
            throw new Error('NovaMemoryService not initialized');
        }
        try {
            await this.operations.insertOne({
                ...operation,
                timestamp: new Date()
            });
            this.logService.debug(`Operation saved for Nova ${operation.novaId}`);
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error(String(err));
            this.logService.error('Error saving operation:', error);
            throw error;
        }
    }

    async getOperationHistory(novaId: string): Promise<NovaOperation[]> {
        if (!this.operations) {
            throw new Error('NovaMemoryService not initialized');
        }
        try {
            return await this.operations
                .find({ novaId })
                .sort({ timestamp: -1 })
                .toArray();
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error(String(err));
            this.logService.error('Error retrieving operation history:', error);
            throw error;
        }
    }

    // Elasticsearch Operations (placeholder - to be implemented)
    async searchContexts(query: string): Promise<any[]> {
        // TODO: Implement with Elasticsearch
        return [];
    }

    async indexOperation(operation: NovaOperation): Promise<void> {
        // TODO: Implement with Elasticsearch
    }

    // Cleanup
    dispose(): void {
        if (this.client) {
            this.client.close().catch((err: unknown) => {
                const error = err instanceof Error ? err : new Error(String(err));
                this.logService.error('Error closing MongoDB connection:', error);
            });
        }
    }
}

// Register the service
registerSingleton(INovaMemoryService, NovaMemoryService);
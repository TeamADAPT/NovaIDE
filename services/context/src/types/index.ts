import { z } from 'zod';

/**
 * Nova Context Priority Levels
 * Controls resource allocation and scheduling
 */
export enum ContextPriority {
  ACTIVE = 'active',     // Currently focused
  READY = 'ready',      // Loaded, not focused
  STANDBY = 'standby',  // Partially loaded
  DORMANT = 'dormant'   // State preserved
}

/**
 * Resource Requirements Schema
 * Defines resource allocation for a Nova context
 */
export const ResourceRequirementsSchema = z.object({
  baseCPU: z.number().min(0.5).max(8),    // Base CPU cores
  baseMemory: z.number().min(512).max(32768), // Base memory MB
  burstCPU: z.number().min(1).max(16),    // Max CPU cores
  burstMemory: z.number().min(1024).max(65536), // Max memory MB
  priority: z.number().min(1).max(10)     // Priority level
});

export type ResourceRequirements = z.infer<typeof ResourceRequirementsSchema>;

/**
 * Nova Context State Schema
 * Represents the current state of a Nova context
 */
export const ContextStateSchema = z.object({
  mode: z.string(),
  llm: z.string(),
  workspace: z.string(),
  resources: ResourceRequirementsSchema,
  priority: z.nativeEnum(ContextPriority),
  lastActive: z.date(),
  metrics: z.object({
    cpuUsage: z.number(),
    memoryUsage: z.number(),
    operationCount: z.number()
  })
});

export type ContextState = z.infer<typeof ContextStateSchema>;

/**
 * Nova Context Schema
 * Complete context definition including state and resources
 */
export const NovaContextSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  state: ContextStateSchema,
  resources: ResourceRequirementsSchema,
  created: z.date(),
  updated: z.date()
});

export type NovaContext = z.infer<typeof NovaContextSchema>;

/**
 * Resource Pool Schema
 * Manages shared resources across Nova contexts
 */
export const ResourcePoolSchema = z.object({
  totalCPU: z.number(),
  totalMemory: z.number(),
  allocatedCPU: z.number(),
  allocatedMemory: z.number(),
  contexts: z.record(z.string(), ResourceRequirementsSchema)
});

export type ResourcePool = z.infer<typeof ResourcePoolSchema>;

/**
 * Operation History Schema
 * Tracks operations within a Nova context
 */
export const OperationSchema = z.object({
  id: z.string().uuid(),
  contextId: z.string().uuid(),
  type: z.string(),
  timestamp: z.date(),
  data: z.unknown(),
  resources: z.object({
    cpuUsage: z.number(),
    memoryUsage: z.number(),
    duration: z.number()
  })
});

export type Operation = z.infer<typeof OperationSchema>;

/**
 * Context Manager Configuration
 * Service configuration settings
 */
export const ConfigSchema = z.object({
  maxContexts: z.number().min(1).max(100),
  baseAllocation: z.object({
    cpu: z.number().min(0.5),
    memory: z.number().min(512)
  }),
  burstAllocation: z.object({
    cpu: z.number().min(1),
    memory: z.number().min(1024)
  }),
  metrics: z.object({
    enabled: z.boolean(),
    interval: z.number().min(1000)
  })
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Error Types
 * Custom error types for context management
 */
export enum ErrorType {
  RESOURCE_LIMIT = 'RESOURCE_LIMIT',
  CONTEXT_NOT_FOUND = 'CONTEXT_NOT_FOUND',
  INVALID_STATE = 'INVALID_STATE',
  OPERATION_FAILED = 'OPERATION_FAILED'
}

export class ContextError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ContextError';
  }
}

/**
 * Service Interfaces
 * Core service interfaces for context management
 */
export interface IContextManager {
  createContext(name: string, requirements: ResourceRequirements): Promise<NovaContext>;
  getContext(id: string): Promise<NovaContext>;
  updateContext(id: string, state: Partial<ContextState>): Promise<NovaContext>;
  deleteContext(id: string): Promise<void>;
  listContexts(): Promise<NovaContext[]>;
  switchContext(fromId: string, toId: string): Promise<void>;
}

export interface IResourceManager {
  allocateResources(contextId: string, requirements: ResourceRequirements): Promise<void>;
  releaseResources(contextId: string): Promise<void>;
  getResourceUsage(): Promise<ResourcePool>;
  optimizeResources(): Promise<void>;
}

export interface IStateManager {
  saveState(contextId: string, state: ContextState): Promise<void>;
  loadState(contextId: string): Promise<ContextState>;
  clearState(contextId: string): Promise<void>;
  listStates(): Promise<Record<string, ContextState>>;
}
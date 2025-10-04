/**
 * Embedding Model Configuration
 *
 * Defines supported embedding models with their properties.
 * This ensures consistency between model name, dimensions, and distance metric.
 *
 * @fileoverview Embedding model configuration and validation
 * @author aoki-h-jp
 * @version 1.0.0
 */

/**
 * Embedding model configuration
 */
export interface ModelConfig {
  /** Model name (used for loading) */
  name: string;
  /** Vector dimensions */
  dimensions: number;
  /** Distance metric for similarity search */
  distance: 'Cosine' | 'Euclid' | 'Dot';
  /** Human-readable description */
  description: string;
  /** Model size category */
  size: 'small' | 'medium' | 'large';
}

/**
 * Supported embedding models
 * 
 * Each model has predefined dimensions and distance metric.
 * This prevents configuration mismatches and ensures optimal performance.
 */
export const SUPPORTED_MODELS: Record<string, ModelConfig> = {
  'Xenova/all-MiniLM-L6-v2': {
    name: 'Xenova/all-MiniLM-L6-v2',
    dimensions: 384,
    distance: 'Cosine',
    description: 'Fast, lightweight model optimized for speed (default)',
    size: 'small'
  },
  'Xenova/all-mpnet-base-v2': {
    name: 'Xenova/all-mpnet-base-v2',
    dimensions: 768,
    distance: 'Cosine',
    description: 'Higher quality model with better semantic understanding',
    size: 'medium'
  },
  'Xenova/all-MiniLM-L12-v2': {
    name: 'Xenova/all-MiniLM-L12-v2',
    dimensions: 384,
    distance: 'Cosine',
    description: 'Balanced model with 12 transformer layers',
    size: 'small'
  }
};

/**
 * Default model (same as Qdrant MCP Server)
 */
export const DEFAULT_MODEL = 'Xenova/all-MiniLM-L6-v2';

/**
 * Get model configuration by name
 * 
 * @param modelName - Model name to look up
 * @returns Model configuration or undefined if not found
 */
export function getModelConfig(modelName: string): ModelConfig | undefined {
  return SUPPORTED_MODELS[modelName];
}

/**
 * Validate model name
 * 
 * @param modelName - Model name to validate
 * @returns True if model is supported
 */
export function isValidModel(modelName: string): boolean {
  return modelName in SUPPORTED_MODELS;
}

/**
 * Get all supported model names
 * 
 * @returns Array of supported model names
 */
export function getSupportedModels(): string[] {
  return Object.keys(SUPPORTED_MODELS);
}

/**
 * Get model configuration with fallback to default
 * 
 * @param modelName - Model name (optional)
 * @returns Model configuration (default if not found)
 */
export function getModelConfigWithDefault(modelName?: string): ModelConfig {
  const name = modelName || DEFAULT_MODEL;
  const config = getModelConfig(name);
  
  if (!config) {
    console.warn(`Model '${name}' not found, falling back to default: ${DEFAULT_MODEL}`);
    return SUPPORTED_MODELS[DEFAULT_MODEL];
  }
  
  return config;
}

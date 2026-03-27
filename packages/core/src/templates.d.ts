import { BrandVoice } from './types';

export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: TemplateField[];
  defaultPlatforms: string[];
  tone: string;
  outputTypes: string[];
  systemPrompt: (fields: any, brandVoice?: BrandVoice) => string;
}

export const TEMPLATES: Record<string, TemplateConfig>;
export function getTemplate(id: string): TemplateConfig | undefined;
export function getAllTemplates(): TemplateConfig[];
export function injectBrandVoice(prompt: string, brandVoice?: BrandVoice): string;

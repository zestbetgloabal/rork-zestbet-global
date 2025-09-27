// Mock implementation of @rork/toolkit-sdk for development
// This provides the same API as the real toolkit SDK

import { z } from 'zod';
import { useState } from 'react';

// Types
export interface RorkTool<T extends z.ZodType> {
  description: string;
  zodSchema: T;
  execute?: (input: z.infer<T>) => void | Promise<void>;
}

export interface CreateRorkToolParams<T extends z.ZodType> {
  description: string;
  zodSchema: T;
  execute?: (input: z.infer<T>) => void | Promise<void>;
}

export interface UseRorkAgentParams {
  tools?: Record<string, RorkTool<any>>;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  parts: MessagePart[];
}

export interface MessagePart {
  type: 'text' | 'tool';
  text?: string;
  toolName?: string;
  state?: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
  input?: any;
  output?: any;
  errorText?: string;
}

export interface MessageObject {
  text: string;
  files?: File[];
}

export interface File {
  type: 'file';
  mimeType: string;
  uri: string;
}

// Mock implementations
export function createRorkTool<T extends z.ZodType>(params: CreateRorkToolParams<T>): RorkTool<T> {
  return {
    description: params.description,
    zodSchema: params.zodSchema,
    execute: params.execute,
  };
}

export function useRorkAgent(params: UseRorkAgentParams) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (input: string | MessageObject) => {
    console.warn('useRorkAgent: Mock implementation - sendMessage not functional');
    setError('Mock implementation - AI features not available in development');
  };

  const addToolResult = (toolCallId: string, result: any) => {
    console.warn('useRorkAgent: Mock implementation - addToolResult not functional');
  };

  return {
    messages,
    error,
    sendMessage,
    addToolResult,
    setMessages,
  };
}

export async function generateObject<T extends z.ZodType>(params: {
  messages: any[];
  schema: T;
}): Promise<z.infer<T>> {
  console.warn('generateObject: Mock implementation - not functional');
  throw new Error('Mock implementation - AI features not available in development');
}

export async function generateText(
  params: string | { messages: any[] }
): Promise<string> {
  console.warn('generateText: Mock implementation - not functional');
  throw new Error('Mock implementation - AI features not available in development');
}


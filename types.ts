
export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  image?: string; // base64 string
  sources?: Source[];
}

export interface Source {
  uri: string;
  title: string;
}

export interface Chat {
  id: string;
  title: string;
  systemPrompt: string;
  messages: Message[];
  createdAt: number;
}

export enum Model {
  GEMINI_FLASH = 'gemini-2.5-flash',
  GEMINI_PRO = 'gemini-2.5-pro',
  IMAGEN = 'imagen-4.0-generate-001',
  GEMINI_IMAGE = 'gemini-2.5-flash-image',
  WEB_SEARCH = 'web-search', // This is a special case
  N8N_AGENT = 'n8n-agent',
}

export interface ImageFile {
  file: File;
  base64: string;
}
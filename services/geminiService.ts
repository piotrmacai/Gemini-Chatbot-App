import { GoogleGenAI, GenerateContentResponse, Content, Part, Modality } from "@google/genai";
import { Model, Message, Role, Source } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface ChatResponse {
  text: string;
  sources?: Source[];
}

const base64ToGenerativePart = (base64: string, mimeType: string): Part => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const runChat = async (
    model: Model.GEMINI_FLASH | Model.GEMINI_PRO, 
    history: Message[], 
    newMessage: string, 
    image?: string, 
    systemPrompt?: string
): Promise<ChatResponse> => {
    
    const contents: Content[] = history.map(msg => {
        const parts: Part[] = [];
        if (msg.image) {
            const mimeType = msg.image.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png';
            parts.push(base64ToGenerativePart(msg.image.split(',')[1], mimeType));
        }
        if (msg.text) {
             parts.push({ text: msg.text });
        }
        return {
            role: msg.role === Role.USER ? 'user' : 'model',
            parts: parts,
        };
    });

    const userMessageParts: Part[] = [];
    if (image) {
        const mimeType = image.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png';
        userMessageParts.push(base64ToGenerativePart(image.split(',')[1], mimeType));
    }
    if (newMessage) {
        userMessageParts.push({ text: newMessage });
    }

    contents.push({ role: 'user', parts: userMessageParts });
    
    const response = await ai.models.generateContent({
        model,
        contents,
        ...(systemPrompt && systemPrompt.trim() !== '' ? { config: { systemInstruction: systemPrompt } } : {}),
    });

    return { text: response.text };
};

export const runWebSearch = async (prompt: string): Promise<ChatResponse> => {
  const response = await ai.models.generateContent({
    model: Model.GEMINI_FLASH,
    contents: prompt,
    config: {
      tools: [{googleSearch: {}}],
    },
  });

  const sources: Source[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => ({
      uri: chunk.web.uri,
      title: chunk.web.title,
    }))
    .filter((source: Source) => source.uri && source.title) || [];
  
  return { text: response.text, sources };
};

export const generateImage = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateImages({
    model: Model.IMAGEN,
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '1:1',
    },
  });

  const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
  return `data:image/jpeg;base64,${base64ImageBytes}`;
};

export const editImage = async (prompt: string, image: string): Promise<string> => {
    const mimeType = image.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png';
    const base64Data = image.split(',')[1];

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: Model.GEMINI_IMAGE,
        contents: {
            parts: [
                { inlineData: { data: base64Data, mimeType } },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
          if (part.inlineData) {
              const base64ImageBytes: string = part.inlineData.data;
              return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
          }
      }
    }
    throw new Error("Image editing failed to produce an image.");
};

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

export const runN8NAgent = async (prompt: string, webhookUrl: string): Promise<ChatResponse> => {
  if (!webhookUrl || webhookUrl.trim() === '') {
    return { text: 'The n8n webhook URL is not configured. Please set it in the Profile Settings.' };
  }
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`n8n webhook failed with status ${response.status}. Response: ${errorText}`);
    }

    const data = await response.json();
    let responseText = '';

    // n8n often returns an array of items from the last node.
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      if (typeof firstItem === 'object' && firstItem !== null) {
        // Look for common response keys
        if (firstItem.response) responseText = firstItem.response;
        else if (firstItem.text) responseText = firstItem.text;
        else if (firstItem.answer) responseText = firstItem.answer;
        else if (firstItem.message) responseText = firstItem.message;
        else {
          // Fallback to stringifying the object
          responseText = `\`\`\`json\n${JSON.stringify(firstItem, null, 2)}\n\`\`\``;
        }
      } else if (typeof firstItem === 'string') {
        responseText = firstItem;
      }
    } else if (typeof data === 'object' && data !== null) { // Handle single object response
      if (data.response) responseText = data.response;
      else if (data.text) responseText = data.text;
      else if (data.answer) responseText = data.answer;
      else if (data.message) responseText = data.message;
      else {
        responseText = `\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
      }
    } else if (typeof data === 'string') { // Handle plain text response
      responseText = data;
    }

    if (!responseText) {
      responseText = `Received a response, but couldn't parse it. Raw response: \`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
    }
    
    return { text: responseText };
  } catch (error) {
    console.error("Error calling n8n agent:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { text: `Sorry, there was an error communicating with the n8n agent.\n\n**Details:**\n${errorMessage}\n\nPlease check if the n8n workflow is active, the URL is correct, and its CORS settings are configured to allow requests from this origin.` };
  }
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
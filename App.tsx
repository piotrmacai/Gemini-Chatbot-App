import React, { useState, useEffect, useCallback } from 'react';
import { Chat, Message, Role, Model, ImageFile, Source } from './types';
import LeftSidebar from './components/LeftSidebar';
import ChatView from './components/ChatView';
import RightSidebar from './components/RightSidebar';
import { runChat, generateImage, editImage, runWebSearch } from './services/geminiService';
import { MenuIcon, CanvaIcon } from './components/icons/MenuIcon';
import ProfileModal from './components/ProfileModal';
import ModelSelector from './components/ModelSelector';

const App: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>(Model.GEMINI_FLASH);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    // Load chats from local storage
    const savedChats = localStorage.getItem('gemini-clone-chats');
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    } else {
      createNewChat();
    }
  }, []);

  useEffect(() => {
    // Save chats to local storage whenever they change
    if (chats.length > 0) {
      localStorage.setItem('gemini-clone-chats', JSON.stringify(chats));
    }
  }, [chats]);
  
  useEffect(() => {
    if(activeChatId === null && chats.length > 0){
        setActiveChatId(chats[0].id)
    }
  }, [chats, activeChatId]);

  const activeChat = chats.find(chat => chat.id === activeChatId);

  const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      systemPrompt: 'You are a helpful assistant.',
      createdAt: Date.now(),
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const updateChat = (chatId: string, updates: Partial<Chat>) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, ...updates } : c));
  };

  const handleSaveSystemPrompt = (newPrompt: string) => {
    if (activeChatId) {
        updateChat(activeChatId, { systemPrompt: newPrompt });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!activeChatId) return;

    const currentChat = chats.find(chat => chat.id === activeChatId);
    if (!currentChat) return;

    const updatedMessages = currentChat.messages.filter(msg => msg.id !== messageId);
    updateChat(activeChatId, { messages: updatedMessages });
  };
  
  const handleSendMessage = useCallback(async (prompt: string, image?: ImageFile) => {
    if (!activeChatId || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: Role.USER,
      text: prompt,
      image: image?.base64,
    };

    const updatedMessages = [...(activeChat?.messages || []), userMessage];
    updateChat(activeChatId, { messages: updatedMessages });
    setIsLoading(true);

    try {
      let responseText = '';
      let responseImage: string | undefined = undefined;
      let responseSources: Source[] | undefined = undefined;
      
      const promptLower = prompt.toLowerCase();

      if (promptLower.startsWith('/generate ')) {
        const genPrompt = prompt.substring(10);
        responseImage = await generateImage(genPrompt);
        responseText = `Here is the generated image for: "${genPrompt}"`;
      } else if (promptLower.startsWith('/edit ') && image) {
        const editPrompt = prompt.substring(6);
        responseImage = await editImage(editPrompt, image.base64);
        responseText = `Here is the edited image based on your request: "${editPrompt}"`;
      } else if (selectedModel === Model.WEB_SEARCH) {
        const { text, sources } = await runWebSearch(prompt);
        responseText = text;
        responseSources = sources;
      } else if (selectedModel === Model.GEMINI_FLASH || selectedModel === Model.GEMINI_PRO) {
        const chatHistory = activeChat?.messages || [];
        const { text } = await runChat(selectedModel, chatHistory, prompt, image?.base64, activeChat?.systemPrompt);
        responseText = text;
      } else {
          // Fallback or specific model logic
          responseText = "This model does not support the current input type or command.";
      }

      const modelMessage: Message = {
        id: uuidv4(),
        role: Role.MODEL,
        text: responseText,
        image: responseImage,
        sources: responseSources,
      };

      if (responseSources && responseSources.length > 0) {
        setIsRightSidebarOpen(true);
      }

      updateChat(activeChatId, { messages: [...updatedMessages, modelMessage] });
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: Role.MODEL,
        text: 'Sorry, I ran into an error. Please try again.',
      };
      updateChat(activeChatId, { messages: [...updatedMessages, errorMessage] });
    } finally {
      setIsLoading(false);
    }
  }, [activeChatId, activeChat, isLoading, selectedModel]);


  return (
    <div className="flex h-screen w-screen bg-[#131314] overflow-hidden">
      <LeftSidebar
        isOpen={isLeftSidebarOpen}
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={createNewChat}
        onSelectChat={setActiveChatId}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />
      <div className="flex-1 flex flex-col relative">
        <header className="flex items-center justify-between p-2 md:p-4 bg-[#1e1f22] border-b border-gray-700">
          <div className="flex items-center space-x-2 flex-1">
            <button onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} className="p-2 rounded-full hover:bg-gray-700">
              <MenuIcon />
            </button>
            <h1 className="text-lg font-medium text-gray-200">{activeChat?.title || 'Gemini'}</h1>
          </div>
          <div className="flex-1 flex justify-center">
             <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
          </div>
           <div className="flex items-center space-x-2 flex-1 justify-end">
            <button onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} className="p-2 rounded-full hover:bg-gray-700">
              <CanvaIcon />
            </button>
          </div>
        </header>

        <ChatView
          chat={activeChat}
          onSendMessage={handleSendMessage}
          onDeleteMessage={handleDeleteMessage}
          isLoading={isLoading}
        />
      </div>
      <RightSidebar
        isOpen={isRightSidebarOpen}
        onClose={() => setIsRightSidebarOpen(false)}
        sources={activeChat?.messages.slice(-1)[0]?.sources}
      />
       <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        systemPrompt={activeChat?.systemPrompt || ''}
        onSave={handleSaveSystemPrompt}
      />
    </div>
  );
};

export default App;
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Particles } from '@/components/ui/particles';
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Markdown renderer for chat messages
const renderMarkdown = (content) => {
  const lines = content.split('\n');
  const elements = [];
  let tableLines = [];
  let inTable = false;

  const flushTable = () => {
    if (tableLines.length >= 2) {
      // Parse table (skip separator line)
      const headerLine = tableLines[0];
      const dataLines = tableLines.slice(2); // Skip header and separator
      
      const headers = headerLine.split('|')
        .map(h => h.trim())
        .filter(h => h.length > 0);
      
      const rows = dataLines.map(row => 
        row.split('|')
          .map(cell => cell.trim())
          .filter(cell => cell.length > 0)
      ).filter(row => row.length > 0);

      if (headers.length > 0 && rows.length > 0) {
        elements.push(
          <div key={elements.length} className="my-3 overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  {headers.map((header, i) => (
                    <th key={i} className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left font-semibold">
                      <span dangerouslySetInnerHTML={{ __html: header.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    {row.map((cell, j) => (
                      <td key={j} className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                        <span dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      tableLines = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmedLine = line.trim();
    
    // Detect table rows (must have at least 2 pipes)
    if (line.includes('|') && (line.match(/\|/g) || []).length >= 2) {
      if (!inTable) {
        inTable = true;
      }
      tableLines.push(line);
    } else {
      // Flush any pending table
      if (inTable) {
        flushTable();
        inTable = false;
      }

      // Handle regular lines
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Handle bullet points
      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || (trimmedLine.startsWith('*') && !trimmedLine.startsWith('**'))) {
        elements.push(
          <div key={`line-${i}`} className="ml-4 my-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />
        );
      } else if (trimmedLine) {
        elements.push(
          <div key={`line-${i}`} dangerouslySetInnerHTML={{ __html: formattedLine }} />
        );
      } else {
        elements.push(<div key={`line-${i}`} className="h-2" />);
      }
    }
  });

  // Flush any remaining table
  if (inTable) {
    flushTable();
  }

  return elements;
};

const FinanceChatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hello! I'm your AI Finance Advisor powered by Gemini. I can help you with:\n\n• Investment advice (stocks, mutual funds, index funds)\n• Budget planning & savings strategies\n• Tax optimization tips\n• Portfolio analysis\n• Market insights (Nifty 50, Sensex)\n\nWhat would you like to know about your finances?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText = input) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      // Call the new chatbot API endpoint
      const response = await axios.post(`${apiUrl}/chatbot/query`, {
        userId: user?.id,
        query: messageText
      });

      if (response.data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: response.data.metadata.timestamp,
          userData: response.data.metadata.userData
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get response';
      toast.error(errorMessage);
      
      const fallbackMessage = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-center gap-3">
      {/* ASK FINAI Banner */}
      <div className="px-4 py-1.5 bg-white text-black font-bold text-xs rounded-full shadow-lg">
        ASK FINAI
      </div>
      
      {/* Custom Chat Toggle Button */}
      <button
        onClick={() => {
          const chatPanel = document.querySelector('[data-chat-panel]');
          if (chatPanel) {
            chatPanel.click();
          }
        }}
        className="w-20 h-20 rounded-full bg-black border-4 border-white shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center p-3 relative overflow-hidden group"
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        
        {/* Logo */}
        <img 
          src="/logo.png" 
          alt="FinAI" 
          className="w-full h-full object-contain relative z-10" 
        />
        
        {/* Pulse indicator */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
      </button>
      
      <ExpandableChat 
        size="lg" 
        position="bottom-right"
        className="[&_button[data-state]]:hidden"
      >
      <ExpandableChatHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="FinAI" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-semibold">FinAI Assistant</h2>
            <p className="text-xs text-muted-foreground">Your Financial Advisor</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Online
        </div>
      </ExpandableChatHeader>

      <ExpandableChatBody className="p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChatBubble variant={message.role === 'user' ? 'sent' : 'received'}>
                  {message.role === 'assistant' && (
                    <ChatBubbleAvatar
                      src=""
                      fallback="AI"
                      className="bg-gradient-to-br from-blue-500 to-cyan-500"
                    />
                  )}
                  <ChatBubbleMessage variant={message.role === 'user' ? 'sent' : 'received'}>
                    <div className="text-sm whitespace-pre-wrap markdown-content">
                      {renderMarkdown(message.content)}
                    </div>
                    <p className="text-xs opacity-50 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </ChatBubbleMessage>
                  {message.role === 'user' && (
                    <ChatBubbleAvatar
                      src=""
                      fallback={user?.name?.charAt(0) || 'U'}
                      className="bg-gradient-to-br from-blue-500 to-cyan-500"
                    />
                  )}
                </ChatBubble>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ChatBubble variant="received">
                <ChatBubbleAvatar
                  src=""
                  fallback="AI"
                  className="bg-gradient-to-br from-blue-500 to-cyan-500"
                />
                <ChatBubbleMessage variant="received" isLoading />
              </ChatBubble>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ExpandableChatBody>

      <ExpandableChatFooter>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about finance..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-2">
          FinAI provides general information. Consult a professional for personalized advice.
        </p>
      </ExpandableChatFooter>
    </ExpandableChat>
    </div>
  );
};

export default FinanceChatbot;

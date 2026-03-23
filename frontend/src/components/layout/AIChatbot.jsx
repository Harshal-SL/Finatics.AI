import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, MessageCircle, X, Send } from "lucide-react";

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "Hi! I'm your AI Finance Assistant. How can I help you manage your finances today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: inputValue,
      timestamp: new Date()
    };

    // Simulate AI response
    const botResponse = {
      id: messages.length + 2,
      type: "bot",
      content: getAIResponse(inputValue),
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputValue("");

    // Add bot response after a short delay
    setTimeout(() => {
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getAIResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes("expense") || lowerInput.includes("spending")) {
      return "I can help you track and categorize your expenses. Your monthly expenses are $2,340.50 this month. Would you like me to show your spending breakdown by category?";
    } else if (lowerInput.includes("save") || lowerInput.includes("saving")) {
      return "Great question about savings! You're currently saving $1,200 monthly. Based on your spending patterns, I recommend increasing your emergency fund to 6 months of expenses. Would you like a personalized savings plan?";
    } else if (lowerInput.includes("invest") || lowerInput.includes("stock")) {
      return "Your investment portfolio is performing well with a +12.3% gain this month. I notice AAPL is showing strong buy signals. Would you like me to analyze your portfolio balance or suggest new investment opportunities?";
    } else if (lowerInput.includes("goal") || lowerInput.includes("plan")) {
      return "Let's work on your financial goals! I can help you create a plan for saving for a house, vacation, or retirement. What specific goal would you like to focus on?";
    } else if (lowerInput.includes("loan") || lowerInput.includes("debt")) {
      return "I can analyze loan options for you. Based on your income and credit profile, you may qualify for rates between 6.5-8.5%. What type of loan are you considering?";
    } else {
      return "I'm here to help with all your financial questions! I can assist with expense tracking, investment advice, savings goals, loan analysis, and financial planning. What would you like to know more about?";
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-success shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 h-96 shadow-2xl border-0 z-50 bg-card/95 backdrop-blur-sm">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary to-success text-primary-foreground rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <CardTitle className="text-lg">Finatics.AI Assistant</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 flex flex-col h-full">
            {/* Messages */}
            <ScrollArea className="flex-1 mb-4 pr-2">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        message.type === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about your finances..."
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-gradient-to-r from-primary to-success"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default AIChatbot;
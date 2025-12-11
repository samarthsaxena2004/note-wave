import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, FileText } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatComponentProps {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function ChatComponent({ 
  messages, 
  input, 
  handleInputChange, 
  handleSubmit, 
  isLoading 
}: ChatComponentProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto w-full">
      <Card className="flex-1 mb-4 overflow-hidden border-slate-200 shadow-sm">
        <ScrollArea className="h-full p-4">
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4">
                <FileText className="w-12 h-12 opacity-20" />
                <p>Ready to analyze your document.</p>
              </div>
            )}
            
            {messages.map((m, index) => (
              <div
                key={index}
                className={`flex gap-4 ${
                  m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <Avatar className={`w-8 h-8 ${m.role === 'user' ? 'bg-blue-600' : 'bg-green-600'}`}>
                  <AvatarFallback className="text-white text-xs">
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`flex-1 rounded-lg p-4 text-sm leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-100 text-slate-800'
                  }`}
                >
                  {/* THIS IS THE MAGIC PART: Renders Markdown properly */}
                  {m.role === 'user' ? (
                    <p>{m.content}</p>
                  ) : (
                    // FIX: className moved to a wrapper div
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:bg-slate-100 prose-pre:p-2 prose-pre:rounded">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                          strong: ({node, ...props}) => <span className="font-bold text-slate-900" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          // NEW: Style links to be blue, underlined, and open in new tab
                          a: ({node, ...props}) => (
                            <a 
                              className="text-blue-600 hover:underline cursor-pointer" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              {...props} 
                            />
                          ),
                        }}
                        >
                          {m.content}
                        </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* Invisible div for scrolling target */}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </Card>

      <form onSubmit={handleSubmit} className="flex gap-3 items-center bg-white p-4 rounded-xl border shadow-sm">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question about your PDF..."
          className="flex-1 bg-slate-50 border-slate-200 focus:ring-blue-500"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
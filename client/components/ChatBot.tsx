import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { CivicClassifierService } from '@/services/civicClassifier';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatBotProps {
  apiUrl?: string; // You can provide your API URL here
  gptApiKey?: string; // Your OpenAI API key for classification
}

export default function ChatBot({ apiUrl, gptApiKey }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your CivicTrack assistant. I can help classify civic issues, enhance report titles, determine urgency levels, and guide you through the platform. Try describing an issue like "broken streetlight on main street" and I\'ll classify it for you!',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize classifier service if API key is provided
  const classifier = gptApiKey ? new CivicClassifierService('https://api.openai.com/v1/chat/completions', gptApiKey) : null;

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // If API URL is provided, make actual API call
      if (apiUrl) {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: input }),
        });

        const data = await response.json();
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response || 'Sorry, I couldn\'t process that request.',
          isUser: false,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        // Civic Issue Classifier & Enhancer responses
        setTimeout(async () => {
          let response = '';

          // Check if user is describing an actual issue to classify
          const lowerInput = input.toLowerCase();
          const issueKeywords = ['pothole', 'light', 'water', 'garbage', 'electric', 'drain', 'safety', 'broken', 'damaged', 'leak', 'out', 'not working'];
          const hasIssueKeywords = issueKeywords.some(keyword => lowerInput.includes(keyword));

          if (hasIssueKeywords && input.length > 10) {
            // Try to classify the issue
            try {
              let classification;
              if (classifier) {
                // Use real API classification
                classification = await classifier.classifyIssue({
                  title: input,
                  description: input,
                });
              } else {
                // Use demo classification
                const demoClassifier = new CivicClassifierService('', '');
                classification = demoClassifier.getDemoClassification({
                  title: input,
                  description: input,
                });
              }

              if (classification) {
                response = `🎯 **Issue Classification:**

📂 **Category:** ${classification.category}
📝 **Suggested Title:** ${classification.suggested_title}
📋 **Summary:** ${classification.summary}
🏷️ **Tags:** ${classification.tags.join(', ')}
⚠️ **Urgency:** ${classification.urgency}

${classification.urgency === 'High' ? '🔴 This appears to be a high-priority issue that needs immediate attention!' :
  classification.urgency === 'Medium' ? '🟡 This is a moderate priority issue.' :
  '🟢 This is a low priority issue but still important for community improvement.'}

Would you like help reporting this issue through our platform?`;
              } else {
                response = 'I had trouble classifying that issue. Could you provide more details about the problem you\'re experiencing?';
              }
            } catch (error) {
              response = 'I encountered an error while classifying your issue. Please try describing it differently or contact support.';
            }
          } else if (lowerInput.includes('classify') || lowerInput.includes('category') || lowerInput.includes('report')) {
            response = `I can help classify your civic issue! Here are the categories we support:

🛣️ **Road** - Potholes, road damage, traffic signs
💡 **Streetlight** - Broken lights, dark areas
🚰 **Water Supply** - Leaks, no water, quality issues
🗑️ **Sanitation** - Garbage, cleanliness, waste management
⚡ **Electricity** - Power outages, electrical hazards
🌊 **Drainage** - Blocked drains, flooding
⚠️ **Public Safety** - Security concerns, safety hazards
📋 **Other** - Any other civic concerns

Just describe your issue and I'll help categorize it and suggest improvements!`;
          } else if (lowerInput.includes('urgent') || lowerInput.includes('priority')) {
            response = `Issue urgency levels:

🔴 **High** - Immediate safety threats, major infrastructure failure
🟡 **Medium** - Significant inconvenience, moderate safety concerns
🟢 **Low** - Minor issues, aesthetic improvements

I can help determine the urgency of your civic issue!`;
          } else if (lowerInput.includes('help') || lowerInput.includes('how')) {
            response = `I'm your CivicTrack assistant! I can help you:

✅ Classify civic issues into proper categories
✅ Enhance issue titles for clarity
✅ Determine urgency levels
✅ Navigate the platform
✅ Understand reporting process

Try asking: "How do I report a pothole?" or "Classify my streetlight issue"`;
          } else {
            // General helpful responses
            const responses = [
              'I can help you classify and enhance your civic issue reports. What type of issue would you like to report?',
              'Need help categorizing a civic problem? I can assist with proper classification and urgency assessment.',
              'I\'m here to help improve your civic reports. Describe your issue and I\'ll suggest the best category and title.',
              'Having trouble with the platform? I can guide you through reporting issues and tracking progress.',
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
          }

          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: response,
            isUser: false,
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, botMessage]);
          setLoading(false);
        }, 1000);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-40 h-14 w-14 rounded-full shadow-lg cta-button"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 left-6 z-50 w-80 h-96 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-gradient-to-r from-primary to-accent text-white rounded-t-lg">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-4 w-4" />
              CivicTrack Assistant
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex flex-col h-80 p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 text-sm ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!message.isUser && <Bot className="h-4 w-4 mt-1 flex-shrink-0" />}
                      <div className="flex-1">
                        <p>{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      {message.isUser && <User className="h-4 w-4 mt-1 flex-shrink-0" />}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button onClick={sendMessage} size="icon" disabled={loading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

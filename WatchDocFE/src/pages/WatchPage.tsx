import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Send, ArrowLeft, ExternalLink, MessageSquare, Bot, User, Settings, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getWatches, updateWatch, getWatchById } from '@/lib/storage';
import { getDomainFromUrl } from '@/lib/validation';
import { WatchItem } from '@/types';
import { GeminiChat } from '@/lib/gemini';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Helper function to format inline markdown
const formatInlineMarkdown = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '$1') // Remove asterisks entirely
    .replace(/`(.*?)`/g, '<code class="bg-black/10 px-1 py-0.5 rounded text-xs font-mono">$1</code>');
};

export default function WatchPage() {
  console.log('WatchPage component loaded');
  const { id } = useParams<{ id: string }>();
  console.log('ID from params:', id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const previewUrl = searchParams.get('url');
  const urlParam = searchParams.get('url');
  console.log('URL from params:', urlParam);

  const [watch, setWatch] = useState<WatchItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [geminiChat, setGeminiChat] = useState<GeminiChat | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [alertLevel, setAlertLevel] = useState<'critical' | 'high' | 'low'>('high');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load watch data and initialize Gemini chat
  useEffect(() => {
    console.log('useEffect loadWatch called with id:', id);
    const loadWatch = async () => {
      // Preview mode - create temporary watch object from URL parameter
      if (previewUrl && !id) {
        const tempWatch: WatchItem = {
          // Using a string ID here avoids number/string type mismatches with storage APIs
          id: 'preview',
          title: getDomainFromUrl(previewUrl),
          desc: 'Preview mode - monitoring not yet active',
          url: previewUrl,
          status: 'preview' as any,
          // Optional metadata commonly found on WatchItem in many codebases
          created_date: new Date().toISOString(),
          latest_scan: {
            // Some implementations expect a shape here; values are placeholders for preview mode
            id: 'preview-scan',
            changes: false,
            change_level: 'none',
            change_summary: 'Preview mode - no scans yet',
            current_summary: 'Preview mode',
            scan_date: new Date().toISOString(),
          },
        } as unknown as WatchItem;

        setWatch(tempWatch);

        try {
          // Initialize Gemini chat for preview URL
          const chat = new GeminiChat(previewUrl);
          setGeminiChat(chat);

          setMessages([
            {
              id: '1',
              role: 'assistant',
              content: `Hello! I'm here to help you monitor and track changes on ${getDomainFromUrl(previewUrl)}. 

I can help you set up monitoring for various aspects of this website. To get started, could you tell me what specific content or changes you're most interested in tracking? For example:
- Are you looking to monitor specific text content?
- Do you want to track when new pages or posts are added?
- Are you interested in changes to product information or pricing?
- Or something else entirely?

What would be most valuable for you to know about when it changes on this site?`,
              timestamp: new Date(),
            },
          ]);
        } catch (error) {
          console.error('Failed to initialize Gemini chat:', error);
          setMessages([
            {
              id: '1',
              role: 'assistant',
              content: `Hello! I'm here to help you monitor and analyze ${getDomainFromUrl(previewUrl)}. What would you like to know about this website?`,
              timestamp: new Date(),
            },
          ]);
        }

        return; // done with preview mode
      }

      // Load existing watch from storage by ID
      if (id) {
        console.log('Loading watch with ID:', id);
        // Try numeric ID first using getWatchById (async), then fall back to getWatches string match
        let foundWatch: WatchItem | null = null;

        const numericId = Number(id);
        if (!Number.isNaN(numericId)) {
          try {
            const byId = await getWatchById(numericId);
            if (byId) foundWatch = byId;
          } catch {
            // ignore and fall back below
          }
        }

        if (!foundWatch) {
          try {
            const watches = await getWatches();
            foundWatch = watches.find((w: WatchItem) => String(w.id) === String(id)) || null;
          } catch {
            // ignore
          }
        }

        if (foundWatch) {
          console.log('Found watch:', foundWatch);
          setWatch(foundWatch);

          try {
            const chat = new GeminiChat(foundWatch.url);
            setGeminiChat(chat);

            setMessages([
              {
                id: '1',
                role: 'assistant',
                content: `Hello! I'm here to help you monitor and track changes on ${getDomainFromUrl(foundWatch.url)}. 

I can help you set up monitoring for various aspects of this website. To get started, could you tell me what specific content or changes you're most interested in tracking? For example:
- Are you looking to monitor specific text content?
- Do you want to track when new pages or posts are added?
- Are you interested in changes to product information or pricing?
- Or something else entirely?

What would be most valuable for you to know about when it changes on this site?`,
                timestamp: new Date(),
              },
            ]);
          } catch (error) {
            console.error('Failed to initialize Gemini chat:', error);
            setMessages([
              {
                id: '1',
                role: 'assistant',
                content: `Hello! I'm here to help you monitor and analyze ${getDomainFromUrl(foundWatch.url)}. What would you like to know about this website?`,
                timestamp: new Date(),
              },
            ]);
          }
        } else {
          console.log('No watch found, redirecting to home');
          navigate('/');
        }

        return;
      }

      // If no ID is provided, create a temporary watch for testing
      console.log('No ID provided, creating temporary watch');
      const watchUrl = urlParam || 'https://example.com';
      const tempWatch: WatchItem = {
        id: 999, // temporary ID
        title: getDomainFromUrl(watchUrl),
        desc: 'Temporary watch for testing',
        url: watchUrl,
        status: 'active',
        created_date: new Date().toISOString(),
        latest_scan: {
          id: 1,
          changes: false,
          change_level: 'none',
          change_summary: 'No changes detected',
          current_summary: 'Test summary',
          scan_date: new Date().toISOString(),
          additions: [],
          deletions: [],
          modifications: [],
        },
      };

      setWatch(tempWatch);

      try {
        const chat = new GeminiChat(tempWatch.url);
        setGeminiChat(chat);

        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: `Hello! I'm here to help you monitor and track changes on ${getDomainFromUrl(tempWatch.url)}. This is a test mode. You can try the "Create WatchDoc" button to test the API integration.`,
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error('Failed to initialize Gemini chat:', error);
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: 'Hello! This is test mode. You can try the Create WatchDoc button to test the API integration.',
            timestamp: new Date(),
          },
        ]);
      }
    };

    loadWatch();
  }, [id, navigate, urlParam]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !watch) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let response: string;

      if (geminiChat) {
        response = await geminiChat.sendMessage(inputMessage.trim());
      } else {
        // Fallback response if Gemini is not available
        response = `I understand you want to track "${inputMessage.trim()}" on ${
          watch?.url ? getDomainFromUrl(watch.url) : 'this website'
        }. However, I'm currently running in demo mode. To enable full AI assistance, please add your Gemini API key to the .env file.`;
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      // Fallback error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting to the AI service right now. Please try again in a moment.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateWatchDoc = async () => {
    console.log('handleCreateWatchDoc called');
    console.log('watch:', watch);
    console.log('isCreating:', isCreating);
    
    if (!watch || isCreating) {
      console.log('Early return: watch is null or already creating');
      return;
    }

    console.log('Setting isCreating to true');
    setIsCreating(true);

    try {
      console.log('Sending POST request to create document:', { url: watch.url, title: watch.title });
      
      // Send POST request to create document and scan
      const response = await fetch('http://localhost:8000/createDocumentAndScan/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: watch.url,
          title: watch.title,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Document created successfully:', result);

    } catch (error) {
      console.error('Error creating watch document:', error);
      // You might want to show a toast notification or error message to the user here
      alert(`Error creating watch document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      console.log('Setting isCreating to false and navigating home');
      setIsCreating(false);
      navigate('/');
    }
  };

  if (!watch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const domainLabel = watch?.url ? getDomainFromUrl(watch.url) : 'Loading...';

  return (
    <div className="min-h-screen bg-background relative animate-slide-in-left">
      {/* Animated Background */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            'url(https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1.05&cAzimuthAngle=180&cDistance=2.9&cPolarAngle=120&cameraZoom=1&color1=%23dbf8ff&color2=%23ffffff&color3=%23dbf8ff&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=1&positionX=0&positionY=1.8&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=-90&shader=defaults&type=waterPlane&uDensity=1&uFrequency=5.5&uSpeed=0.1&uStrength=3&uTime=0.2&wireframe=false)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Blur and Noise Overlay */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px',
          opacity: 0.1,
        }}
      />

      {/* Header */}
      <div className="relative z-10 p-4 sm:p-6 border-b border-border/50 bg-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="bg-white/90 backdrop-blur-sm hover:bg-white/95"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/20 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              </div>
              <span className="font-mono text-sm text-muted-foreground">{domainLabel}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => watch?.url && window.open(watch.url, '_blank')}
            disabled={!watch?.url}
            className="bg-white/90 backdrop-blur-sm hover:bg-white/95"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit Site
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-[calc(100vh-80px)]">
        {/* Left Side - Chat or Settings */}
        <div className="w-1/2 border-r border-border/50 bg-white/5 backdrop-blur-sm">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-border/50 bg-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    {showSettings ? (
                      <Settings className="h-5 w-5 text-primary" />
                    ) : (
                      <MessageSquare className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {showSettings ? 'Settings' : 'AI Assistant'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {showSettings ? 'Configure your watch settings' : 'Ask me anything about this website'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white/95"
                >
                  {showSettings ? <MessageSquare className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Content */}
            {showSettings ? (
              <div className="flex-1 flex flex-col p-4 sm:p-6">
                <div className="space-y-6 flex-1">
                  {/* Watch Title */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Watch Title</label>
                    <Input value={domainLabel} readOnly className="bg-white/90 backdrop-blur-sm" />
                  </div>

                  {/* Current URL */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Current URL</label>
                    <Input value={watch?.url || ''} readOnly className="bg-white/90 backdrop-blur-sm" />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Username</label>
                    <Input placeholder="Enter username for this website" className="bg-white/90 backdrop-blur-sm" />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Password</label>
                    <Input
                      type="password"
                      placeholder="Enter password for this website"
                      className="bg-white/90 backdrop-blur-sm"
                    />
                  </div>

                  {/* Alert Level */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Alert Level</label>
                    <Select
                      value={alertLevel}
                      onValueChange={(value: 'critical' | 'high' | 'low') => setAlertLevel(value)}
                    >
                      <SelectTrigger className="bg-white/90 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Create Watch Doc Button - Fixed at bottom */}
                <div className="mt-6">
                  <Button
                    onClick={handleCreateWatchDoc}
                    className="w-full bg-black text-white hover:bg-gray-800"
                    size="lg"
                    disabled={isCreating}
                    title={isCreating ? 'Creating...' : 'Create Watch Doc'}
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      'Create WatchDoc'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <ScrollArea className="flex-1 p-4 sm:p-6">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-white/90 backdrop-blur-sm text-foreground'
                        }`}
                      >
                        <div className="text-sm leading-relaxed">
                          {message.role === 'assistant' ? (
                            <div className="space-y-2">
                              {message.content.split('\n\n').map((paragraph, index) => {
                                if (paragraph.trim() === '') return null;

                                // Handle lists
                                if (paragraph.includes('\n- ') || paragraph.startsWith('- ')) {
                                  const lines = paragraph.split('\n');
                                  const listItems = lines
                                    .filter((line) => line.trim().startsWith('- '))
                                    .map((line) => line.replace(/^- /, '').trim());

                                  if (listItems.length > 0) {
                                    return (
                                      <ul key={index} className="list-disc list-inside space-y-1 ml-4">
                                        {listItems.map((item, itemIndex) => (
                                          <li key={itemIndex} className="text-sm">
                                            <span
                                              dangerouslySetInnerHTML={{
                                                __html: formatInlineMarkdown(item),
                                              }}
                                            />
                                          </li>
                                        ))}
                                      </ul>
                                    );
                                  }
                                }

                                // Handle blockquotes
                                if (paragraph.startsWith('> ')) {
                                  return (
                                    <blockquote
                                      key={index}
                                      className="border-l-2 border-primary/30 pl-3 italic text-sm"
                                    >
                                      <span
                                        dangerouslySetInnerHTML={{
                                          __html: formatInlineMarkdown(paragraph.replace(/^> /, '')),
                                        }}
                                      />
                                    </blockquote>
                                  );
                                }

                                // Handle headings
                                if (paragraph.startsWith('### ')) {
                                  return (
                                    <h3 key={index} className="text-sm font-semibold mb-1">
                                      <span
                                        dangerouslySetInnerHTML={{
                                          __html: formatInlineMarkdown(paragraph.replace(/^### /, '')),
                                        }}
                                      />
                                    </h3>
                                  );
                                }

                                if (paragraph.startsWith('## ')) {
                                  return (
                                    <h2 key={index} className="text-sm font-bold mb-2">
                                      <span
                                        dangerouslySetInnerHTML={{
                                          __html: formatInlineMarkdown(paragraph.replace(/^## /, '')),
                                        }}
                                      />
                                    </h2>
                                  );
                                }

                                if (paragraph.startsWith('# ')) {
                                  return (
                                    <h1 key={index} className="text-base font-bold mb-2">
                                      <span
                                        dangerouslySetInnerHTML={{
                                          __html: formatInlineMarkdown(paragraph.replace(/^# /, '')),
                                        }}
                                      />
                                    </h1>
                                  );
                                }

                                // Regular paragraphs
                                return (
                                  <p key={index} className="text-sm leading-relaxed whitespace-pre-wrap">
                                    <span
                                      dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(paragraph) }}
                                    />
                                  </p>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          )}
                        </div>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            )}

            {/* Input - Only show when not in settings */}
            {!showSettings && (
              <div className="p-4 sm:p-6 border-t border-border/50 bg-white/10 backdrop-blur-sm">
                <div className="flex gap-3">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask about this website..."
                    className="flex-1 bg-white/90 backdrop-blur-sm"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-white/90 backdrop-blur-sm hover:bg-white/95"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Preview */}
        <div className="w-1/2 bg-white/5 backdrop-blur-sm">
          <div className="h-full flex flex-col">
            {/* Preview Header */}
            <div className="p-4 sm:p-6 border-b border-border/50 bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ExternalLink className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Live Preview</h2>
                  <p className="text-sm text-muted-foreground">Real-time website monitoring</p>
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 p-4 sm:p-6">
              <Card className="h-full bg-white/90 backdrop-blur-sm border border-border">
                <CardContent className="h-full p-0">
                  <div className="h-full relative">
                    <iframe
                      src={watch.url}
                      className="w-full h-full rounded-lg"
                      sandbox="allow-same-origin allow-scripts"
                      title="Website preview"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    {/* Fallback message - hidden by default */}
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/20 rounded-lg" style={{ display: 'none' }}>
                      <div className="text-center p-8">
                        <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <ShieldAlert className="h-8 w-8 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Preview Not Available</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          This website blocks embedding for security, but you can still monitor it!
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(watch.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in New Tab
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
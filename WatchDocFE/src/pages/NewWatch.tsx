import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Play, AlertCircle, CheckCircle, ExternalLink, Link2, ShieldAlert, Clock, Trash2, Plus, Activity, TrendingUp, TrendingDown, Minus, AlertTriangle, Shield, Zap, Settings, MessageSquare, Bot, User, Send, ArrowLeft, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isHttpUrl, getDomainFromUrl } from '@/lib/validation';
import { addWatch, getWatches, deleteWatch } from '@/lib/storage';
import { WatchItem, PreviewStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { GeminiTopicChat } from '@/lib/gemini';

export default function NewWatch() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>('invalid');
  const [isLoading, setIsLoading] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [recentWatches, setRecentWatches] = useState<WatchItem[]>([]);
  const [showSummarySettings, setShowSummarySettings] = useState(false);
  const [frequency, setFrequency] = useState('daily');
  const [voice, setVoice] = useState('Morning dad');
  const [detailLevel, setDetailLevel] = useState('medium');
  const [inputMode, setInputMode] = useState<'url' | 'chat'>('url');
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant' | 'tool';
    content: string;
    foundUrl?: string;
    groundingMetadata?: any;
  }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatSectionRef = useRef<HTMLDivElement>(null);
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);
  const previewSectionRef = useRef<HTMLDivElement>(null);
  const geminiChatRef = useRef<GeminiTopicChat | null>(null);

  // Load recent watches
  useEffect(() => {
    const loadWatches = async () => {
      const watches = await getWatches();
      setRecentWatches(watches.slice(0, 6));
    };
    loadWatches();
  }, []);

  // Initialize AI chat when switching to chat mode
  useEffect(() => {
    if (inputMode === 'chat') {
      // Initialize Gemini chat if not already done
      if (!geminiChatRef.current) {
        geminiChatRef.current = new GeminiTopicChat();
        
        // Add initial greeting message
        if (chatMessages.length === 0) {
          const greetingMessage = {
            id: 'greeting',
            role: 'assistant' as const,
            content: `Hi! I'm here to help you discover websites to monitor. 🎯

Tell me what you'd like to track - it could be:
- **Stock prices** or financial data
- **Product updates** or releases
- **News** about a specific topic
- **Documentation** or technical changes
- **Competitor** activity
- Or anything else you're interested in!

What would you like to keep an eye on?`
          };
          setChatMessages([greetingMessage]);
        }
      }
      
      // Scroll to chat section
      if (chatSectionRef.current) {
        setTimeout(() => {
          chatSectionRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 100);
      }
    }
  }, [inputMode]);

  // Scroll to preview when it appears
  useEffect(() => {
    if (inputMode === 'url' && url.trim() && previewSectionRef.current) {
      setTimeout(() => {
        previewSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 200);
    }
  }, [url, inputMode]);

  // Auto-scroll to latest message in chat
  useEffect(() => {
    if (chatMessagesContainerRef.current && inputMode === 'chat' && chatMessages.length > 0) {
      // Scroll the chat container to the bottom, not the whole page
      setTimeout(() => {
        if (chatMessagesContainerRef.current) {
          chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [chatMessages, inputMode]);

  // Validate URL on change
  useEffect(() => {
    if (url.trim()) {
      const isValid = isHttpUrl(url.trim());
      setPreviewStatus(isValid ? 'valid' : 'invalid');
      setUrlError(isValid ? '' : 'Please enter a valid URL starting with http:// or https://');
    } else {
      setPreviewStatus('invalid');
      setUrlError('');
    }
  }, [url]);

  const handlePreview = async () => {
    if (!isHttpUrl(url.trim())) return;
    
    setIsLoading(true);
    setPreviewStatus('loading');
    
    // Simulate loading time
    setTimeout(() => {
      setPreviewStatus('valid');
      setIsLoading(false);
    }, 1500);
  };

  const handleStartWatching = async () => {
    if (!isHttpUrl(url.trim())) return;

    const domain = getDomainFromUrl(url.trim());
    toast({
      title: "Starting to watch",
      description: domain,
    });
    
    // Navigate directly to WatchPage with URL as a parameter
    navigate(`/watch/preview/live?url=${encodeURIComponent(url.trim())}`);
  };

  const handleDeleteWatch = async (id: number) => {
    const success = await deleteWatch(id);
    if (success) {
      const watches = await getWatches();
      setRecentWatches(watches.slice(0, 6));
      toast({
        title: "Deleted",
        description: "Watch has been removed",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete watch",
        variant: "destructive",
      });
    }
  };

  const handleStartTracking = (url: string) => {
    toast({
      title: "Starting to track",
      description: getDomainFromUrl(url),
    });
    navigate(`/watch/preview/live?url=${encodeURIComponent(url)}`);
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessageContent = chatInput.trim();
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: userMessageContent
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      // Check if Gemini chat is initialized
      if (!geminiChatRef.current) {
        throw new Error('AI chat not initialized. Please refresh the page.');
      }

      // Add a "thinking" tool indicator message
      const thinkingMessageId = `tool-${Date.now()}`;
      const thinkingMessage = {
        id: thinkingMessageId,
        role: 'tool' as const,
        content: 'Finding the best website for you...'
      };
      setChatMessages(prev => [...prev, thinkingMessage]);

      // Send message to Gemini and get response
      const { response, foundUrl } = await geminiChatRef.current.sendMessage(userMessageContent);

      // Remove thinking indicator and add real response
      setChatMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== thinkingMessageId);
        
        // Add the AI response with foundUrl if available
        return [
          ...filtered,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant' as const,
            content: response,
            foundUrl: foundUrl // Store the URL for the confirmation button
          }
        ];
      });
    } catch (error) {
      console.error('Chat error:', error);
      
      // Remove searching indicator if present
      setChatMessages(prev => prev.filter(msg => !msg.id.startsWith('tool-')));
      
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant' as const,
        content: `❌ Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or enter a URL directly.`
      };
      setChatMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to process your request',
        variant: "destructive",
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getHealthIndicator = (watch: WatchItem) => {
    const { latest_scan } = watch;
    if (!latest_scan) {
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        text: 'No scan',
        description: 'No scans available yet'
      };
    }

    if (latest_scan.changes) {
      const level = latest_scan.change_level?.toLowerCase();
      if (level === 'major' || level === 'high') {
        return {
          icon: <TrendingUp className="h-4 w-4" />,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          text: 'Major changes',
          description: latest_scan.change_summary || 'Major changes detected'
        };
      } else if (level === 'moderate' || level === 'medium') {
        return {
          icon: <Activity className="h-4 w-4" />,
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
          text: 'Moderate changes',
          description: latest_scan.change_summary || 'Moderate changes detected'
        };
      } else {
        return {
          icon: <TrendingDown className="h-4 w-4" />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          text: 'Minor changes',
          description: latest_scan.change_summary || 'Minor changes detected'
        };
      }
    } else {
      return {
        icon: <Shield className="h-4 w-4" />,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        text: 'Stable',
        description: 'No changes detected'
      };
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = () => {
    switch (previewStatus) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (previewStatus) {
      case 'valid':
        return 'Valid';
      case 'invalid':
        return 'Invalid';
      case 'loading':
        return 'Loading...';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: 'url(https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1.05&cAzimuthAngle=180&cDistance=2.9&cPolarAngle=120&cameraZoom=1&color1=%23dbf8ff&color2=%23ffffff&color3=%23dbf8ff&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=1&positionX=0&positionY=1.8&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=-90&shader=defaults&type=waterPlane&uDensity=1&uFrequency=5.5&uSpeed=0.1&uStrength=3&uTime=0.2&wireframe=false)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Blur and Noise Overlay */}
      <div 
        className="absolute inset-0 backdrop-blur-sm"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px',
          opacity: 0.1,
        }}
      />
      
      {/* Top Bar - Split into 3 divs */}
      <div className="relative z-10 flex w-full">
        {/* Left Side - Lightning Icon */}
        <div className="p-4 sm:p-6 border-b border-r border-border/50 bg-white/10 backdrop-blur-sm flex items-center justify-start">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSummarySettings(!showSummarySettings)}
            className="w-12 h-12 bg-transparent flex items-center justify-center hover:bg-primary/10 transition-all duration-300"
          >
            <Zap className="h-7 w-7 text-primary" />
          </Button>
        </div>

        {/* Center - Watch Docs Logo */}
        <div className="p-4 sm:p-6 border-b border-border/50 bg-white/10 backdrop-blur-sm flex items-center justify-center flex-1">
          <h1 className="font-instrument text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text">
            Watch Docs
          </h1>
        </div>

        {/* Right Side - Eye Icon and Visit Site */}
        <div className="p-4 sm:p-6 border-b border-l border-border/50 bg-white/10 backdrop-blur-sm flex items-center justify-end">
          <div className="flex items-center gap-3">
            {url.trim() && isHttpUrl(url.trim()) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(url.trim(), '_blank')}
                className="bg-white/90 backdrop-blur-sm hover:bg-white/95 border-2"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Site
              </Button>
            )}
            <div className="w-12 h-12 bg-transparent flex items-center justify-center">
              <Eye className="h-7 w-7 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative min-h-[90vh] p-4 sm:p-6 lg:p-8 z-10 flex flex-col justify-center">
        {/* Main Content - Responsive Layout */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-12 lg:gap-16 max-w-7xl mx-auto w-full">
          {/* Left Section - Form */}
          <div className={`w-full animate-fade-in-up transition-all duration-500 ${url.trim() ? 'lg:max-w-2xl' : 'lg:max-w-3xl mx-auto text-center'}`}>
            {/* Input Mode Toggle */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-2 border-2 border-border shadow-lg">
                <div className="flex items-center gap-2">
                  <Button
                    variant={inputMode === 'url' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setInputMode('url')}
                    className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                      inputMode === 'url' 
                        ? 'bg-black text-white shadow-lg' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Direct URL
                  </Button>
                  <Button
                    variant={inputMode === 'chat' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setInputMode('chat')}
                    className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                      inputMode === 'chat' 
                        ? 'bg-black text-white shadow-lg' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    AI Chat
                  </Button>
                </div>
              </div>
            </div>

            {/* Input Section - URL or Chat */}
            <div ref={chatSectionRef} className="space-y-6 mb-8">
              {inputMode === 'url' ? (
                <div className="relative max-w-2xl mx-auto">
                  <Link2 className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground z-10" />
                   <Input
                     id="url"
                     type="url"
                     placeholder="Enter any website URL (e.g., https://docs.example.com)"
                     value={url}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                     className={`pl-16 pr-6 h-16 sm:h-18 lg:h-20 text-lg font-medium bg-white/95 backdrop-blur-sm border-2 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl focus:shadow-2xl placeholder:text-gray-400 text-muted-foreground ${urlError ? 'border-destructive focus-visible:ring-destructive' : 'border-border focus-visible:ring-primary focus:border-primary/50'}`}
                     aria-describedby={urlError ? 'url-error' : undefined}
                     aria-invalid={!!urlError}
                   />
                   {url.trim() && (
                     <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                       {getStatusIcon()}
                     </div>
                   )}
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                  <Card className="bg-white/95 backdrop-blur-sm border-2 border-border shadow-lg rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                      {/* Chat Header */}
                      <div className="p-4 border-b border-border/50 bg-primary/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">AI Assistant</h3>
                            <p className="text-xs text-muted-foreground">Tell me what you're interested in monitoring</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Chat Messages */}
                      <div ref={chatMessagesContainerRef} className="h-64 overflow-y-auto p-4 space-y-4">
                        {chatMessages.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Start a conversation about what you'd like to monitor</p>
                          </div>
                        ) : (
                          <>
                            {chatMessages.map((message) => {
                              // Tool call indicators (like Cursor)
                              if (message.role === 'tool') {
                                return (
                                  <div key={message.id} className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="font-medium">{message.content}</span>
                                  </div>
                                );
                              }

                              return (
                                <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                  {message.role === 'assistant' && (
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                      <Bot className="h-4 w-4 text-primary" />
                                    </div>
                                  )}
                                  <div className="max-w-[80%] space-y-2">
                                    <div className={`rounded-2xl px-4 py-3 ${
                                      message.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-gray-100 text-foreground'
                                    }`}>
                                      {message.role === 'assistant' ? (
                                        <div className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2">
                                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {message.content}
                                          </ReactMarkdown>
                                        </div>
                                      ) : (
                                        <p className="text-sm">{message.content}</p>
                                      )}
                                    </div>
                                    {/* Show confirmation button if URL was found */}
                                    {message.role === 'assistant' && message.foundUrl && (
                                      <Button
                                        onClick={() => handleStartTracking(message.foundUrl!)}
                                        className="w-full bg-black hover:bg-gray-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                        size="lg"
                                      >
                                        <Play className="h-4 w-4 mr-2" />
                                        Start Tracking This Website
                                      </Button>
                                    )}
                                  </div>
                                  {message.role === 'user' && (
                                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </>
                        )}
                      </div>
                      
                      {/* Chat Input */}
                      <div className="p-4 border-t border-border/50">
                        <div className="flex gap-3">
                          <Input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Describe what you want to monitor..."
                            className="flex-1 bg-white border-2 border-border rounded-xl"
                            disabled={isChatLoading}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && chatInput.trim() && !isChatLoading) {
                                handleChatSend();
                              }
                            }}
                          />
                          <Button
                            onClick={handleChatSend}
                            disabled={!chatInput.trim() || isChatLoading}
                            className="bg-black text-white hover:bg-gray-800 rounded-xl"
                          >
                            {isChatLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {inputMode === 'url' && urlError && (
                <Alert variant="destructive" className="animate-slide-down max-w-4xl mx-auto">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription id="url-error">
                    {urlError}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-12 max-w-2xl mx-auto">
               {inputMode === 'url' ? (
                 <>
                   <Button
                     onClick={handlePreview}
                     disabled={!isHttpUrl(url.trim()) || isLoading}
                     variant="outline"
                     size="lg"
                     className="flex-1 h-16 sm:h-18 text-lg font-medium bg-white/95 backdrop-blur-sm hover:bg-white border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                   >
                     <Eye className="h-5 w-5 mr-3" />
                     Preview Website
                   </Button>
                   <Button
                     onClick={handleStartWatching}
                     disabled={!isHttpUrl(url.trim())}
                     size="lg"
                     className="flex-1 h-16 sm:h-18 text-lg font-medium bg-black hover:bg-black/90 text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
                   >
                     <Play className="h-5 w-5 mr-3" />
                     Start Monitoring
                   </Button>
                 </>
               ) : (
                 <Button
                   onClick={() => {
                     toast({
                       title: "AI Search",
                       description: "AI-powered website discovery feature coming soon!",
                     });
                   }}
                   size="lg"
                   className="w-full h-16 sm:h-18 text-lg font-medium bg-black hover:bg-black/90 text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
                 >
                   <Bot className="h-5 w-5 mr-3" />
                   Find Websites with AI
                 </Button>
               )}
            </div>

            {/* Status and Help Text */}
            <div className="space-y-4 text-center">
              {inputMode === 'url' && url.trim() && (
                <div className="flex items-center justify-center gap-2 text-sm">
                  {getStatusIcon()}
                  <span className={`font-medium ${previewStatus === 'valid' ? 'text-green-600' : previewStatus === 'invalid' ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {getStatusText()} URL
                  </span>
                </div>
              )}
              {inputMode === 'chat' && (
                <div className="text-sm text-muted-foreground">
                  <p>💡 <strong>Tip:</strong> Describe your interests and I'll help you find relevant websites to monitor</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Preview */}
          {inputMode === 'url' && url.trim() && (
            <div ref={previewSectionRef} className="w-full lg:max-w-3xl animate-slide-in-right transition-all duration-700 pt-30">
              <Card className="rounded-3xl bg-white/95 backdrop-blur-sm border-2 border-border shadow-xl modern-hover">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                      </div>
                      <span className="font-mono text-base text-muted-foreground">{getDomainFromUrl(url)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(url, '_blank')}
                      className="h-10 w-10 p-0 rounded-xl hover:bg-muted/50"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border-2 rounded-2xl overflow-hidden aspect-video bg-muted/10 shadow-inner">
                    {isLoading ? (
                      <div className="p-8 space-y-4 h-full flex flex-col justify-center">
                        <Skeleton className="h-4 w-3/4 mx-auto" />
                        <Skeleton className="h-4 w-1/2 mx-auto" />
                        <Skeleton className="h-32 w-full rounded-xl" />
                      </div>
                    ) : previewStatus === 'valid' ? (
                      <iframe
                        src={url}
                        className="w-full h-full"
                        sandbox="allow-same-origin allow-scripts"
                        title="Website preview"
                        onError={() => setPreviewStatus('blocked')}
                      />
                    ) : (
                      <div className="p-12 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                          <ShieldAlert className="h-10 w-10 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-foreground">
                          {previewStatus === 'invalid' ? 'Invalid URL' : 'Preview Not Available'}
                        </h3>
                        <p className="mb-6 text-base">
                          {previewStatus === 'invalid' 
                            ? 'Enter a valid URL to see the preview'
                            : 'This website blocks embedding for security, but you can still monitor it!'
                          }
                        </p>
                         <Button
                           variant="outline"
                           size="lg"
                           onClick={() => window.open(url, '_blank')}
                           className="bg-white/95 backdrop-blur-sm hover:bg-white border-2 hover:border-primary/30 transition-all duration-300"
                         >
                           <ExternalLink className="h-5 w-5 mr-2" />
                           Open in new tab
                         </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Summary Settings Modal */}
      {showSummarySettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white border-2 border-border shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Summary Call
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-medium">
                    Configure your intelligent summary call settings
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {/* Grid Layout for Form Elements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Frequency Card */}
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <label className="text-sm font-semibold text-foreground">Frequency</label>
                  </div>
                  <Select value={frequency} onValueChange={(value) => setFrequency(value)}>
                    <SelectTrigger className="h-12 bg-white border-2 border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-border shadow-xl rounded-xl">
                      <SelectItem value="daily" className="hover:bg-primary/10">Daily</SelectItem>
                      <SelectItem value="weekend" className="hover:bg-primary/10">Every Weekend</SelectItem>
                      <SelectItem value="monthly" className="hover:bg-primary/10">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Voice Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <label className="text-sm font-semibold text-foreground">Voice</label>
                  </div>
                  <Select value={voice} onValueChange={(value) => setVoice(value)}>
                    <SelectTrigger className="h-12 bg-white border-2 border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-border shadow-xl rounded-xl">
                      <SelectItem value="Morning dad" className="hover:bg-primary/10">Morning dad</SelectItem>
                      <SelectItem value="Lunch dad" className="hover:bg-primary/10">Lunch dad</SelectItem>
                      <SelectItem value="Dinner dad" className="hover:bg-primary/10">Dinner dad</SelectItem>
                      <SelectItem value="Boomer dad" className="hover:bg-primary/10">Boomer dad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Detail Level - Full Width Card */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <label className="text-sm font-semibold text-foreground">Detail Level</label>
                </div>
                <div className="max-w-md">
                  <Select value={detailLevel} onValueChange={(value) => setDetailLevel(value)}>
                    <SelectTrigger className="h-12 bg-white border-2 border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-border shadow-xl rounded-xl">
                      <SelectItem value="low" className="hover:bg-primary/10">Low</SelectItem>
                      <SelectItem value="medium" className="hover:bg-primary/10">Medium</SelectItem>
                      <SelectItem value="high" className="hover:bg-primary/10">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  onClick={() => setShowSummarySettings(false)}
                  variant="outline"
                  className="flex-1 h-12 bg-white border-2 border-border hover:bg-gray-50 hover:shadow-lg transition-all duration-300 rounded-xl font-semibold"
                >
                  Save
                </Button>
                               <Button
                  onClick={() => {
                    fetch('http://localhost:8000/makeGeneralCall/', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        // Include any necessary data for the API call
                      }),
                    })
                      .then((response) => {
                        if (!response.ok) {
                          throw new Error('Network response was not ok');
                        }
                        return response.json();
                      })
                      .then((data) => {
                        console.log('API call successful:', data);
                      })
                      .catch((error) => {
                        console.error('Error making API call:', error);
                      });
                  }}
                  className="flex-1 h-12 bg-black text-white hover:bg-gray-800 hover:shadow-xl transition-all duration-300 rounded-xl font-semibold hover:scale-105"
                >
                  Call Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Watch Docs Section - Moved higher and improved */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Your Watch Dashboard</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Monitor all your tracked websites in one place. Get instant notifications when content changes.
            </p>
          </div>

          {recentWatches.length === 0 ? (
             <Card className="rounded-3xl bg-white/95 backdrop-blur-sm border-2 border-border animate-fade-in-up shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-primary/5 rounded-full flex items-center justify-center">
                  <Plus className="h-12 w-12 text-primary/60" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Ready to start monitoring?</h3>
                <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                  Add your first website above to begin tracking changes with intelligent notifications and detailed analysis.
                </p>
                 <Button 
                   size="lg"
                   onClick={() => document.getElementById('url')?.focus()}
                   className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                 >
                   <Plus className="h-5 w-5 mr-2" />
                   Get started now
                 </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-foreground">Active Monitors</h3>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-0 font-medium">
                    {recentWatches.length} {recentWatches.length === 1 ? 'site' : 'sites'}
                  </Badge>
                </div>
                <Button variant="outline" className="bg-white/95 backdrop-blur-sm hover:bg-white border-2 hover:border-primary/30 transition-all duration-300">
                  <Activity className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentWatches.map((watch, index) => {
                const healthIndicator = getHealthIndicator(watch);
                return (
                  <TooltipProvider key={watch.id}>
                    <Card 
                      className="rounded-3xl bg-white/95 backdrop-blur-sm border-2 border-border animate-fade-in-up modern-hover cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => navigate(`/watch/${watch.id}/timeline`)}
                    >
                      {/* Website Preview */}
                      <div className="relative h-32 bg-muted/20 overflow-hidden">
                        <iframe
                          src={watch.url}
                          className="w-full h-full transform scale-75 origin-top-left pointer-events-none"
                          sandbox="allow-same-origin"
                          title={`Preview of ${watch.title || getDomainFromUrl(watch.url)}`}
                          style={{
                            width: '133.33%',
                            height: '133.33%',
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 left-2">
                          <Badge 
                            variant={getStatusBadgeVariant(watch.status)}
                            className="text-xs bg-white/90 backdrop-blur-sm"
                          >
                            {watch.status || 'Active'}
                          </Badge>
                        </div>

                        {/* Health Indicator */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`absolute top-2 right-2 ${healthIndicator.bgColor} ${healthIndicator.color} p-2 rounded-full backdrop-blur-sm`}>
                              {healthIndicator.icon}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{healthIndicator.text}</p>
                            <p className="text-xs text-muted-foreground">{healthIndicator.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <CardContent className="p-6 space-y-4">
                        {/* Title and URL */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0" />
                            <h3 className="font-semibold text-base truncate text-foreground">
                              {watch.title || getDomainFromUrl(watch.url)}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground truncate pl-5">
                            {getDomainFromUrl(watch.url)}
                          </p>
                        </div>

                        {/* Health Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${healthIndicator.color.replace('text-', 'bg-')}`} />
                            <span className="text-sm font-medium">{healthIndicator.text}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {watch.latest_scan ? formatTimeAgo(watch.latest_scan.scan_date) : formatTimeAgo(watch.created_date)}
                          </div>
                        </div>

                        {/* Change Summary */}
                        {watch.latest_scan?.change_summary && (
                          <div className="text-xs text-muted-foreground pl-4 border-l-2 border-muted overflow-hidden">
                            <div 
                              className="line-clamp-2"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {watch.latest_scan.change_summary}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/watch/${watch.id}/live`);
                                  }}
                                  className="h-8 px-3 text-xs bg-white/90 backdrop-blur-sm hover:bg-white/95"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Live
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View live monitoring</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(watch.url, '_blank');
                                  }}
                                  className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white/95"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Open website</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive bg-white/90 backdrop-blur-sm hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete watch</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <AlertDialogContent className="bg-white/90 backdrop-blur-sm">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Watch</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{watch.title || getDomainFromUrl(watch.url)}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-white/90 backdrop-blur-sm hover:bg-white/95">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteWatch(watch.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipProvider>
                );
              })}
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

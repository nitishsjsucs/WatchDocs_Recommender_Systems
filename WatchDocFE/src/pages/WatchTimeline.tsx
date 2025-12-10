import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ExternalLink, 
  Clock, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Diff,
  Plus,
  Minus,
  Mic,
  ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getWatchById, getWatchTimeline, triggerScan } from '@/lib/storage';
import { getDomainFromUrl } from '@/lib/validation';
import { WatchItem, WatchTimelineResponse, ScanHistory } from '@/types';

// Timeline entry is now based on ScanHistory from API

export default function WatchTimeline() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [watch, setWatch] = useState<WatchItem | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<ScanHistory | null>(null);
  const [timelineEntries, setTimelineEntries] = useState<ScanHistory[]>([]); 
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [timelineData, setTimelineData] = useState<WatchTimelineResponse | null>(null);

  // Load watch and timeline data
  useEffect(() => {
    const loadData = async () => {
      if (id) {
        setLoading(true);
        const numId = parseInt(id, 10);
        if (!isNaN(numId)) {
          try {
            // Load timeline data which includes document info
            const timelineResponse = await getWatchTimeline(numId);
            if (timelineResponse) {
              setTimelineData(timelineResponse);
              setWatch({
                id: timelineResponse.document.id,
                title: timelineResponse.document.title,
                desc: timelineResponse.document.desc,
                url: timelineResponse.document.url,
                status: timelineResponse.document.status,
                created_date: timelineResponse.document.created_date,
                latest_scan: timelineResponse.document.latest_scan
              });
              
              // Set timeline entries from scan history
              const entries = timelineResponse.document.scan_history || [];
              setTimelineEntries(entries);
              
              // Select the most recent entry by default
              if (entries.length > 0) {
                setSelectedEntry(entries[0]);
              }
            } else {
              navigate('/');
            }
          } catch (error) {
            console.error('Failed to load timeline data:', error);
            navigate('/');
          }
        } else {
          navigate('/');
        }
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

  const getStatusIcon = (entry: ScanHistory) => {
    if (entry.changes) {
      return <Eye className="h-4 w-4 text-blue-500" />;
    } else {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusColor = (entry: ScanHistory) => {
    if (entry.changes) {
      return 'bg-blue-500';
    } else {
      return 'bg-green-500';
    }
  };

  const getStatusText = (entry: ScanHistory) => {
    return entry.changes ? 'changed' : 'captured';
  };

  const getEntryTitle = (entry: ScanHistory) => {
    if (entry.changes) {
      return 'Content Updated';
    } else {
      return 'Periodic Check';
    }
  };

  const getEntryDescription = (entry: ScanHistory) => {
    if (entry.changes) {
      return entry.change_summary?.substring(0, 100) + (entry.change_summary && entry.change_summary.length > 100 ? '...' : '') || 'Changes detected';
    } else {
      return 'No changes detected in this scan';
    }
  };

  const handleTriggerScan = async () => {
    if (!watch?.url) return;
    
    setScanning(true);
    try {
      const success = await triggerScan(watch.url, watch.title);
      if (success) {
        // Optionally refresh the timeline data after scan
        // You might want to add a toast notification here
        console.log('Scan triggered successfully');
        
        // Refresh timeline data after a short delay
        setTimeout(async () => {
          if (id) {
            const numId = parseInt(id, 10);
            if (!isNaN(numId)) {
              const timelineResponse = await getWatchTimeline(numId);
              if (timelineResponse) {
                const entries = timelineResponse.document.scan_history || [];
                setTimelineEntries(entries);
                // Select the most recent entry if it's new
                if (entries.length > 0 && (!selectedEntry || entries[0].id !== selectedEntry.id)) {
                  setSelectedEntry(entries[0]);
                }
              }
            }
          }
        }, 2000); // Wait 2 seconds for the scan to potentially complete
      }
    } catch (error) {
      console.error('Failed to trigger scan:', error);
    } finally {
      setScanning(false);
    }
  };

  if (loading || !watch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative animate-slide-in-left">
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
              <span className="font-mono text-sm text-muted-foreground">{watch?.url ? getDomainFromUrl(watch.url) : 'Loading...'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTriggerScan}
              disabled={!watch?.url || scanning}
              className="bg-white/90 backdrop-blur-sm hover:bg-white/95"
            >
              {scanning ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
              ) : (
                <Clock className="h-4 w-4 mr-2" />
              )}
              {scanning ? 'Scanning...' : 'Trigger Scan'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/watch/${id}`)}
              className="bg-white/90 backdrop-blur-sm hover:bg-white/95"
            >
              <Eye className="h-4 w-4 mr-2" />
              Live View
            </Button>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Add microphone functionality
                console.log('Microphone clicked');
              }}
              className="bg-white/90 backdrop-blur-sm hover:bg-white/95"
            >
              <Mic className="h-4 w-4 mr-2" />
              Voice
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-[calc(100vh-80px)]">
        {/* Left Side - Timeline */}
        <div className="w-1/3 border-r border-border/50 bg-white/5 backdrop-blur-sm">
          <div className="h-full flex flex-col">
            {/* Timeline Header */}
            <div className="p-4 sm:p-6 border-b border-border/50 bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Timeline</h2>
                  <p className="text-sm text-muted-foreground">Change history and monitoring events</p>
                </div>
              </div>
            </div>

            {/* Timeline Items */}
            <ScrollArea className="flex-1 p-2 sm:p-4">
              <div className="relative px-2 sm:px-4">
                <div className="space-y-4 py-4">
                  {timelineEntries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="relative flex gap-3 cursor-pointer"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      {/* Timeline Line and Dot */}
                      <div className="relative flex flex-col items-center flex-shrink-0">
                        {/* Connecting Line Above (except for first item) */}
                        {index > 0 && (
                          <div className="w-0.5 h-4 bg-gradient-to-b from-border/80 to-border/40 mb-1" />
                        )}
                        
                        {/* Timeline Dot */}
                        <div className="relative z-10 w-4 h-4 rounded-full bg-white border-2 border-border/50 flex items-center justify-center">
                          <div className={`w-2 h-2 rounded-full ${entry.changes ? 'bg-blue-500' : 'bg-green-500'}`} />
                        </div>
                        
                        {/* Connecting Line Below (except for last item) */}
                        {index < timelineEntries.length - 1 && (
                          <div className="w-0.5 h-4 bg-gradient-to-b from-border/40 to-border/80 mt-1" />
                        )}
                      </div>
                      
                      {/* Timeline Card */}
                      <Card className={`flex-1 transition-all duration-200 ${
                        selectedEntry?.id === entry.id
                          ? 'bg-white/95 backdrop-blur-sm border-primary shadow-lg'
                          : 'bg-white/80 backdrop-blur-sm border border-border hover:bg-white/90'
                      }`}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-sm text-foreground">{getEntryTitle(entry)}</h3>
                            <Badge 
                              variant={entry.changes ? 'default' : 'secondary'}
                              className="text-xs flex-shrink-0 ml-2"
                            >
                              {getStatusText(entry)}
                            </Badge>
                          </div>
                          <p className="text-xs font-mono text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString()} at {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Right Side - Preview and Changes */}
        <div className="w-2/3 bg-white/5 backdrop-blur-sm">
          <div className="h-full flex flex-col">
            {/* Preview Header */}
            <div className="p-4 sm:p-6 border-b border-border/50 bg-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <ExternalLink className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {selectedEntry ? getEntryTitle(selectedEntry) : 'Select Timeline Entry'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedEntry 
                        ? `Captured at ${new Date(selectedEntry.date).toLocaleString()}`
                        : 'Choose a timeline entry to view details'
                      }
                    </p>
                  </div>
                </div>
                {selectedEntry && (
                  <Badge 
                    variant={selectedEntry.changes ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {getStatusText(selectedEntry)}
                  </Badge>
                )}
              </div>
            </div>

            {/* Content Area */}
            {selectedEntry ? (
              <div className="flex-1 flex">
                {/* Preview Section */}
                <div className="w-2/3 p-4 sm:p-6 border-r border-border/50">
                  <Card className="h-full bg-white/90 backdrop-blur-sm border border-border">
                    <CardContent className="h-full p-0 flex flex-col">
                      {/* Website Preview */}
                      <div className="h-1/2 bg-muted/20 rounded-t-lg border-b border-border/20 relative overflow-hidden">
                        <iframe
                          src={watch?.url}
                          className="w-full h-full border-0"
                          title="Website Preview"
                          sandbox="allow-scripts allow-same-origin"
                          loading="lazy"
                          onError={(e) => {
                            // Fallback to placeholder on error
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        {/* Fallback placeholder - hidden by default */}
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 rounded-t-lg" style={{ display: 'none' }}>
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
                              onClick={() => window.open(watch?.url, '_blank')}
                              className="mt-2"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open in New Tab
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Content Summary */}
                      <div className="h-1/2 p-4 overflow-hidden flex flex-col">
                        <h4 className="text-base font-semibold mb-3 flex-shrink-0">Content Summary</h4>
                        <ScrollArea className="flex-1">
                          <div className="text-xs text-foreground leading-relaxed pr-2">
                            {selectedEntry.current_summary}
                          </div>
                        </ScrollArea>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Changes Section */}
                <div className="w-1/3 p-4 sm:p-6">
                  <Card className="h-full bg-white/90 backdrop-blur-sm border border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Diff className="h-4 w-4" />
                        Changes Detected
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ScrollArea className="h-[calc(100%-60px)]">
                        {selectedEntry.changes && (selectedEntry.additions?.length > 0 || selectedEntry.deletions?.length > 0 || selectedEntry.modifications?.length > 0) ? (
                          <div className="space-y-4">
                            {/* Added Items */}
                            {selectedEntry.additions && selectedEntry.additions.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                                  <Plus className="h-3 w-3" />
                                  Added ({selectedEntry.additions.length})
                                </h4>
                                <div className="space-y-1">
                                  {selectedEntry.additions.map((item, index) => (
                                    <div key={index} className="text-xs p-2 bg-green-50 border-l-2 border-green-500 rounded">
                                      {item}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Removed Items */}
                            {selectedEntry.deletions && selectedEntry.deletions.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                                  <Minus className="h-3 w-3" />
                                  Removed ({selectedEntry.deletions.length})
                                </h4>
                                <div className="space-y-1">
                                  {selectedEntry.deletions.map((item, index) => (
                                    <div key={index} className="text-xs p-2 bg-red-50 border-l-2 border-red-500 rounded">
                                      {item}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Modified Items */}
                            {selectedEntry.modifications && selectedEntry.modifications.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-1">
                                  <Diff className="h-3 w-3" />
                                  Modified ({selectedEntry.modifications.length})
                                </h4>
                                <div className="space-y-1">
                                  {selectedEntry.modifications.map((item, index) => (
                                    <div key={index} className="text-xs p-2 bg-blue-50 border-l-2 border-blue-500 rounded">
                                      {item}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Change Summary */}
                            {selectedEntry.change_summary && (
                              <div className="mt-4 p-3 bg-muted/10 rounded-lg">
                                <h4 className="text-sm font-medium mb-2">Change Summary</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {selectedEntry.change_summary}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 bg-muted/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                              <CheckCircle className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              No changes detected in this capture
                            </p>
                            {selectedEntry.change_summary && (
                              <div className="mt-4 p-3 bg-muted/10 rounded-lg text-left">
                                <h4 className="text-sm font-medium mb-2">Summary</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {selectedEntry.change_summary}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Select a Timeline Entry</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Click on any timeline entry on the left to view the website preview and change details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

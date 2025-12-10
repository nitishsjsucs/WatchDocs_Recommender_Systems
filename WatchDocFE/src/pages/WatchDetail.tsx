import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Clock, Calendar, AlertCircle, Eye, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getWatchById } from '@/lib/storage';
import { WatchItem } from '@/types';

export default function WatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [watch, setWatch] = useState<WatchItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWatch = async () => {
      if (id) {
        const numId = parseInt(id, 10);
        if (!isNaN(numId)) {
          const foundWatch = await getWatchById(numId);
          setWatch(foundWatch);
        }
      }
      setLoading(false);
    };
    loadWatch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading watch details...</p>
        </div>
      </div>
    );
  }

  if (!watch) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/watch/new')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Watch Not Found</h1>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Watch Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The watch you're looking for doesn't exist or has been deleted.
              </p>
              <Button onClick={() => navigate('/watch/new')}>
                Create New Watch
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background relative">
      <div className="text-center max-w-2xl animate-fade-in-up">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-4 animate-scale-in"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Watch Docs
          </Button>
          
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <Eye className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Watch Details</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Monitor this URL for changes
          </p>
        </div>

        {/* URL Display */}
        <Card className="mb-6 rounded-xl bg-card border border-border animate-fade-in-up modern-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono break-all text-foreground">{watch.url}</span>
            </div>
          </CardContent>
        </Card>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="rounded-xl bg-card border border-border animate-fade-in-up modern-hover">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Created</span>
              </div>
              <p className="text-sm text-foreground">{formatDate(watch.created_date)}</p>
            </CardContent>
          </Card>
          
          {watch.latest_scan && (
            <Card className="rounded-xl bg-card border border-border animate-fade-in-up modern-hover">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Last Scanned</span>
                </div>
                <p className="text-sm text-foreground">{formatDate(watch.latest_scan.scan_date)}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Description */}
        {watch.desc && (
          <Card className="mb-6 rounded-xl bg-card border border-border animate-fade-in-up modern-hover">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground p-3 bg-muted/50 rounded-lg">{watch.desc}</p>
            </CardContent>
          </Card>
        )}

        {/* Status and Change Info */}
        {watch.latest_scan && (
          <Card className="mb-6 rounded-xl bg-card border border-border animate-fade-in-up modern-hover">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Latest Scan Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Status</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  watch.status === 'Healthy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {watch.status}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Changes Detected</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  watch.latest_scan.changes ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {watch.latest_scan.changes ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Change Level</span>
                <span className="text-sm text-foreground">{watch.latest_scan.change_level}</span>
              </div>
              {watch.latest_scan.change_summary && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium block mb-2">Change Summary</span>
                  <p className="text-sm text-foreground">{watch.latest_scan.change_summary}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Preview Card */}
        <Card className="mb-6 rounded-xl bg-card border border-border animate-fade-in-up modern-hover">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Live Preview</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(watch.url, '_blank')}
                className="h-8 px-3 text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Visit Site
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden aspect-video bg-muted/20 relative">
              <iframe
                src={watch.url}
                className="w-full h-full"
                sandbox="allow-same-origin allow-scripts"
                title="Website preview"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              {/* Fallback message - hidden by default */}
              <div className="absolute inset-0 flex items-center justify-center bg-muted/20" style={{ display: 'none' }}>
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
  );
}

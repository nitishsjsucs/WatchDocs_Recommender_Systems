import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getWatches } from '@/lib/storage';
import { WatchItem } from '@/types';

export default function RecentWatches() {
  const navigate = useNavigate();
  const [watches, setWatches] = useState<WatchItem[]>([]);

  useEffect(() => {
    const allWatches = getWatches();
    setWatches(allWatches.slice(0, 5)); // Show only last 5
  }, []);

  if (watches.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recent Watches</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {watches.map((watch) => (
                <Badge
                  key={watch.id}
                  variant="outline"
                  className="w-full justify-start cursor-pointer hover:bg-accent"
                  onClick={() => navigate(`/watch/${watch.id}`)}
                >
                  <span className="truncate text-xs">
                    {new URL(watch.url).hostname}
                  </span>
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

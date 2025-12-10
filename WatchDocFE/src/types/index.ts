export type LatestScan = {
  id: number;
  changes: boolean;
  change_level: string;
  change_summary: string | null;
  current_summary: string;
  scan_date: string;
  additions: string[];
  deletions: string[];
  modifications: string[];
};

export type ScanHistory = {
  id: number;
  date: string;
  changes: boolean;
  change_level: string;
  change_summary: string | null;
  current_summary: string;
  raw_content_preview?: string;
  additions: string[];
  deletions: string[];
  modifications: string[];
};

export type WatchTimelineResponse = {
  document: {
    id: number;
    title: string;
    desc: string;
    url: string;
    status: string;
    category: string;
    created_date: string;
    scan_count: number;
    latest_scan: LatestScan & {
      current_summary: string;
    };
    scan_history: ScanHistory[];
  };
  total_scans: number;
};

export type WatchItem = {
  id: number;
  title: string;
  desc: string;
  url: string;
  status: string;
  created_date: string;
  latest_scan: LatestScan;
};

export type DocumentsResponse = {
  documents: WatchItem[];
  total_count: number;
};

export type PreviewStatus = 'loading' | 'valid' | 'invalid' | 'blocked' | 'error';

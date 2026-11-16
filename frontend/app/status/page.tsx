'use client';

import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CircleX,
  Clock3,
  Database,
  RefreshCw,
  Server,
  WifiOff
} from 'lucide-react';
import { useHealthCheck } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { HealthClientStatus, HealthHistoryEntry, HealthResponse } from '@/types';

const STATUS_PRESENTATION = {
  ok: {
    label: 'All systems operational',
    shortLabel: 'Operational',
    icon: CheckCircle2,
    banner: 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100',
    dot: 'bg-emerald-500'
  },
  degraded: {
    label: 'Some systems are degraded',
    shortLabel: 'Degraded',
    icon: AlertTriangle,
    banner: 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100',
    dot: 'bg-amber-500'
  },
  down: {
    label: 'Service disruption',
    shortLabel: 'Down',
    icon: CircleX,
    banner: 'border-red-200 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100',
    dot: 'bg-red-500'
  },
  unreachable: {
    label: "Can't reach the API",
    shortLabel: 'API unreachable',
    icon: WifiOff,
    banner: 'border-slate-300 bg-slate-100 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
    dot: 'bg-slate-500'
  },
  loading: {
    label: 'Checking system status',
    shortLabel: 'Checking',
    icon: Activity,
    banner: 'border-border bg-card text-foreground',
    dot: 'bg-muted-foreground'
  }
} satisfies Record<HealthClientStatus, {
  label: string;
  shortLabel: string;
  icon: typeof Activity;
  banner: string;
  dot: string;
}>;

function getStatusDetail(status: HealthClientStatus, response: HealthResponse | null) {
  if (status === 'unreachable') {
    return 'The status API did not respond. Check your connection and try again.';
  }
  if (status === 'down') {
    const databaseError = response?.checks?.database.error;
    return databaseError
      ? `A critical dependency is unavailable: ${databaseError}.`
      : 'A critical service dependency is unavailable.';
  }
  if (status === 'degraded') {
    const database = response?.checks?.database;
    if (database?.status === 'down') {
      return 'The database health check is failing.';
    }
    if (database && database.latencyMs > 500) {
      return `The database is responding slowly (${database.latencyMs.toFixed(1)} ms).`;
    }
    return 'A non-critical service check is slow or failing.';
  }
  return 'RentalHub is responding normally.';
}

function formatTimestamp(timestamp: string | null) {
  if (!timestamp) {
    return 'Waiting for first check';
  }
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? timestamp : date.toLocaleString();
}

function StatusBanner({
  status,
  response,
  timestamp,
  onRetry
}: {
  status: HealthClientStatus;
  response: HealthResponse | null;
  timestamp: string | null;
  onRetry: () => void;
}) {
  const presentation = STATUS_PRESENTATION[status];
  const Icon = presentation.icon;

  return (
    <section
      aria-live="polite"
      aria-atomic="true"
      className={`flex flex-col gap-5 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7 ${presentation.banner}`}
    >
      <div className="flex items-start gap-4">
        <Icon aria-hidden="true" className="mt-1 h-7 w-7 shrink-0" />
        <div>
          <p className="text-xl font-semibold sm:text-2xl">{presentation.label}</p>
          <p className="mt-1 text-sm opacity-80">{getStatusDetail(status, response)}</p>
          <p className="mt-3 flex items-center gap-2 text-xs opacity-75">
            <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
            API timestamp: {formatTimestamp(timestamp)}
          </p>
        </div>
      </div>
      {status === 'unreachable' && (
        <Button variant="outline" onClick={onRetry} className="shrink-0">
          <RefreshCw aria-hidden="true" className="h-4 w-4" />
          Retry
        </Button>
      )}
    </section>
  );
}

function LoadingCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[0, 1, 2].map(item => (
        <Card key={item} className="min-h-56">
          <CardHeader>
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="max-w-[65%] break-all text-right font-medium">{value}</dd>
    </div>
  );
}

function ApiCard({ response, status }: { response: HealthResponse | null; status: HealthClientStatus }) {
  const presentation = STATUS_PRESENTATION[status];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity aria-hidden="true" className="h-4 w-4 text-primary" />
          API
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3">
          <InfoLine label="Status" value={presentation.shortLabel} />
          <InfoLine label="Version" value={response?.service?.version || 'Not exposed'} />
          <InfoLine label="Environment" value={response?.service?.environment || 'Not exposed'} />
          <InfoLine
            label="Commit"
            value={response?.service?.commit ? response.service.commit.slice(0, 7) : 'Not exposed'}
          />
          <InfoLine label="Uptime" value={response?.uptime.human || 'Not available'} />
        </dl>
      </CardContent>
    </Card>
  );
}

function DatabaseCard({ response }: { response: HealthResponse | null }) {
  const database = response?.checks?.database;
  const pool = database?.pool;
  const idlePercent = pool && pool.total > 0
    ? Math.min(100, Math.max(0, (pool.idle / pool.total) * 100))
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Database aria-hidden="true" className="h-4 w-4 text-primary" />
          Database
        </CardTitle>
      </CardHeader>
      <CardContent>
        {database ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className={`h-2.5 w-2.5 rounded-full ${database.status === 'up' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {database.status === 'up' ? 'Up' : 'Down'}
              </span>
            </div>
            <InfoLine label="Latency" value={`${database.latencyMs.toFixed(1)} ms`} />
            {database.error && (
              <p className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
                {database.error}
              </p>
            )}
            {pool ? (
              <div>
                <div
                  role="img"
                  aria-label={`Connection pool: ${pool.idle} idle of ${pool.total} total, ${pool.waiting} waiting`}
                  className="flex h-2 overflow-hidden rounded-full bg-muted"
                >
                  <span className="bg-emerald-500" style={{ width: `${idlePercent}%` }} />
                  <span className="flex-1 bg-primary/40" />
                </div>
                <div className="mt-2 flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{pool.idle} idle / {pool.total} total</span>
                  <span className={pool.waiting > 0 ? 'font-medium text-amber-700 dark:text-amber-300' : ''}>
                    {pool.waiting} waiting
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Detailed database checks are not exposed.</p>
        )}
      </CardContent>
    </Card>
  );
}

function ServerCard({ response }: { response: HealthResponse }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Server aria-hidden="true" className="h-4 w-4 text-primary" />
          Server
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3">
          <InfoLine label="Node.js" value={response.system?.nodeVersion || 'Not available'} />
          <InfoLine label="RSS memory" value={`${response.system?.memory.rssMb ?? '-'} MB`} />
          <InfoLine label="Heap used" value={`${response.system?.memory.heapUsedMb ?? '-'} MB`} />
          <InfoLine label="Heap total" value={`${response.system?.memory.heapTotalMb ?? '-'} MB`} />
        </dl>
      </CardContent>
    </Card>
  );
}

function HistoryStrip({ history }: { history: HealthHistoryEntry[] }) {
  const latencyEntries = history.filter(entry => entry.latencyMs !== null);
  const maxLatency = Math.max(1, ...latencyEntries.map(entry => entry.latencyMs || 0));
  const points = latencyEntries.map((entry, index) => {
    const x = latencyEntries.length === 1 ? 50 : (index / (latencyEntries.length - 1)) * 100;
    const y = 28 - ((entry.latencyMs || 0) / maxLatency) * 24;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent checks</CardTitle>
        <p className="text-sm text-muted-foreground">Up to 20 checks from this browser session</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {history.length ? (
          <>
            <div className="flex min-h-5 flex-wrap items-center gap-2" aria-label="Recent check results">
              {history.map((entry, index) => (
                <span
                  key={`${entry.checkedAt}-${index}`}
                  role="img"
                  aria-label={`${new Date(entry.checkedAt).toLocaleTimeString()}: ${STATUS_PRESENTATION[entry.status].shortLabel}`}
                  title={`${STATUS_PRESENTATION[entry.status].shortLabel}${entry.latencyMs === null ? '' : ` · ${entry.latencyMs.toFixed(1)} ms`}`}
                  className={`h-3 w-3 rounded-full ${STATUS_PRESENTATION[entry.status].dot}`}
                />
              ))}
            </div>
            {latencyEntries.length > 1 ? (
              <div>
                <svg
                  viewBox="0 0 100 32"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Database latency trend in milliseconds"
                  className="h-12 w-full overflow-visible"
                >
                  <polyline
                    points={points}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                    className="text-primary"
                  />
                </svg>
                <p className="text-xs text-muted-foreground">Database latency · latest {latencyEntries[latencyEntries.length - 1].latencyMs?.toFixed(1)} ms</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {latencyEntries.length ? 'Collecting latency trend…' : 'Latency is not available for recent checks.'}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">The first check will appear here.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function StatusPage() {
  const {
    response,
    status,
    history,
    lastCheckedAt,
    secondsSinceLastCheck,
    isRefreshing,
    refresh
  } = useHealthCheck(30_000);

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:py-12">
      <div className="mx-auto max-w-5xl space-y-7">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              RentalHub
            </Link>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.16em] text-primary">
              <Activity aria-hidden="true" className="h-4 w-4" />
              Platform health
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">System status</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {secondsSinceLastCheck === null
                ? 'Last checked: waiting for first check'
                : `Last checked: ${secondsSinceLastCheck} seconds ago`}
            </p>
          </div>
          <Button variant="outline" onClick={() => void refresh()} disabled={isRefreshing}>
            <RefreshCw aria-hidden="true" className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </header>

        {status === 'loading' ? (
          <section aria-label="Loading system status" className="space-y-5">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <LoadingCards />
            <Skeleton className="h-36 w-full rounded-xl" />
          </section>
        ) : (
          <>
            <StatusBanner
              status={status}
              response={response}
              timestamp={response?.timestamp || (
                lastCheckedAt === null ? null : new Date(lastCheckedAt).toISOString()
              )}
              onRetry={() => void refresh()}
            />
            <section aria-label="Service details" className="grid gap-4 md:grid-cols-2">
              <ApiCard response={response} status={status} />
              <DatabaseCard response={response} />
              {response?.system && <ServerCard response={response} />}
            </section>
            <HistoryStrip history={history} />
          </>
        )}

        <footer className="border-t border-border pt-5 text-center text-sm text-muted-foreground">
          RentalHub system status · Updates automatically every 30 seconds
        </footer>
      </div>
    </main>
  );
}

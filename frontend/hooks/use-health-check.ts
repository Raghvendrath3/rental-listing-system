'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  HealthClientStatus,
  HealthHistoryEntry,
  HealthResponse
} from '@/types';

const FETCH_TIMEOUT_MS = 10_000;
const MAX_HISTORY_LENGTH = 20;

function getHealthUrl() {
  const apiUrl = (
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'production' ? '/api/v1' : 'http://localhost:5000/api/v1')
  ).replace(/\/+$/, '');
  return /\/api\/v1$/i.test(apiUrl)
    ? `${apiUrl}/health`
    : `${apiUrl}/api/v1/health`;
}

function isHealthResponse(value: unknown): value is HealthResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const response = value as Partial<HealthResponse>;
  return ['ok', 'degraded', 'down'].includes(response.status || '')
    && typeof response.timestamp === 'string'
    && typeof response.uptime?.seconds === 'number'
    && typeof response.uptime.human === 'string';
}

function appendHistory(
  history: HealthHistoryEntry[],
  entry: HealthHistoryEntry
): HealthHistoryEntry[] {
  return [...history, entry].slice(-MAX_HISTORY_LENGTH);
}

export function useHealthCheck(intervalMs: number) {
  const [response, setResponse] = useState<HealthResponse | null>(null);
  const [status, setStatus] = useState<HealthClientStatus>('loading');
  const [history, setHistory] = useState<HealthHistoryEntry[]>([]);
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const activeController = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    activeController.current?.abort('superseded');
    const controller = new AbortController();
    activeController.current = controller;
    const timeoutId = window.setTimeout(() => {
      controller.abort('timeout');
    }, FETCH_TIMEOUT_MS);
    setIsRefreshing(true);

    try {
      const result = await fetch(getHealthUrl(), {
        cache: 'no-store',
        signal: controller.signal
      });
      const data: unknown = await result.json();
      if (!isHealthResponse(data)) {
        throw new Error('Invalid health response');
      }

      const checkedAt = Date.now();
      setResponse(data);
      setStatus(data.status);
      setLastCheckedAt(checkedAt);
      setHistory(current => appendHistory(current, {
        checkedAt: new Date(checkedAt).toISOString(),
        status: data.status,
        latencyMs: data.checks?.database.latencyMs ?? null
      }));
    } catch {
      if (controller.signal.reason === 'hidden' || controller.signal.reason === 'superseded'
        || controller.signal.reason === 'unmounted') {
        return;
      }
      const checkedAt = Date.now();
      setStatus('unreachable');
      setLastCheckedAt(checkedAt);
      setHistory(current => appendHistory(current, {
        checkedAt: new Date(checkedAt).toISOString(),
        status: 'unreachable',
        latencyMs: null
      }));
    } finally {
      window.clearTimeout(timeoutId);
      if (activeController.current === controller) {
        activeController.current = null;
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const updateVisibility = () => {
      const visible = !document.hidden;
      setIsVisible(visible);
      if (!visible) {
        activeController.current?.abort('hidden');
      }
    };

    document.addEventListener('visibilitychange', updateVisibility);
    updateVisibility();
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  useEffect(() => {
    if (!isVisible || document.hidden) {
      return;
    }

    void refresh();
    const intervalId = window.setInterval(() => void refresh(), intervalMs);
    return () => {
      window.clearInterval(intervalId);
      activeController.current?.abort('hidden');
    };
  }, [intervalMs, isVisible, refresh]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => () => activeController.current?.abort('unmounted'), []);

  return {
    response,
    status,
    history,
    lastCheckedAt,
    secondsSinceLastCheck: lastCheckedAt === null
      ? null
      : Math.max(0, Math.floor((now - lastCheckedAt) / 1000)),
    isRefreshing,
    refresh
  };
}

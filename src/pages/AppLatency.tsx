'use client';

import React, { useState, useMemo } from 'react';
import {
  useUi,
  useLatencyLog,
  formatDuration,
  getLatencySeverity,
  type LatencyLogEntry,
  type LatencySource,
} from '@hit/ui-kit';

// =============================================================================
// TYPES
// =============================================================================

type SortField = 'timestamp' | 'durationMs' | 'source' | 'endpoint';
type SortDirection = 'asc' | 'desc';
type SourceFilter = 'all' | LatencySource;

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(date: Date): string {
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getSourceLabel(source: LatencySource): string {
  switch (source) {
    case 'db':
      return 'Database';
    case 'module':
      return 'Module';
    case 'api':
      return 'API';
    default:
      return 'Other';
  }
}

function getSourceIcon(source: LatencySource): string {
  switch (source) {
    case 'db':
      return '🗄️';
    case 'module':
      return '📦';
    case 'api':
      return '🌐';
    default:
      return '⚙️';
  }
}

function getSeverityColor(severity: ReturnType<typeof getLatencySeverity>): string {
  switch (severity) {
    case 'fast':
      return '#22c55e';
    case 'normal':
      return '#3b82f6';
    case 'slow':
      return '#f59e0b';
    case 'critical':
    default:
      return '#ef4444';
  }
}

function getSeverityBadgeVariant(severity: ReturnType<typeof getLatencySeverity>): 'success' | 'info' | 'warning' | 'error' {
  switch (severity) {
    case 'fast':
      return 'success';
    case 'normal':
      return 'info';
    case 'slow':
      return 'warning';
    case 'critical':
    default:
      return 'error';
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AppLatency() {
  const { Page, Card, Button, Input, Badge, Modal, EmptyState, Tabs, Alert } = useUi();
  const latencyLog = useLatencyLog();
  const {
    entries,
    enabled,
    maxEntries,
    slowThresholdMs,
    clearEntries,
    clearEntry,
    setEnabled,
    setSlowThreshold,
    exportEntries,
  } = latencyLog;

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [showSlowOnly, setShowSlowOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedEntry, setSelectedEntry] = useState<LatencyLogEntry | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [newThreshold, setNewThreshold] = useState(String(slowThresholdMs));

  // Filtered and sorted entries
  const filteredEntries = useMemo(() => {
    let result = [...entries];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.endpoint.toLowerCase().includes(query) ||
          e.moduleName?.toLowerCase().includes(query) ||
          e.tableName?.toLowerCase().includes(query) ||
          e.pageUrl.toLowerCase().includes(query)
      );
    }

    // Source filter
    if (sourceFilter !== 'all') {
      result = result.filter((e) => e.source === sourceFilter);
    }

    // Slow only filter
    if (showSlowOnly) {
      result = result.filter((e) => e.isSlow);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'timestamp':
          cmp = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'durationMs':
          cmp = a.durationMs - b.durationMs;
          break;
        case 'source':
          cmp = a.source.localeCompare(b.source);
          break;
        case 'endpoint':
          cmp = a.endpoint.localeCompare(b.endpoint);
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [entries, searchQuery, sourceFilter, showSlowOnly, sortField, sortDirection]);

  // Stats
  const stats = useMemo(() => {
    const total = entries.length;
    const slowCount = entries.filter((e: LatencyLogEntry) => e.isSlow).length;
    const dbCount = entries.filter((e: LatencyLogEntry) => e.source === 'db').length;
    const moduleCount = entries.filter((e: LatencyLogEntry) => e.source === 'module').length;
    const apiCount = entries.filter((e: LatencyLogEntry) => e.source === 'api').length;

    // Average durations by source
    const avgBySource: Record<LatencySource, { total: number; count: number }> = {
      db: { total: 0, count: 0 },
      module: { total: 0, count: 0 },
      api: { total: 0, count: 0 },
      other: { total: 0, count: 0 },
    };

    entries.forEach((e: LatencyLogEntry) => {
      avgBySource[e.source].total += e.durationMs;
      avgBySource[e.source].count += 1;
    });

    const avgDb = avgBySource.db.count > 0 ? avgBySource.db.total / avgBySource.db.count : 0;
    const avgModule = avgBySource.module.count > 0 ? avgBySource.module.total / avgBySource.module.count : 0;
    const avgApi = avgBySource.api.count > 0 ? avgBySource.api.total / avgBySource.api.count : 0;

    // Overall average
    const overallAvg = total > 0 ? entries.reduce((sum: number, e: LatencyLogEntry) => sum + e.durationMs, 0) / total : 0;

    // P95 latency
    const sortedDurations = [...entries].map((e: LatencyLogEntry) => e.durationMs).sort((a, b) => a - b);
    const p95Index = Math.floor(sortedDurations.length * 0.95);
    const p95 = sortedDurations[p95Index] || 0;

    return {
      total,
      slowCount,
      dbCount,
      moduleCount,
      apiCount,
      avgDb,
      avgModule,
      avgApi,
      overallAvg,
      p95,
    };
  }, [entries]);

  const handleExport = () => {
    const json = exportEntries();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `latency-log-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    clearEntries();
    setShowClearConfirm(false);
  };

  const handleSetThreshold = () => {
    const ms = parseInt(newThreshold, 10);
    if (!isNaN(ms) && ms > 0) {
      setSlowThreshold(ms);
      setShowThresholdModal(false);
    }
  };

  // Styles
  const tableStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  };

  const thStyles: React.CSSProperties = {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '1px solid rgba(148,163,184,0.2)',
    fontWeight: 600,
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    opacity: 0.8,
    cursor: 'pointer',
    userSelect: 'none',
  };

  const tdStyles: React.CSSProperties = {
    padding: '12px',
    borderBottom: '1px solid rgba(148,163,184,0.12)',
    verticalAlign: 'top',
  };

  const rowStyles: React.CSSProperties = {
    cursor: 'pointer',
    transition: 'background 150ms ease',
  };

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return <span style={{ marginLeft: 4 }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <Page
      title="App Latency"
      description={`Track slow queries and API response times (threshold: ${slowThresholdMs}ms)`}
    >
      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          padding: 16,
        }}
      >
        <Card>
          <div style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {stats.total}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: 4 }}>Total Requests</div>
          </div>
        </Card>
        <Card>
          <div style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#ef4444',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {stats.slowCount}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: 4 }}>Slow Requests</div>
          </div>
        </Card>
        <Card>
          <div style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#6366f1',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {formatDuration(stats.overallAvg)}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: 4 }}>Avg Latency</div>
          </div>
        </Card>
        <Card>
          <div style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#f59e0b',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {formatDuration(stats.p95)}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: 4 }}>P95 Latency</div>
          </div>
        </Card>
      </div>

      {/* Source Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          padding: '0 16px 16px',
        }}
      >
        <Card>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>🗄️</span>
              <span style={{ fontWeight: 600 }}>Database</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ opacity: 0.7 }}>Count:</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{stats.dbCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ opacity: 0.7 }}>Avg:</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatDuration(stats.avgDb)}</span>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>📦</span>
              <span style={{ fontWeight: 600 }}>Modules</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ opacity: 0.7 }}>Count:</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{stats.moduleCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ opacity: 0.7 }}>Avg:</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatDuration(stats.avgModule)}</span>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>🌐</span>
              <span style={{ fontWeight: 600 }}>API Calls</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ opacity: 0.7 }}>Count:</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{stats.apiCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ opacity: 0.7 }}>Avg:</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatDuration(stats.avgApi)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div
        style={{
          padding: '0 16px 16px',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 200px', minWidth: 200 }}>
          <Input
            placeholder="Search endpoints, modules, tables..."
            value={searchQuery}
            onChange={(v: string | React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(typeof v === 'string' ? v : v.target?.value ?? '')
            }
          />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>Source:</span>
          {(['all', 'db', 'module', 'api'] as const).map((s) => (
            <Button
              key={s}
              variant={sourceFilter === s ? 'primary' : 'secondary'}
              onClick={() => setSourceFilter(s)}
              style={{ fontSize: 12, padding: '4px 10px' }}
            >
              {s === 'all' ? 'All' : getSourceLabel(s as LatencySource)}
            </Button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button
            variant={showSlowOnly ? 'primary' : 'secondary'}
            onClick={() => setShowSlowOnly(!showSlowOnly)}
            style={{ fontSize: 12, padding: '4px 10px' }}
          >
            🐌 Slow Only
          </Button>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Button
            variant="secondary"
            onClick={() => setShowThresholdModal(true)}
            style={{ fontSize: 12 }}
          >
            ⚙️ Threshold
          </Button>
          <Button
            variant="secondary"
            onClick={() => setEnabled(!enabled)}
            style={{ fontSize: 12 }}
          >
            {enabled ? '⏸ Pause' : '▶ Resume'}
          </Button>
          <Button variant="secondary" onClick={handleExport} style={{ fontSize: 12 }}>
            Export JSON
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowClearConfirm(true)}
            disabled={entries.length === 0}
            style={{ fontSize: 12 }}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      {!enabled && (
        <div style={{ padding: '0 16px 16px' }}>
          <Alert variant="warning" title="Logging Paused">
            Latency logging is currently paused. New requests will not be captured.
          </Alert>
        </div>
      )}

      {/* Latency Table */}
      <div style={{ padding: '0 16px 16px' }}>
        <Card>
          {filteredEntries.length === 0 ? (
            <div style={{ padding: 40 }}>
              <EmptyState
                title={entries.length === 0 ? 'No Requests Captured' : 'No Matching Requests'}
                description={
                  entries.length === 0
                    ? 'Latency data will appear here when requests are tracked.'
                    : 'Try adjusting your search or filters.'
                }
              />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyles}>
                <thead>
                  <tr>
                    <th style={thStyles} onClick={() => handleSort('timestamp')}>
                      Time {sortIndicator('timestamp')}
                    </th>
                    <th style={thStyles} onClick={() => handleSort('source')}>
                      Source {sortIndicator('source')}
                    </th>
                    <th style={thStyles} onClick={() => handleSort('endpoint')}>
                      Endpoint {sortIndicator('endpoint')}
                    </th>
                    <th style={thStyles}>Target</th>
                    <th style={thStyles} onClick={() => handleSort('durationMs')}>
                      Duration {sortIndicator('durationMs')}
                    </th>
                    <th style={thStyles}>Status</th>
                    <th style={{ ...thStyles, width: 60 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => {
                    const severity = getLatencySeverity(entry.durationMs, slowThresholdMs);
                    return (
                      <tr
                        key={entry.id}
                        style={rowStyles}
                        onClick={() => setSelectedEntry(entry)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(148,163,184,0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <td style={tdStyles}>
                          <div style={{ whiteSpace: 'nowrap' }}>{formatRelativeTime(entry.timestamp)}</div>
                          <div style={{ fontSize: 11, opacity: 0.6 }}>
                            {formatDate(entry.timestamp).split(',')[1]}
                          </div>
                        </td>
                        <td style={tdStyles}>
                          <span style={{ marginRight: 6 }}>{getSourceIcon(entry.source)}</span>
                          <Badge variant="default">{getSourceLabel(entry.source)}</Badge>
                        </td>
                        <td style={tdStyles}>
                          <span
                            style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: 12,
                              maxWidth: 250,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block',
                            }}
                            title={entry.endpoint}
                          >
                            {entry.endpoint}
                          </span>
                        </td>
                        <td style={tdStyles}>
                          <span
                            style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: 12,
                              opacity: entry.moduleName || entry.tableName ? 1 : 0.5,
                            }}
                          >
                            {entry.moduleName || entry.tableName || '—'}
                          </span>
                        </td>
                        <td style={tdStyles}>
                          <span
                            style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: 13,
                              fontWeight: 600,
                              color: getSeverityColor(severity),
                            }}
                          >
                            {formatDuration(entry.durationMs)}
                          </span>
                        </td>
                        <td style={tdStyles}>
                          <Badge variant={getSeverityBadgeVariant(severity)}>
                            {severity}
                          </Badge>
                        </td>
                        <td style={tdStyles}>
                          <Button
                            variant="secondary"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              clearEntry(entry.id);
                            }}
                            style={{ fontSize: 11, padding: '4px 8px' }}
                          >
                            ✕
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Entry Detail Modal */}
      <Modal
        open={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        title="Request Details"
      >
        {selectedEntry && (
          <div style={{ padding: 16 }}>
            <Tabs
              tabs={[
                {
                  id: 'overview',
                  label: 'Overview',
                  content: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 16 }}>
                      <DetailRow label="Timestamp" value={formatDate(selectedEntry.timestamp)} />
                      <DetailRow label="Duration" value={formatDuration(selectedEntry.durationMs)} />
                      <DetailRow label="Source" value={getSourceLabel(selectedEntry.source)} />
                      <DetailRow label="Endpoint" value={selectedEntry.endpoint} mono />
                      {selectedEntry.method && (
                        <DetailRow label="Method" value={selectedEntry.method} />
                      )}
                      {selectedEntry.moduleName && (
                        <DetailRow label="Module" value={selectedEntry.moduleName} mono />
                      )}
                      {selectedEntry.tableName && (
                        <DetailRow label="Table" value={selectedEntry.tableName} mono />
                      )}
                      {selectedEntry.queryType && (
                        <DetailRow label="Query Type" value={selectedEntry.queryType} />
                      )}
                      {selectedEntry.status !== undefined && (
                        <DetailRow label="Status" value={String(selectedEntry.status)} />
                      )}
                      {selectedEntry.responseSize !== undefined && (
                        <DetailRow label="Response Size" value={`${selectedEntry.responseSize} bytes`} />
                      )}
                      <DetailRow label="Page URL" value={selectedEntry.pageUrl} mono />
                    </div>
                  ),
                },
                {
                  id: 'payload',
                  label: 'Payload',
                  content: (
                    <div style={{ paddingTop: 16 }}>
                      {selectedEntry.payload ? (
                        <pre
                          style={{
                            background: 'rgba(0,0,0,0.2)',
                            padding: 12,
                            borderRadius: 8,
                            overflow: 'auto',
                            fontSize: 12,
                            fontFamily: 'JetBrains Mono, monospace',
                            maxHeight: 300,
                          }}
                        >
                          {JSON.stringify(selectedEntry.payload, null, 2)}
                        </pre>
                      ) : (
                        <div style={{ opacity: 0.6, fontSize: 13 }}>No payload captured.</div>
                      )}
                    </div>
                  ),
                },
                {
                  id: 'metadata',
                  label: 'Metadata',
                  content: (
                    <div style={{ paddingTop: 16 }}>
                      {selectedEntry.metadata && Object.keys(selectedEntry.metadata).length > 0 ? (
                        <pre
                          style={{
                            background: 'rgba(0,0,0,0.2)',
                            padding: 12,
                            borderRadius: 8,
                            overflow: 'auto',
                            fontSize: 12,
                            fontFamily: 'JetBrains Mono, monospace',
                            maxHeight: 300,
                          }}
                        >
                          {JSON.stringify(selectedEntry.metadata, null, 2)}
                        </pre>
                      ) : (
                        <div style={{ opacity: 0.6, fontSize: 13 }}>No additional metadata.</div>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* Clear Confirmation Modal */}
      <Modal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear All Entries?"
      >
        <div style={{ padding: 16 }}>
          <p style={{ marginBottom: 16 }}>
            This will permanently delete all {entries.length} logged entries. This action cannot be
            undone.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setShowClearConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleClearAll}>Clear All</Button>
          </div>
        </div>
      </Modal>

      {/* Threshold Settings Modal */}
      <Modal
        open={showThresholdModal}
        onClose={() => setShowThresholdModal(false)}
        title="Slow Threshold Settings"
      >
        <div style={{ padding: 16 }}>
          <p style={{ marginBottom: 16, opacity: 0.8 }}>
            Requests slower than this threshold will be marked as &quot;slow&quot;.
          </p>
          <div style={{ marginBottom: 16 }}>
            <Input
              type="number"
              placeholder="Threshold in milliseconds"
              value={newThreshold}
              onChange={(v: string | React.ChangeEvent<HTMLInputElement>) =>
                setNewThreshold(typeof v === 'string' ? v : v.target?.value ?? '')
              }
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setShowThresholdModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetThreshold}>Save</Button>
          </div>
        </div>
      </Modal>
    </Page>
  );
}

// =============================================================================
// DETAIL ROW COMPONENT
// =============================================================================

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <span style={{ width: 120, flexShrink: 0, fontSize: 12, opacity: 0.7, fontWeight: 500 }}>
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit',
          wordBreak: 'break-word',
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default AppLatency;

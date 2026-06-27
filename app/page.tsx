'use client';

import { useEffect, useMemo, useState } from 'react';
import JSONFormatter, { countJSONMatches } from '@/components/JSONFormatter';
import type { JSONValue } from '@/components/JSONFormatter';
import {
  AlertTriangle,
  Braces,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  Eraser,
  FileJson2,
  Search,
  Sparkles,
  X,
} from 'lucide-react';

const MAX_NESTED_JSON_PARSE_DEPTH = 20;

function looksLikeJSONObjectOrArray(value: string) {
  const trimmed = value.trim();

  return (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  );
}

function parseNestedJSONString(value: JSONValue, depth = 0): JSONValue {
  if (depth >= MAX_NESTED_JSON_PARSE_DEPTH) {
    return value;
  }

  if (typeof value === 'string') {
    if (!looksLikeJSONObjectOrArray(value)) {
      return value;
    }

    try {
      return parseNestedJSONString(JSON.parse(value) as JSONValue, depth + 1);
    } catch {
      return value;
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => parseNestedJSONString(item, depth + 1));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, parseNestedJSONString(item, depth + 1)])
    ) as JSONValue;
  }

  return value;
}

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [parsedJSON, setParsedJSON] = useState<JSONValue | undefined>(undefined);
  const [outputSearch, setOutputSearch] = useState('');
  const [activeOutputMatchIndex, setActiveOutputMatchIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const formatJSON = () => {
    if (!inputValue.trim()) {
      setError('Please enter JSON');
      setParsedJSON(undefined);
      return;
    }

    try {
      setParsedJSON(parseNestedJSONString(JSON.parse(inputValue) as JSONValue));
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setParsedJSON(undefined);
    }
  };

  const clearAll = () => {
    setInputValue('');
    setParsedJSON(undefined);
    setOutputSearch('');
    setError(null);
  };

  const hasOutput = parsedJSON !== undefined;
  const normalizedOutputSearch = outputSearch.trim();
  const outputSearchMatches = useMemo(
    () =>
      hasOutput && normalizedOutputSearch ? countJSONMatches(parsedJSON, normalizedOutputSearch) : 0,
    [hasOutput, normalizedOutputSearch, parsedJSON]
  );
  const hasOutputSearch = Boolean(normalizedOutputSearch);
  const hasOutputSearchMatches = outputSearchMatches > 0;
  const status = error ? 'Invalid' : hasOutput ? 'Valid' : 'Ready';

  useEffect(() => {
    setActiveOutputMatchIndex(0);
  }, [normalizedOutputSearch, parsedJSON]);

  useEffect(() => {
    if (outputSearchMatches === 0) {
      setActiveOutputMatchIndex(0);
      return;
    }

    setActiveOutputMatchIndex((current) => Math.min(current, outputSearchMatches - 1));
  }, [outputSearchMatches]);

  const goToPreviousOutputMatch = () => {
    if (!hasOutputSearchMatches) return;

    setActiveOutputMatchIndex(
      (current) => (current - 1 + outputSearchMatches) % outputSearchMatches
    );
  };

  const goToNextOutputMatch = () => {
    if (!hasOutputSearchMatches) return;

    setActiveOutputMatchIndex((current) => (current + 1) % outputSearchMatches);
  };

  return (
    <div className="tech-shell min-h-screen overflow-hidden text-slate-100">
      <header className="shrink-0 border-b border-white/10 bg-[#080b10]/80 backdrop-blur-xl">
        <div className="page-frame flex min-h-20 flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="brand-mark">
              <Braces className="h-5 w-5" strokeWidth={2.4} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">JSON Formatter</h1>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                <span className="status-dot" />
                <span>Local parser</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="metric-pill">
              <Code2 className="h-3.5 w-3.5 text-cyan-300" />
              <span>{inputValue.length.toLocaleString()} chars</span>
            </div>
            <button onClick={clearAll} className="btn-secondary h-10 px-4 text-sm">
              <Eraser className="h-4 w-4" />
              <span>Clear</span>
            </button>
            <button onClick={formatJSON} className="btn-primary h-10 px-5 text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Format</span>
            </button>
          </div>
        </div>
      </header>

      <main className="page-frame relative flex flex-1 flex-col px-4 py-5 sm:px-6 lg:h-[calc(100vh-5rem)] lg:py-6">
        <section className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="signal-strip">
            <span className="signal-label">Mode</span>
            <span className="signal-value">Beautify</span>
          </div>
          <div className="signal-strip">
            <span className="signal-label">Runtime</span>
            <span className="signal-value">Browser</span>
          </div>
          <div className="signal-strip">
            <span className="signal-label">Status</span>
            <span className={error ? 'signal-value text-rose-300' : 'signal-value text-emerald-300'}>
              {status}
            </span>
          </div>
        </section>

        <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
          <div className="panel flex min-h-[28rem] flex-col overflow-hidden">
            <div className="panel-head">
              <div className="flex items-center gap-2">
                <FileJson2 className="h-4 w-4 text-cyan-300" />
                <span>Input</span>
              </div>
              <span className="panel-meta">{inputValue.length.toLocaleString()} characters</span>
            </div>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`{\n  "status": "ready"\n}`}
              className="font-code min-h-0 flex-1 resize-none bg-transparent p-5 text-sm leading-7 text-slate-100 caret-cyan-300 outline-none placeholder:text-slate-600"
              spellCheck={false}
            />
          </div>

          <div className="panel flex min-h-[28rem] flex-col overflow-hidden">
            <div className="panel-head">
              <div className="flex items-center gap-2">
                <Braces className="h-4 w-4 text-emerald-300" />
                <span>Output</span>
              </div>
              <span className="panel-meta">
                {normalizedOutputSearch
                  ? `${outputSearchMatches.toLocaleString()} matches`
                  : hasOutput
                    ? 'Formatted'
                    : 'Standby'}
              </span>
            </div>
            <div className="relative z-10 border-b border-white/10 bg-slate-950/25 px-4 py-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="relative flex min-w-0 flex-1 items-center">
                  <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-500" />
                  <input
                    value={outputSearch}
                    onChange={(event) => setOutputSearch(event.target.value)}
                    disabled={!hasOutput || Boolean(error)}
                    placeholder={hasOutput && !error ? 'Search keys or values' : 'Search after formatting'}
                    className="font-code h-10 w-full rounded-xl border border-white/10 bg-slate-950/55 pl-9 pr-10 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-300/55 disabled:cursor-not-allowed disabled:opacity-45"
                    spellCheck={false}
                  />
                  {outputSearch && (
                    <button
                      type="button"
                      onClick={() => setOutputSearch('')}
                      aria-label="Clear output search"
                      title="Clear output search"
                      className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </label>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="min-w-16 text-right text-xs font-medium text-slate-500">
                    {hasOutputSearch
                      ? hasOutputSearchMatches
                        ? `${(activeOutputMatchIndex + 1).toLocaleString()}/${outputSearchMatches.toLocaleString()}`
                        : '0 found'
                      : 'Keys + values'}
                  </span>
                  <button
                    type="button"
                    onClick={goToPreviousOutputMatch}
                    disabled={!hasOutputSearchMatches}
                    aria-label="Previous output search match"
                    title="Previous output search match"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={goToNextOutputMatch}
                    disabled={!hasOutputSearchMatches}
                    aria-label="Next output search match"
                    title="Next output search match"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-5">
              {error ? (
                <div className="alert-panel">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                  <p className="font-code text-sm text-rose-100">{error}</p>
                </div>
              ) : hasOutput ? (
                <JSONFormatter
                  data={parsedJSON}
                  searchTerm={normalizedOutputSearch}
                  activeMatchIndex={activeOutputMatchIndex}
                />
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p>Awaiting output</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

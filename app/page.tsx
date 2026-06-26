'use client';

import { useState } from 'react';
import JSONFormatter from '@/components/JSONFormatter';
import type { JSONValue } from '@/components/JSONFormatter';
import {
  AlertTriangle,
  Braces,
  CheckCircle2,
  Code2,
  Eraser,
  FileJson2,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [parsedJSON, setParsedJSON] = useState<JSONValue | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const formatJSON = () => {
    if (!inputValue.trim()) {
      setError('Please enter JSON');
      setParsedJSON(undefined);
      return;
    }

    try {
      setParsedJSON(JSON.parse(inputValue) as JSONValue);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setParsedJSON(undefined);
    }
  };

  const clearAll = () => {
    setInputValue('');
    setParsedJSON(undefined);
    setError(null);
  };

  const hasOutput = parsedJSON !== undefined;
  const status = error ? 'Invalid' : hasOutput ? 'Valid' : 'Ready';

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
              <span className="panel-meta">{hasOutput ? 'Formatted' : 'Standby'}</span>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-5">
              {error ? (
                <div className="alert-panel">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                  <p className="font-code text-sm text-rose-100">{error}</p>
                </div>
              ) : hasOutput ? (
                <JSONFormatter data={parsedJSON} />
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

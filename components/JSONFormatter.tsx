'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export type JSONValue =
  | null
  | boolean
  | number
  | string
  | JSONValue[]
  | { [key: string]: JSONValue };

interface JSONFormatterProps {
  data: JSONValue;
}

export default function JSONFormatter({ data }: JSONFormatterProps) {
  return (
    <div className="font-code min-w-max text-sm leading-7">
      <JSONNode value={data} depth={0} />
    </div>
  );
}

interface JSONNodeProps {
  value: JSONValue;
  depth: number;
  objectKey?: string;
}

function KeyLabel({ objectKey }: { objectKey?: string }) {
  if (!objectKey) return null;

  return (
    <>
      <span className="font-medium text-cyan-300">&quot;{objectKey}&quot;</span>
      <span className="text-slate-500">: </span>
    </>
  );
}

function CollapseButton({
  collapsed,
  label,
  onClick,
}: {
  collapsed: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="mr-2 mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-200"
    >
      <ChevronRight
        className="h-4 w-4 transition-transform duration-200"
        style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}
      />
    </button>
  );
}

function CountBadge({ children, tone }: { children: React.ReactNode; tone: 'cyan' | 'blue' }) {
  const toneClass =
    tone === 'cyan'
      ? 'border-cyan-400/25 bg-cyan-400/10 text-cyan-200'
      : 'border-blue-400/25 bg-blue-400/10 text-blue-200';

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${toneClass}`}>
      {children}
    </span>
  );
}

function PrimitiveValue({ value, objectKey }: { value: JSONValue; objectKey?: string }) {
  if (value === null) {
    return (
      <div className="inline-flex items-center gap-1">
        <KeyLabel objectKey={objectKey} />
        <span className="font-semibold text-rose-300">null</span>
      </div>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <div className="inline-flex items-center gap-1">
        <KeyLabel objectKey={objectKey} />
        <span className="font-semibold text-amber-300">{String(value)}</span>
      </div>
    );
  }

  if (typeof value === 'number') {
    return (
      <div className="inline-flex items-center gap-1">
        <KeyLabel objectKey={objectKey} />
        <span className="font-semibold text-blue-300">{value}</span>
      </div>
    );
  }

  if (typeof value === 'string') {
    return (
      <div className="inline-flex items-center gap-1">
        <KeyLabel objectKey={objectKey} />
        <span className="text-emerald-300">&quot;{value}&quot;</span>
      </div>
    );
  }

  return null;
}

function JSONNode({ value, depth, objectKey }: JSONNodeProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (value === null || typeof value !== 'object') {
    return <PrimitiveValue value={value} objectKey={objectKey} />;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <div className="inline-flex items-center gap-1">
          <KeyLabel objectKey={objectKey} />
          <span className="text-slate-500">[]</span>
        </div>
      );
    }

    return (
      <div className="my-1">
        <div className="flex items-start">
          <CollapseButton
            collapsed={collapsed}
            label={collapsed ? 'Expand array' : 'Collapse array'}
            onClick={() => setCollapsed(!collapsed)}
          />

          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2">
              <KeyLabel objectKey={objectKey} />
              <span className="font-semibold text-slate-300">[</span>
              <CountBadge tone="blue">{value.length}</CountBadge>
              {collapsed && <span className="text-slate-600">...</span>}
            </div>

            {!collapsed && (
              <div className="ml-4 mt-1.5 space-y-1 border-l border-slate-700/80 pl-4">
                {value.map((item, index) => (
                  <div
                    key={`${depth}-${index}`}
                    className="-ml-2 rounded-md px-2 py-0.5 transition-colors duration-150 hover:bg-white/[0.04]"
                  >
                    <JSONNode value={item} depth={depth + 1} />
                    {index < value.length - 1 && <span className="text-slate-600">,</span>}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-0.5 font-semibold text-slate-300">]</div>
          </div>
        </div>
      </div>
    );
  }

  const keys = Object.keys(value);

  if (keys.length === 0) {
    return (
      <div className="inline-flex items-center gap-1">
        <KeyLabel objectKey={objectKey} />
        <span className="text-slate-500">{'{}'}</span>
      </div>
    );
  }

  return (
    <div className="my-1">
      <div className="flex items-start">
        <CollapseButton
          collapsed={collapsed}
          label={collapsed ? 'Expand object' : 'Collapse object'}
          onClick={() => setCollapsed(!collapsed)}
        />

        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-2">
            <KeyLabel objectKey={objectKey} />
            <span className="font-semibold text-slate-300">{'{'}</span>
            <CountBadge tone="cyan">{keys.length}</CountBadge>
            {collapsed && <span className="text-slate-600">...</span>}
          </div>

          {!collapsed && (
            <div className="ml-4 mt-1.5 space-y-1 border-l border-slate-700/80 pl-4">
              {keys.map((key, index) => (
                <div
                  key={key}
                  className="-ml-2 rounded-md px-2 py-0.5 transition-colors duration-150 hover:bg-white/[0.04]"
                >
                  <JSONNode value={value[key]} objectKey={key} depth={depth + 1} />
                  {index < keys.length - 1 && <span className="text-slate-600">,</span>}
                </div>
              ))}
            </div>
          )}

          <div className="mt-0.5 font-semibold text-slate-300">{'}'}</div>
        </div>
      </div>
    </div>
  );
}

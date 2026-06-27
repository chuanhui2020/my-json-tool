'use client';

import { useEffect, useRef, useState } from 'react';
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
  searchTerm?: string;
  activeMatchIndex?: number;
}

function countTextMatches(text: string, searchTerm: string): number {
  const query = searchTerm.trim().toLowerCase();

  if (!query) {
    return 0;
  }

  const lowerText = text.toLowerCase();
  let count = 0;
  let cursor = lowerText.indexOf(query);

  while (cursor !== -1) {
    count += 1;
    cursor = lowerText.indexOf(query, cursor + query.length);
  }

  return count;
}

export function countJSONMatches(value: JSONValue, searchTerm: string): number {
  const query = searchTerm.trim().toLowerCase();

  if (!query) {
    return 0;
  }

  if (value === null || typeof value !== 'object') {
    return countTextMatches(String(value), query);
  }

  if (Array.isArray(value)) {
    return value.reduce<number>((count, item) => count + countJSONMatches(item, query), 0);
  }

  return Object.entries(value).reduce<number>((count, [key, item]) => {
    const keyMatch = countTextMatches(key, query);

    return count + keyMatch + countJSONMatches(item, query);
  }, 0);
}

function valueHasActiveMatch(value: JSONValue, searchTerm: string, activeMatchIndex: number) {
  return activeMatchIndex >= 0 && activeMatchIndex < countJSONMatches(value, searchTerm);
}

export default function JSONFormatter({
  data,
  searchTerm = '',
  activeMatchIndex = 0,
}: JSONFormatterProps) {
  const normalizedSearchTerm = searchTerm.trim();

  return (
    <div className="font-code min-w-max text-sm leading-7">
      <JSONNode
        value={data}
        depth={0}
        searchTerm={normalizedSearchTerm}
        activeMatchIndex={activeMatchIndex}
      />
    </div>
  );
}

interface JSONNodeProps {
  value: JSONValue;
  depth: number;
  objectKey?: string;
  searchTerm: string;
  activeMatchIndex: number;
}

function HighlightedText({
  text,
  searchTerm,
  matchStartIndex,
  activeMatchIndex,
  className,
}: {
  text: string;
  searchTerm: string;
  matchStartIndex: number;
  activeMatchIndex: number;
  className?: string;
}) {
  const activeMatchRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    activeMatchRef.current?.scrollIntoView({
      block: 'center',
      inline: 'center',
      behavior: 'smooth',
    });
  }, [activeMatchIndex, searchTerm]);

  if (!searchTerm) {
    return <span className={className}>{text}</span>;
  }

  const lowerText = text.toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let matchIndex = lowerText.indexOf(lowerSearchTerm);
  let localMatchOffset = 0;

  while (matchIndex !== -1) {
    if (matchIndex > cursor) {
      parts.push(text.slice(cursor, matchIndex));
    }

    const endIndex = matchIndex + searchTerm.length;
    const absoluteMatchIndex = matchStartIndex + localMatchOffset;
    const isActiveMatch = absoluteMatchIndex === activeMatchIndex;

    parts.push(
      <mark
        key={`${matchIndex}-${endIndex}`}
        ref={isActiveMatch ? activeMatchRef : undefined}
        className={
          isActiveMatch
            ? 'rounded bg-orange-300 px-1 py-0.5 font-bold text-slate-950 ring-2 ring-orange-100/90'
            : 'rounded bg-yellow-300/85 px-0.5 font-semibold text-slate-950'
        }
      >
        {text.slice(matchIndex, endIndex)}
      </mark>
    );

    cursor = endIndex;
    localMatchOffset += 1;
    matchIndex = lowerText.indexOf(lowerSearchTerm, cursor);
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return <span className={className}>{parts}</span>;
}

function KeyLabel({
  objectKey,
  searchTerm,
  matchStartIndex,
  activeMatchIndex,
}: {
  objectKey?: string;
  searchTerm: string;
  matchStartIndex: number;
  activeMatchIndex: number;
}) {
  if (!objectKey) return null;

  return (
    <>
      <span className="font-medium text-cyan-300">
        &quot;<HighlightedText
          text={objectKey}
          searchTerm={searchTerm}
          matchStartIndex={matchStartIndex}
          activeMatchIndex={activeMatchIndex}
        />&quot;
      </span>
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

function PrimitiveValue({
  value,
  objectKey,
  searchTerm,
  activeMatchIndex,
}: {
  value: JSONValue;
  objectKey?: string;
  searchTerm: string;
  activeMatchIndex: number;
}) {
  const keyMatchCount = objectKey ? countTextMatches(objectKey, searchTerm) : 0;
  const primitiveMatchStartIndex = keyMatchCount;

  if (value === null) {
    return (
      <div className="inline-flex items-center gap-1">
        <KeyLabel
          objectKey={objectKey}
          searchTerm={searchTerm}
          matchStartIndex={0}
          activeMatchIndex={activeMatchIndex}
        />
        <HighlightedText
          text="null"
          searchTerm={searchTerm}
          matchStartIndex={primitiveMatchStartIndex}
          activeMatchIndex={activeMatchIndex}
          className="font-semibold text-rose-300"
        />
      </div>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <div className="inline-flex items-center gap-1">
        <KeyLabel
          objectKey={objectKey}
          searchTerm={searchTerm}
          matchStartIndex={0}
          activeMatchIndex={activeMatchIndex}
        />
        <HighlightedText
          text={String(value)}
          searchTerm={searchTerm}
          matchStartIndex={primitiveMatchStartIndex}
          activeMatchIndex={activeMatchIndex}
          className="font-semibold text-amber-300"
        />
      </div>
    );
  }

  if (typeof value === 'number') {
    return (
      <div className="inline-flex items-center gap-1">
        <KeyLabel
          objectKey={objectKey}
          searchTerm={searchTerm}
          matchStartIndex={0}
          activeMatchIndex={activeMatchIndex}
        />
        <HighlightedText
          text={String(value)}
          searchTerm={searchTerm}
          matchStartIndex={primitiveMatchStartIndex}
          activeMatchIndex={activeMatchIndex}
          className="font-semibold text-blue-300"
        />
      </div>
    );
  }

  if (typeof value === 'string') {
    return (
      <div className="inline-flex items-center gap-1">
        <KeyLabel
          objectKey={objectKey}
          searchTerm={searchTerm}
          matchStartIndex={0}
          activeMatchIndex={activeMatchIndex}
        />
        <span className="text-emerald-300">
          &quot;<HighlightedText
            text={value}
            searchTerm={searchTerm}
            matchStartIndex={primitiveMatchStartIndex}
            activeMatchIndex={activeMatchIndex}
          />&quot;
        </span>
      </div>
    );
  }

  return null;
}

function JSONNode({ value, depth, objectKey, searchTerm, activeMatchIndex }: JSONNodeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const keyMatchCount = objectKey ? countTextMatches(objectKey, searchTerm) : 0;
  const activeMatchIsInKey = activeMatchIndex < keyMatchCount;
  const activeChildMatchIndex = activeMatchIndex - keyMatchCount;
  const containsActiveMatch =
    Boolean(searchTerm) &&
    !activeMatchIsInKey &&
    valueHasActiveMatch(value, searchTerm, activeChildMatchIndex);

  useEffect(() => {
    if (containsActiveMatch) {
      setCollapsed(false);
    }
  }, [containsActiveMatch, activeMatchIndex, searchTerm]);

  const isCollapsed = collapsed;

  if (value === null || typeof value !== 'object') {
    return (
      <PrimitiveValue
        value={value}
        objectKey={objectKey}
        searchTerm={searchTerm}
        activeMatchIndex={activeMatchIndex}
      />
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <div className="inline-flex items-center gap-1">
          <KeyLabel
            objectKey={objectKey}
            searchTerm={searchTerm}
            matchStartIndex={0}
            activeMatchIndex={activeMatchIndex}
          />
          <span className="text-slate-500">[]</span>
        </div>
      );
    }

    return (
      <div className="my-1">
        <div className="flex items-start">
          <CollapseButton
            collapsed={isCollapsed}
            label={isCollapsed ? 'Expand array' : 'Collapse array'}
            onClick={() => setCollapsed(!collapsed)}
          />

          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2">
              <KeyLabel
                objectKey={objectKey}
                searchTerm={searchTerm}
                matchStartIndex={0}
                activeMatchIndex={activeMatchIndex}
              />
              <span className="font-semibold text-slate-300">[</span>
              <CountBadge tone="blue">{value.length}</CountBadge>
              {isCollapsed && <span className="text-slate-600">...</span>}
            </div>

            {!isCollapsed && (
              <div className="ml-4 mt-1.5 space-y-1 border-l border-slate-700/80 pl-4">
                {value.map((item, index) => {
                  const previousMatchCount = value
                    .slice(0, index)
                    .reduce<number>((count, previousItem) => {
                      return count + countJSONMatches(previousItem, searchTerm);
                    }, 0);

                  return (
                    <div
                      key={`${depth}-${index}`}
                      className="-ml-2 rounded-md px-2 py-0.5 transition-colors duration-150 hover:bg-white/[0.04]"
                    >
                      <JSONNode
                        value={item}
                        depth={depth + 1}
                        searchTerm={searchTerm}
                        activeMatchIndex={activeChildMatchIndex - previousMatchCount}
                      />
                      {index < value.length - 1 && <span className="text-slate-600">,</span>}
                    </div>
                  );
                })}
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
        <KeyLabel
          objectKey={objectKey}
          searchTerm={searchTerm}
          matchStartIndex={0}
          activeMatchIndex={activeMatchIndex}
        />
        <span className="text-slate-500">{'{}'}</span>
      </div>
    );
  }

  return (
    <div className="my-1">
      <div className="flex items-start">
        <CollapseButton
          collapsed={isCollapsed}
          label={isCollapsed ? 'Expand object' : 'Collapse object'}
          onClick={() => setCollapsed(!collapsed)}
        />

        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-2">
            <KeyLabel
              objectKey={objectKey}
              searchTerm={searchTerm}
              matchStartIndex={0}
              activeMatchIndex={activeMatchIndex}
            />
            <span className="font-semibold text-slate-300">{'{'}</span>
            <CountBadge tone="cyan">{keys.length}</CountBadge>
            {isCollapsed && <span className="text-slate-600">...</span>}
          </div>

          {!isCollapsed && (
            <div className="ml-4 mt-1.5 space-y-1 border-l border-slate-700/80 pl-4">
              {keys.map((key, index) => {
                const previousMatchCount = keys.slice(0, index).reduce<number>((count, itemKey) => {
                  const itemKeyMatchCount = countTextMatches(itemKey, searchTerm);

                  return count + itemKeyMatchCount + countJSONMatches(value[itemKey], searchTerm);
                }, 0);

                return (
                  <div
                    key={key}
                    className="-ml-2 rounded-md px-2 py-0.5 transition-colors duration-150 hover:bg-white/[0.04]"
                  >
                    <JSONNode
                      value={value[key]}
                      objectKey={key}
                      depth={depth + 1}
                      searchTerm={searchTerm}
                      activeMatchIndex={activeChildMatchIndex - previousMatchCount}
                    />
                    {index < keys.length - 1 && <span className="text-slate-600">,</span>}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-0.5 font-semibold text-slate-300">{'}'}</div>
        </div>
      </div>
    </div>
  );
}

// components/QueueBox.tsx
"use client";

import React from 'react';

interface QueueBoxProps {
  title: string;
  icon: string;
  tasks: string[];
  type: 'microtask' | 'macrotask';
  badgeColor: string; // e.g. "rose" or "blue"
  emptyMessage: string;
}

export default function QueueBox({
  title,
  icon,
  tasks,
  type,
  badgeColor,
  emptyMessage
}: QueueBoxProps) {
  const isMicro = type === 'microtask';

  // CSS themes based on type
  const theme = isMicro
    ? {
        border: 'border-rose-900/40',
        text: 'text-rose-400',
        bg: 'bg-rose-500/10',
        itemBg: 'bg-rose-950/40',
        itemBorder: 'border-rose-900/60',
        itemText: 'text-rose-200',
        headBg: 'from-rose-500/20 to-rose-600/10',
        headBorder: 'border-rose-500/30'
      }
    : {
        border: 'border-blue-900/40',
        text: 'text-blue-400',
        bg: 'bg-blue-500/10',
        itemBg: 'bg-blue-950/40',
        itemBorder: 'border-blue-900/60',
        itemText: 'text-blue-200',
        headBg: 'from-blue-500/20 to-blue-600/10',
        headBorder: 'border-blue-500/30'
      };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col shadow-xl h-full min-h-0">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.text}`}>
            {title}
          </h3>
        </div>
        <span className={`text-xs ${theme.bg} ${theme.text} px-2 py-0.5 rounded-full font-semibold border ${theme.border} font-mono`}>
          Size: {tasks.length}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
        {tasks.map((task, i) => {
          const isHead = i === 0;
          return (
            <div
              key={i}
              className={`font-mono text-xs p-3 rounded-lg border transition-all duration-300 ${
                isHead
                  ? `bg-gradient-to-r ${theme.headBg} ${theme.itemText} ${theme.headBorder} font-bold shadow-md`
                  : `${theme.itemBg} ${theme.itemText} ${theme.itemBorder}`
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-bold">#{i + 1}</span>
                  <span className="truncate">{task}</span>
                </div>
                {isHead && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide bg-slate-800 ${theme.text}`}>
                    Next Up
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {tasks.length === 0 && (
          <div className="text-slate-500 font-mono italic text-xs text-center my-auto py-8">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}

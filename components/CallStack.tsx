// components/CallStack.tsx
"use client";

import React from 'react';

interface CallStackProps {
  frames: string[];
}

export default function CallStack({ frames }: CallStackProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col shadow-xl h-full min-h-0">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl"></span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
            Call Stack
          </h3>
        </div>
        <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-semibold border border-amber-500/20 font-mono">
          Depth: {frames.length}
        </span>
      </div>

      <div className="flex-1 flex flex-col-reverse justify-end gap-2 overflow-y-auto pr-1">
        {frames.map((frame, i) => {
          const isTop = i === frames.length - 1;
          return (
            <div
              key={i}
              className={`font-mono text-xs p-3 rounded-lg border transition-all duration-300 transform translate-y-0 ${
                isTop
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold border-amber-400 shadow-lg shadow-orange-950/30 scale-102 animate-pulse'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/80 font-medium'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="truncate">{frame}</span>
                {isTop && (
                  <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                    Active
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {frames.length === 0 && (
          <div className="text-slate-500 font-mono italic text-xs text-center my-auto py-8">
            Stack Empty (Idle)
          </div>
        )}
      </div>
    </div>
  );
}

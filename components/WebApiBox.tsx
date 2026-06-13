// components/WebApiBox.tsx
"use client";

import React from 'react';
import { WebTask } from '../types/visualizer';

interface WebApiBoxProps {
  tasks: WebTask[];
}

export default function WebApiBox({ tasks }: WebApiBoxProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col shadow-xl h-full min-h-0">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌐</span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">
            Web APIs (Background)
          </h3>
        </div>
        <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full font-semibold border border-purple-500/20 font-mono">
          Active: {tasks.length}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
        {tasks.map((task, i) => {
          const isFetch = task.name.toLowerCase().includes('fetch');
          const isInterval = task.name.toLowerCase().includes('interval');
          const isTimeout = task.name.toLowerCase().includes('timeout');

          let icon = '⏱️';
          if (isFetch) icon = '📡';
          if (isInterval) icon = '🔁';

          return (
            <div
              key={task.id || i}
              className="bg-purple-950/20 border border-purple-900/50 text-purple-200 font-mono text-xs p-3 rounded-lg flex items-center justify-between hover:bg-purple-950/30 transition-all duration-300"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-sm">{icon}</span>
                <span className="truncate font-semibold">{task.name}</span>
              </div>
              <div className="flex gap-2 items-center flex-shrink-0">
                {isTimeout && task.timer > 0 && (
                  <span className="text-[10px] text-purple-300 bg-purple-900/40 border border-purple-800/60 px-1.5 py-0.5 rounded font-mono font-bold">
                    {task.timer}ms
                  </span>
                )}
                <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide animate-pulse">
                  Executing
                </span>
              </div>
            </div>
          );
        })}
        {tasks.length === 0 && (
          <div className="text-slate-500 font-mono italic text-xs text-center my-auto py-8">
            No Active Web APIs
          </div>
        )}
      </div>
    </div>
  );
}

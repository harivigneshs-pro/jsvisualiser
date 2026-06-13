// components/TemplateSelector.tsx
"use client";

import React from 'react';

const TEMPLATES = [
  {
    id: 'basic',
    name: '🎯 Event Loop Basics',
    description: 'Callstack execution vs Microtasks (Promise) vs Macrotasks (Timeout)',
    code: `console.log("1: Synchronous start");

setTimeout(() => {
  console.log("2: Timeout (macrotask) callback");
}, 0);

Promise.resolve().then(() => {
  console.log("3: Promise (microtask) callback");
});

console.log("4: Synchronous end");`
  },
  {
    id: 'chaining',
    name: '🔗 Promise Chaining',
    description: 'Sequential resolution of microtasks and nested promise schedules',
    code: `console.log("Start");

setTimeout(() => {
  console.log("Timeout 1");
}, 0);

Promise.resolve()
  .then(() => {
    console.log("Promise 1");
    return "Promise 1 Chain";
  })
  .then((res) => {
    console.log(res);
    Promise.resolve().then(() => {
      console.log("Nested Promise");
    });
  });

setTimeout(() => {
  console.log("Timeout 2");
}, 0);

console.log("End");`
  },
  {
    id: 'delays',
    name: '⏳ Timer Delays',
    description: 'How setTimeout delay timings affect macrotask queue sequence',
    code: `console.log("Start");

setTimeout(() => {
  console.log("Timeout (100ms) callback");
}, 100);

setTimeout(() => {
  console.log("Timeout (0ms) callback");
}, 0);

Promise.resolve().then(() => {
  console.log("Promise callback");
});

console.log("End");`
  },
  {
    id: 'apis',
    name: '📡 Fetch & Microtasks',
    description: 'Combining fetch network APIs and queueMicrotask schedules',
    code: `console.log("Start");

fetch("https://api.example.com/data")
  .then(res => res.json())
  .then(data => {
    console.log("Fetch success:", data.data);
  });

queueMicrotask(() => {
  console.log("queueMicrotask callback");
});

setTimeout(() => {
  console.log("setTimeout callback");
}, 0);

console.log("End");`
  },
  {
    id: 'custom-class',
    name: '⚙️ Custom Simulation Class',
    description: 'The original EventLoopSimulation mock-class implementation',
    code: `class EventLoopSimulation {
  constructor() {
    this.microtaskQueue = [];
    this.macrotaskQueue = [];
    this.executionLog = [];
  }

  log(message) {
    this.executionLog.push(message);
    console.log(\`[LOG]: \${message}\`);
  }

  queueMacrotask(callback) {
    this.macrotaskQueue.push(callback);
  }

  queueMicrotask(callback) {
    this.microtaskQueue.push(callback);
  }

  createPromise(executor) {
    let thenCallbacks = [];
    let isResolved = false;
    let resolvedData = null;

    const resolve = (data) => {
      isResolved = true;
      resolvedData = data;
      while (thenCallbacks.length > 0) {
        const cb = thenCallbacks.shift();
        this.queueMicrotask(() => cb(resolvedData));
      }
    };

    executor(resolve);

    return {
      then: (onFulfilled) => {
        if (isResolved) {
          this.queueMicrotask(() => onFulfilled(resolvedData));
        } else {
          thenCallbacks.push(onFulfilled);
        }
      }
    };
  }

  runEngine() {
    while (this.microtaskQueue.length > 0 || this.macrotaskQueue.length > 0) {
      while (this.microtaskQueue.length > 0) {
        const microtask = this.microtaskQueue.shift();
        microtask();
      }
      if (this.macrotaskQueue.length > 0) {
        const macrotask = this.macrotaskQueue.shift();
        macrotask();
      }
    }
  }
}

const runtime = new EventLoopSimulation();

runtime.log("1: Start");

const delayPromise = runtime.createPromise((resolve) => {
  runtime.queueMacrotask(() => {
    runtime.log("2: Timeout 1 trigger");
    resolve("3: Resolved data");
  });
});

delayPromise.then((data) => {
  runtime.log(data);
  runtime.queueMicrotask(() => {
    runtime.log("4: Microtask inside resolved promise");
  });
});

runtime.queueMacrotask(() => {
  runtime.log("5: Timeout 2 trigger");
});

runtime.queueMicrotask(() => {
  runtime.log("6: Instant microtask");
});

runtime.log("7: End");

runtime.runEngine();`
  }
];

interface TemplateSelectorProps {
  onSelect: (code: string) => void;
  currentTemplateId: string;
  setCurrentTemplateId: (id: string) => void;
}

export default function TemplateSelector({
  onSelect,
  currentTemplateId,
  setCurrentTemplateId
}: TemplateSelectorProps) {
  return (
    <div className="flex flex-col gap-1 flex-shrink-0">
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
        Select Code Preset
      </label>
      <select
        value={currentTemplateId}
        onChange={(e) => {
          const id = e.target.value;
          setCurrentTemplateId(id);
          const template = TEMPLATES.find((t) => t.id === id);
          if (template) {
            onSelect(template.code);
          }
        }}
        className="bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs px-3 py-2 font-semibold shadow-inner focus:outline-none focus:border-teal-500 transition cursor-pointer w-64"
      >
        {TEMPLATES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}
export { TEMPLATES };

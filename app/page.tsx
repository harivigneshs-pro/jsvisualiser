"use client";
import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { DynamicInterpreter } from '../utils/interpreter';
import { VisualizerState } from '../types/visualizer';

const DEFAULT_CODE = `console.log("First");

setTimeout(() => {
  console.log("Second");
}, 0);

Promise.resolve().then(() => {
  console.log("Third");
});

console.log("Fourth");`;

export default function Home() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [timeline, setTimeline] = useState<VisualizerState[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [editorRef, setEditorRef] = useState<any>(null);
  const [decorations, setDecorations] = useState<string[]>([]);

  // Derived tracking state representation
  const currentState = timeline[stepIndex] || {
    callStack: [], webAPIs: [], microtaskQueue: [], macrotaskQueue: [], consoleLogs: [], currentLine: 0
  };

  // Compile code string dynamically using our class utility engine!
  const handleCompileAndRun = () => {
    const interpreter = new DynamicInterpreter(code);
    const generatedSteps = interpreter.generateAllSteps();
    setTimeline(generatedSteps);
    setStepIndex(0);
  };

  const handleNext = () => {
    if (stepIndex < timeline.length - 1) setStepIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (stepIndex > 0) setStepIndex((prev) => prev - 1);
  };

  const handleReset = () => {
    setStepIndex(0);
    setTimeline([]);
    if (editorRef && decorations.length > 0) {
      editorRef.deltaDecorations(decorations, []);
    }
  };

  // Synchronize dynamic code highlighting frames
  useEffect(() => {
    if (!editorRef || !currentState) return;
    if (currentState.currentLine === 0) {
      setDecorations(editorRef.deltaDecorations(decorations, []));
      return;
    }
    const newDecorations = editorRef.deltaDecorations(decorations, [
      {
        range: { startLineNumber: currentState.currentLine, startColumn: 1, endLineNumber: currentState.currentLine, endColumn: 100 },
        options: { isWholeLine: true, className: 'bg-yellow-500/20 border-l-4 border-yellow-500' }
      }
    ]);
    setDecorations(newDecorations);
  }, [currentState?.currentLine, editorRef]);

  return (
    <main className="flex flex-col h-screen bg-slate-950 text-slate-100 p-6 overflow-hidden select-none">
      
      {/* HEADER PANELS */}
      <header className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            JS Runtime Loop Visualizer (Dynamic Engine v1.0)
          </h1>
          <p className="text-xs text-slate-400">
            {timeline.length > 0 ? `Step ${stepIndex + 1} of ${timeline.length}` : "Write custom code and click compile!"}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={handleCompileAndRun} className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-4 py-2 rounded-md text-sm transition">
            Compile Code 🚀
          </button>
          <button onClick={handlePrev} disabled={stepIndex === 0 || timeline.length === 0} className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-semibold px-4 py-2 rounded-md text-sm transition">⬅️ Back</button>
          <button onClick={handleNext} disabled={stepIndex === timeline.length - 1 || timeline.length === 0} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold px-4 py-2 rounded-md text-sm transition">Next Step ➡️</button>
          <button onClick={handleReset} className="bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 font-semibold px-4 py-2 rounded-md text-sm transition">Clear</button>
        </div>
      </header>

      {/* DASHBOARD GRID */}
      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* LEFT WORKSPACE: CUSTOM CODE EDITOR */}
        <div className="w-5/12 flex flex-col gap-4">
          <div className="flex-1 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
            <Editor
              height="100%"
              theme="vs-dark"
              defaultLanguage="javascript"
              value={code}
              options={{ 
                fontSize: 14, 
                minimap: { enabled: false }, 
                readOnly: timeline.length > 0, // Locks editor only while simulation is playing
                padding: { top: 12 } 
              }}
              onChange={(val) => setCode(val || '')}
              onMount={(editor) => setEditorRef(editor)}
            />
          </div>
          
          <div className="h-36 bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-sm flex flex-col">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Live Terminal Output</span>
            <div className="flex-1 overflow-y-auto space-y-1 text-teal-400">
              {currentState.consoleLogs.map((log, idx) => <div key={idx}>&gt; {log}</div>)}
              {currentState.consoleLogs.length === 0 && <span className="text-slate-600 italic">Awaiting execution run stream...</span>}
            </div>
          </div>
        </div>

        {/* RIGHT WORKSPACE: DYNAMIC RENDERING BOARDS */}
        <div className="w-7/12 flex flex-col gap-4 h-full">
          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            {/* CALL STACK */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
              <h3 className="text-sm font-bold text-amber-400 mb-2">🥞 Call Stack</h3>
              <div className="flex-1 border border-slate-800 rounded-lg p-2 flex flex-col-reverse justify-start gap-2 overflow-y-auto bg-slate-950/40">
                {currentState.callStack.map((frame, i) => (
                  <div key={i} className="bg-amber-600 text-white font-mono text-xs text-center font-bold py-2.5 rounded shadow animate-fade-in">
                    {frame}
                  </div>
                ))}
                {currentState.callStack.length === 0 && <div className="text-slate-600 m-auto text-xs font-mono">Empty</div>}
              </div>
            </div>

            {/* WEB APIs */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
              <h3 className="text-sm font-bold text-sky-400 mb-2">🌐 Web APIs</h3>
              <div className="flex-1 border border-slate-800 rounded-lg p-2 flex flex-col gap-2 overflow-y-auto bg-slate-950/40">
                {currentState.webAPIs.map((api) => (
                  <div key={api.id} className="bg-sky-950/50 border border-sky-800/40 text-sky-300 font-mono text-xs p-2 rounded flex justify-between items-center">
                    <span>{api.name}</span>
                    <span className="text-sky-400 font-bold">{api.timer}ms</span>
                  </div>
                ))}
                {currentState.webAPIs.length === 0 && <div className="text-slate-600 m-auto text-xs font-mono">Idle</div>}
              </div>
            </div>
          </div>

          {/* QUEUES ROW */}
          <div className="flex flex-col gap-3 h-1/2">
            {/* MICROTASK QUEUE */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex-1 flex flex-col">
              <h4 className="text-xs font-bold text-pink-400 mb-2 flex justify-between">
                <span>⚡ Microtask Queue (Promises)</span>
              </h4>
              <div className="flex-1 border border-slate-800 rounded-lg p-2 flex items-center gap-2 bg-slate-950/40 overflow-x-auto">
                {currentState.microtaskQueue.map((task, i) => (
                  <div key={i} className="bg-pink-600 text-white font-mono text-xs font-bold px-3 py-2 rounded-md shadow min-w-[100px] text-center">
                    {task}
                  </div>
                ))}
                {currentState.microtaskQueue.length === 0 && <div className="text-slate-700 mx-auto text-xs font-mono">Empty</div>}
              </div>
            </div>

            {/* MACROTASK QUEUE */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex-1 flex flex-col">
              <h4 className="text-xs font-bold text-purple-400 mb-2 flex justify-between">
                <span>⏱️ Macrotask Queue (setTimouts)</span>
              </h4>
              <div className="flex-1 border border-slate-800 rounded-lg p-2 flex items-center gap-2 bg-slate-950/40 overflow-x-auto">
                {currentState.macrotaskQueue.map((task, i) => (
                  <div key={i} className="bg-purple-600 text-white font-mono text-xs font-bold px-3 py-2 rounded-md shadow min-w-[100px] text-center">
                    {task}
                  </div>
                ))}
                {currentState.macrotaskQueue.length === 0 && <div className="text-slate-700 mx-auto text-xs font-mono">Empty</div>}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
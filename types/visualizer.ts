// types/visualizer.ts

export interface WebTask {
  id: string;
  name: string;
  timer: number;
}

export interface VisualizerState {
  callStack: string[];
  webAPIs: WebTask[];
  microtaskQueue: string[]; // Added
  macrotaskQueue: string[]; // Renamed from callbackQueue
  consoleLogs: string[];
  currentLine: number;
}
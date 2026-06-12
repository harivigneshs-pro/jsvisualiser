// data/staticScenario.ts
import { VisualizerState } from "../types/visualizer";

export const staticScenario: VisualizerState[] = [
  {
    // Step 0: Start
    callStack: [], webAPIs: [], microtaskQueue: [], macrotaskQueue: [], consoleLogs: [], currentLine: 1
  },
  {
    // Step 1: log("First") enters stack
    callStack: ['anonymous', 'console.log("First")'], webAPIs: [], microtaskQueue: [], macrotaskQueue: [], consoleLogs: [], currentLine: 1
  },
  {
    // Step 2: "First" printed
    callStack: ['anonymous'], webAPIs: [], microtaskQueue: [], macrotaskQueue: [], consoleLogs: ['First'], currentLine: 1
  },
  {
    // Step 3: setTimeout enters stack
    callStack: ['anonymous', 'setTimeout()'], webAPIs: [], microtaskQueue: [], macrotaskQueue: [], consoleLogs: ['First'], currentLine: 3
  },
  {
    // Step 4: setTimeout moves to Web APIs as a Macrotask timer
    callStack: ['anonymous'], webAPIs: [{ id: '1', name: 'cb_timeout()', timer: 0 }], microtaskQueue: [], macrotaskQueue: [], consoleLogs: ['First'], currentLine: 5
  },
  {
    // Step 5: Promise execution enters stack
    callStack: ['anonymous', 'Promise.resolve().then()'], webAPIs: [{ id: '1', name: 'cb_timeout()', timer: 0 }], microtaskQueue: [], macrotaskQueue: [], consoleLogs: ['First'], currentLine: 7
  },
  {
    // Step 6: Promise callback immediately enters MICROTASK queue
    callStack: ['anonymous'], webAPIs: [{ id: '1', name: 'cb_timeout()', timer: 0 }], microtaskQueue: ['cb_promise()'], macrotaskQueue: [], consoleLogs: ['First'], currentLine: 9
  },
  {
    // Step 7: log("Fourth") enters stack
    callStack: ['anonymous', 'console.log("Fourth")'], webAPIs: [{ id: '1', name: 'cb_timeout()', timer: 0 }], microtaskQueue: ['cb_promise()'], macrotaskQueue: [], consoleLogs: ['First'], currentLine: 9
  },
  {
    // Step 8: "Fourth" printed
    callStack: ['anonymous'], webAPIs: [{ id: '1', name: 'cb_timeout()', timer: 0 }], microtaskQueue: ['cb_promise()'], macrotaskQueue: [], consoleLogs: ['First', 'Fourth'], currentLine: 9
  },
  {
    // Step 9: Main script finishes! Anonymous leaves stack. Timeout completes and moves to MACROTASK queue
    callStack: [], webAPIs: [], microtaskQueue: ['cb_promise()'], macrotaskQueue: ['cb_timeout()'], consoleLogs: ['First', 'Fourth'], currentLine: 9
  },
  {
    // Step 10: Event loop ticks. Microtask Queue has higher priority! Pushes cb_promise to stack
    callStack: ['cb_promise()'], webAPIs: [], microtaskQueue: [], macrotaskQueue: ['cb_timeout()'], consoleLogs: ['First', 'Fourth'], currentLine: 8
  },
  {
    // Step 11: Inside promise callback, log("Third") enters stack
    callStack: ['cb_promise()', 'console.log("Third")'], webAPIs: [], microtaskQueue: [], macrotaskQueue: ['cb_timeout()'], consoleLogs: ['First', 'Fourth'], currentLine: 8
  },
  {
    // Step 12: "Third" prints
    callStack: ['cb_promise()'], webAPIs: [], microtaskQueue: [], macrotaskQueue: ['cb_timeout()'], consoleLogs: ['First', 'Fourth', 'Third'], currentLine: 8
  },
  {
    // Step 13: cb_promise leaves stack. Microtask queue is now empty, so Event Loop can now process Macrotask Queue!
    callStack: ['cb_timeout()'], webAPIs: [], microtaskQueue: [], macrotaskQueue: [], consoleLogs: ['First', 'Fourth', 'Third'], currentLine: 4
  },
  {
    // Step 14: Inside timeout callback, log("Second") enters stack
    callStack: ['cb_timeout()', 'console.log("Second")'], webAPIs: [], microtaskQueue: [], macrotaskQueue: [], consoleLogs: ['First', 'Fourth', 'Third'], currentLine: 4
  },
  {
    // Step 15: "Second" prints
    callStack: ['cb_timeout()'], webAPIs: [], microtaskQueue: [], macrotaskQueue: [], consoleLogs: ['First', 'Fourth', 'Third', 'Second'], currentLine: 4
  },
  {
    // Step 16: Execution finished completely!
    callStack: [], webAPIs: [], microtaskQueue: [], macrotaskQueue: [], consoleLogs: ['First', 'Fourth', 'Third', 'Second'], currentLine: 0
  }
];
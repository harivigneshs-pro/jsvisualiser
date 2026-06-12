// utils/interpreter.ts
import * as acorn from 'acorn';
import { VisualizerState } from '../types/visualizer';

export class DynamicInterpreter {
  private ast: any;
  private nodes: any[] = [];
  private currentNodeIndex = 0;
  
  // Internal Runtime State
  private state: VisualizerState = {
    callStack: [],
    webAPIs: [],
    microtaskQueue: [],
    macrotaskQueue: [],
    consoleLogs: [],
    currentLine: 1,
  };

  private history: VisualizerState[] = [];

  // Temporary storages to track what strings are actually inside the callbacks
  private timeoutCallbackLog: string = "Timeout Callback";
  private promiseCallbackLogs: string[] = [];

  constructor(code: string) {
    try {
      this.ast = acorn.parse(code, { ecmaVersion: 2020, locations: true });
      this.flattenNodes(this.ast);
      this.saveSnapshot(1);
    } catch (err: any) {
      this.state.consoleLogs.push(`Syntax Error: ${err.message}`);
      this.saveSnapshot(1);
    }
  }

  private flattenNodes(node: any) {
    if (!node) return;
    
    if (node.type === 'Program' || node.type === 'BlockStatement') {
      node.body.forEach((child: any) => this.flattenNodes(child));
    } else if (node.type === 'ExpressionStatement') {
      this.nodes.push(node.expression);
    } else {
      this.nodes.push(node);
    }
  }

  private saveSnapshot(lineNum: number) {
    this.state.currentLine = lineNum;
    this.history.push(JSON.parse(JSON.stringify(this.state)));
  }

  // Helper to extract console.log text from inside a callback function block
  private extractLogsFromCallback(callbackNode: any): string[] {
    const logs: string[] = [];
    if (!callbackNode) return logs;
    
    const body = callbackNode.body?.body || [callbackNode.body];
    body.forEach((stmt: any) => {
      const expr = stmt.expression || stmt;
      if (expr?.type === 'CallExpression' && 
          (expr.callee.name === 'console.log' || 
           (expr.callee.object?.name === 'console' && expr.callee.property?.name === 'log'))) {
        logs.push(expr.arguments[0]?.value ?? 'undefined');
      }
    });
    return logs;
  }

  public generateAllSteps(): VisualizerState[] {
    let loopGuard = 0;

    // Phase 1: Process Synchronous Code
    while (this.currentNodeIndex < this.nodes.length && loopGuard < 100) {
      loopGuard++;
      const node = this.nodes[this.currentNodeIndex];
      const line = node.loc ? node.loc.start.line : 1;

      // Handle plain Promise chains (Promise.resolve().then(...).then(...))
      if (node.type === 'CallExpression' && node.callee?.type === 'MemberExpression') {
        let currentMember = node;
        const localChains: any[] = [];
        
        // Traverse up the promise chain to capture all .then() nodes
        while (currentMember && currentMember.type === 'CallExpression') {
          if (currentMember.callee?.property?.name === 'then') {
            localChains.unshift(currentMember);
          }
          currentMember = currentMember.callee?.object;
        }

        if (localChains.length > 0) {
          this.state.callStack.push('Promise.resolve()');
          this.saveSnapshot(line);
          this.state.callStack.pop();

          // Read the real strings inside each .then() block dynamically
          localChains.forEach((chainNode, idx) => {
            const callbackArg = chainNode.arguments[0];
            const insideLogs = this.extractLogsFromCallback(callbackArg);
            const logValue = insideLogs[0] || `Promise ${idx + 1}`;
            
            this.promiseCallbackLogs.push(logValue);
            this.state.microtaskQueue.push(`cb_promise: ${logValue}`);
          });
          
          this.saveSnapshot(line);
          this.currentNodeIndex++;
          continue;
        }
      }

      // Handle standard calls like console.log and setTimeout
      if (node.type === 'CallExpression') {
        const calleeName = node.callee.name || (node.callee.object?.name + '.' + node.callee.property?.name);
        
        if (calleeName === 'console.log') {
          const argValue = node.arguments[0]?.value ?? 'undefined';
          this.state.callStack.push(`console.log("${argValue}")`);
          this.saveSnapshot(line);
          
          this.state.consoleLogs.push(String(argValue));
          this.state.callStack.pop();
          this.saveSnapshot(line);
        } 
        
        else if (calleeName === 'setTimeout') {
          const delay = node.arguments[1]?.value ?? 0;
          this.state.callStack.push(`setTimeout(..., ${delay})`);
          this.saveSnapshot(line);
          
          // Dynamically read what's inside the setTimeout callback body
          const timeoutLogs = this.extractLogsFromCallback(node.arguments[0]);
          this.timeoutCallbackLog = timeoutLogs[0] || "Timeout Callback";

          this.state.webAPIs.push({
            id: Math.random().toString(),
            name: `cb_timeout: ${this.timeoutCallbackLog}`,
            timer: delay
          });
          
          this.state.callStack.pop();
          this.saveSnapshot(line);
        }
      } 

      this.currentNodeIndex++;
    }

    // Phase 2: Web API Timers complete -> Move to Macrotask Queue
    if (this.state.webAPIs.length > 0) {
      this.state.webAPIs.forEach(api => {
        this.state.macrotaskQueue.push(api.name);
      });
      this.state.webAPIs = [];
      this.saveSnapshot(0);
    }

    // Phase 3: Empty the Microtask Queue completely (Processes Promise 1, then Promise 2)
    while (this.state.microtaskQueue.length > 0) {
      const microTask = this.state.microtaskQueue.shift()!;
      const matchingLog = this.promiseCallbackLogs.shift() || "Promise resolve";

      this.state.callStack.push(microTask);
      this.saveSnapshot(0); 
      
      this.state.callStack.push(`console.log("${matchingLog}")`);
      this.saveSnapshot(0);
      
      this.state.consoleLogs.push(matchingLog);
      this.state.callStack.pop(); // pop log
      this.state.callStack.pop(); // pop callback frame
      this.saveSnapshot(0);
    }

    // Phase 4: Handle Macrotask Queue (Processes the Timeout)
    while (this.state.macrotaskQueue.length > 0) {
      const macroTask = this.state.macrotaskQueue.shift()!;
      this.state.callStack.push(macroTask);
      this.saveSnapshot(0);
      
      this.state.callStack.push(`console.log("${this.timeoutCallbackLog}")`);
      this.saveSnapshot(0);
      
      this.state.consoleLogs.push(this.timeoutCallbackLog);
      this.state.callStack.pop(); // pop log
      this.state.callStack.pop(); // pop callback frame
      this.saveSnapshot(0);
    }

    return this.history;
  }
}
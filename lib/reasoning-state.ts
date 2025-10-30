
export interface ReasoningState {
  isActive: boolean;
  originalModel: string | null;
  startTime: number | null;
  thinkingStartTime: number | null;
  thinkingDuration: number;
}

export class ReasoningStateManager {
  private static readonly STORAGE_KEY = 'deepthink-state';
  
  static getState(): ReasoningState {
    if (typeof window === 'undefined') {
      return { 
        isActive: false, 
        originalModel: null, 
        startTime: null, 
        thinkingStartTime: null, 
        thinkingDuration: 0 
      };
    }
    
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : { 
        isActive: false, 
        originalModel: null, 
        startTime: null, 
        thinkingStartTime: null, 
        thinkingDuration: 0 
      };
    } catch {
      return { 
        isActive: false, 
        originalModel: null, 
        startTime: null, 
        thinkingStartTime: null, 
        thinkingDuration: 0 
      };
    }
  }
  
  static setState(state: ReasoningState): void {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save reasoning state:', error);
    }
  }
  
  static activateReasoning(currentModel: string): void {
    this.setState({
      isActive: true,
      originalModel: currentModel,
      startTime: Date.now(),
      thinkingStartTime: null,
      thinkingDuration: 0
    });
  }
  
  static startThinking(): void {
    const state = this.getState();
    this.setState({
      ...state,
      thinkingStartTime: Date.now()
    });
  }
  
  static stopThinking(): number {
    const state = this.getState();
    const duration = state.thinkingStartTime 
      ? Math.floor((Date.now() - state.thinkingStartTime) / 1000)
      : 0;
    
    this.setState({
      ...state,
      thinkingDuration: duration,
      thinkingStartTime: null
    });
    
    return duration;
  }
  
  static deactivateReasoning(): ReasoningState {
    const state = this.getState();
    this.setState({
      isActive: false,
      originalModel: null,
      startTime: null,
      thinkingStartTime: null,
      thinkingDuration: 0
    });
    return state;
  }
  
  static isReasoningActive(): boolean {
    return this.getState().isActive;
  }
  
  static getOriginalModel(): string | null {
    return this.getState().originalModel;
  }
  
  static getThinkingDuration(): number {
    return this.getState().thinkingDuration;
  }
  
  static isCurrentlyThinking(): boolean {
    return this.getState().thinkingStartTime !== null;
  }
}

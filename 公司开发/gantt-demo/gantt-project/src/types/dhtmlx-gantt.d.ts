declare module 'dhtmlx-gantt' {
  export interface GanttStatic {
    init(container: HTMLElement): void
    clearAll(): void
    parse(data: any): void
    render(): void
    setSizes(): void
    destructor(): void
    getTask(id: string): any
    isTaskExists(id: string): boolean
    
    config: {
      date_format: string
      duration_unit: string
      scale_height: number
      auto_types: boolean
      scales: any[]
      columns: any[]
      grid_width: number
      row_height: number
      task_height: number
      bar_height: number
      readonly: boolean
      drag_move: boolean
      drag_resize: boolean
      drag_progress: boolean
      step: number
    }
    
    templates: {
      task_text: (start: Date, end: Date, task: any) => string
      task_class: (start: Date, end: Date, task: any) => string
      grid_row_class: (start: Date, end: Date, task: any) => string
    }
    
    i18n: {
      setLocale(locale: any): void
    }
    
    attachEvent(event: string, handler: Function): string
  }

  export const gantt: GanttStatic
}
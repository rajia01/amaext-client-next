import { createContext } from "react";

export type Task = {
    task_id: number;
  };
  
  interface TaskContextType {
    taskid: Task;
    setTaskid: React.Dispatch<React.SetStateAction<Task>>;
  }
  
  // Create context with a partial type to allow undefined properties
  export const TaskContext = createContext<Partial<TaskContextType>>({});
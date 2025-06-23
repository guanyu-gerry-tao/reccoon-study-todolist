import type { RefObject } from "react";

type TaskItem = NewTaskItem & {
  id: string;
}

type NewTaskItem = {
    title: string;
    order: number;
    dueDate?: Date | undefined;
    description?: string;
    status: number; // 0: Now, 1: Next, 2: Later
    previousStatus: number;
};

type TodoColumnProps = {
  title: React.ReactNode;
  bgColor: string;
  status: number;
  actions: TaskActions;
  tasks: TaskItem[];
  draggingType?: string | null;
  draggingTaskId?: string | null;
}

type TaskActions = {
  addTask: (newTask: NewTaskItem) => void;
  updateTask: (id: string, updatedFields: Partial<TaskItem>) => void;
  deleteTask: (id: string) => void;
  draggingTask: (id: string) => void;
  draggingTaskEnd: () => void;
};

export type { TaskItem };
export type { NewTaskItem };
export type { TodoColumnProps };
export type { TaskActions };
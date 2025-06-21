
type TaskItem = NewTaskItem & {
  id: string;
  isPending: boolean;
  isCompleted: boolean;
  isDeleted: boolean;
  isArchived: boolean;
}

type NewTaskItem = {
    title: string;
    dueDate?: Date | undefined
    description?: string;
    status: number; // 0: Now, 1: Next, 2: Later
};

type TodoColumnProps = {
  title: React.ReactNode;
  bgColor: string;
  status: number;
  actions: TaskActions;
  tasks: TaskItem[];
}

type TaskActions = {
  add: (newTask: NewTaskItem) => void;
  update: (id: string, updatedFields: Partial<TaskItem>) => void;
  delete: (id: string) => void;
};

export type { TaskItem };
export type { NewTaskItem };
export type { TodoColumnProps };
export type { TaskActions };
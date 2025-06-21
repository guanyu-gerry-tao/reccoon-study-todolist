
type TaskItem = NewTaskItem & {
  id: string;
  isPending: boolean;
  isDeleted: boolean;
  isArchived: boolean;
}

type NewTaskItem = {
    title: string;
    dueDate?: Date;
    description?: string;
    status: 'planned' | 'working' | 'finished';
};

type TodoColumnProps = {
  title: React.ReactNode;
  bgColor: string;
  status: 'planned' | 'working' | 'finished';
  actions: TaskActions;
  tasks: TaskItem[];
}

type TaskActions = {
  add: (newTask: NewTaskItem) => void;
  update: (id: string, updatedFields: Partial<TaskItem>) => void;
};

export type { TaskItem };
export type { NewTaskItem };
export type { TodoColumnProps };
export type { TaskActions };
type TaskItem = NewTaskItem & {
  id: string;
};

type NewTaskItem = {
    title: string;
    order: number;
    dueDate?: Date | undefined;
    description?: string;
    status: number; // 1: Now, 2: Next, 3: Later, 0: Completed, -1: Deleted 
    previousStatus: number;
    project: string;
};

type TodoColumnProps = {
  title: React.ReactNode;
  bgColor: string;
  status: number;
  actions: TaskActions;
  tasks: TaskItem[];
  draggingType?: string | null;
  draggingTaskId?: string | null;
  currentProjectID: string;
};

type Projects = {
  [id: string]: ProjectItem;
};

type ProjectItem = NewProjectItem & {
  id: string;
};

type NewProjectItem = {
  title: string;
  description?: string;
  order: number;
};

type UserStatus = {
  project: string;
};

type TaskActions = {
  addTask: (newTask: NewTaskItem) => void;
  updateTask: (id: string, updatedFields: Partial<TaskItem>) => void;
  deleteTask: (id: string) => void;
  refreshTasks: () => void;
  addProject: (newProject: NewProjectItem) => void;
};

type setIsOverDeletedTaskArea = React.Dispatch<React.SetStateAction<boolean>>;

export type { TaskItem };
export type { NewTaskItem };
export type { Projects };
export type { UserStatus };
export type { ProjectItem };
export type { TodoColumnProps };
export type { TaskActions };
export type { setIsOverDeletedTaskArea };
export type { NewProjectItem };
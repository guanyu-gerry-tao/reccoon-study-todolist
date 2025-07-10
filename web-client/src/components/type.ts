type TaskItem = {
  title: string;
  dueDate?: Date | undefined;
  description?: string;
  status: number; // 1: Now, 2: Next, 3: Later, 0: Completed, -1: Deleted 
  previousStatus: number;
  project: string;
  prev: string | null;
  next: string | null;
};

type TodoColumnProps = {
  title: React.ReactNode;
  bgColor: string;
  status: number;
  actions: Actions;
  tasks: Record<string, TaskItem>;
  draggingType?: string | null;
  draggingTaskId?: string | null;
  currentProjectID: string;
};

type Projects = {
  [id: string]: ProjectItem;
};

type ProjectItem = {
  title: string;
  description?: string;
  prev: string | null;
  next: string | null;
};

type UserStatus = {
  project: string;
};

type Actions = {
  addTask: (newTask: TaskItem) => void;
  updateTask: (id: string, updatedFields: Partial<TaskItem>) => void;
  deleteTask: (id: string) => void;
  hardDeleteTask: (id: string) => void;
  refreshTasks: () => void;
  addProject: (newProject: ProjectItem) => void;
  updateProject: (id: string, updatedFields: Partial<ProjectItem>) => void;
  deleteProject: (id: string) => void;
};

type setIsOverDeletedTaskArea = React.Dispatch<React.SetStateAction<boolean>>;

export type { TaskItem };
export type { Projects };
export type { UserStatus };
export type { ProjectItem };
export type { TodoColumnProps };
export type { Actions };
export type { setIsOverDeletedTaskArea };
type TaskItem = {
  title: string;
  dueDate?: Date | undefined;
  description?: string;
  status: number; // 1: Now, 2: Next, 3: Later, 0: Completed, -1: Deleted 
  previousStatus: number;
  project: string;
  prev: string | null;
  next: string | null;
  userId: string;
};

type TodoColumnProps = {
  title: React.ReactNode;
  bgColor: string;
  status: number;
  actions: Actions;
  tasks: Record<string, TaskItem>;
  draggingType?: string | null;
  draggingTaskId?: string | null;
  currentProjectID: string | null;
};

type Projects = {
  [id: string]: ProjectItem;
};

type ProjectItem = {
  title: string;
  description?: string;
  prev: string | null;
  next: string | null;
  userId: string;
};

type Status = {
  name: string;
  discription: string;
  color: string;
  prev: string | null;
  next: string | null;
  userId: string;
}

type Actions = {
  addTask: (newTask: TaskItem) => string; // Returns the ID of the newly added task
  updateTask: (id: string, updatedFields: Partial<TaskItem>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  hardDeleteTask: (id: string) => void;
  refreshTasks: () => void;
  addProject: (newProject: ProjectItem) => string; // Returns the ID of the newly added project
  updateProject: (id: string, updatedFields: Partial<ProjectItem>) => void;
  deleteProject: (id: string) => void;
  setCurrentProjectID: (projectID: string | null) => void;
  setEditMode: (editMode: boolean) => void;
  setShowDeleted: (showDeleted: boolean) => void; // Action to toggle the visibility of deleted tasks
  setShowCompleted: (showCompleted: boolean) => void; // Optional action to toggle the visibility of completed tasks, for future use
};

type States = {
  tasks: Record<string, TaskItem>;
  projects: Record<string, ProjectItem>;
  draggedTask: [string] | null;
  currentProjectID: string | null;
  editMode: boolean;
  showDeleted: boolean; // State to manage the visibility of deleted tasks
  showCompleted: boolean; // State to manage the visibility of completed tasks, optional for future use
};

type setIsOverDeletedTaskArea = React.Dispatch<React.SetStateAction<boolean>>;

export type { TaskItem };
export type { Projects };
export type { ProjectItem };
export type { TodoColumnProps };
export type { Actions };
export type { States };
export type { Status };
export type { setIsOverDeletedTaskArea };
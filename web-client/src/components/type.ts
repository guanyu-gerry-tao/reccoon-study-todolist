// web-client/src/components/type.ts

// using semanic types for better clarity and maintainability






/**
 * Task represents a single task in the todo list.
 */
export type TaskType = {
  id: TaskId; // Unique identifier for the task
  title: string;
  dueDate?: Date | undefined;
  description?: string;
  status: string;
  previousStatus: string;
  projectId: ProjectId;
  prev: TaskId | null;
  next: TaskId | null;
  userId: UserId;
};
export type TaskId = string;
export type TaskData = Record<TaskId, TaskType>;


/**
 * TodoColumnProps defines the properties for the TodoColumn component.
 */
// type TodoColumnProps = {
//   title: React.ReactNode;
//   bgColor: string;
//   status: number;
//   actions: Actions;
//   tasks: Record<TaskId, TaskItem>;
//   draggingType?: string | null;
//   draggingTaskId?: TaskId | null;
//   currentProjectID: ProjectId | null;
// };


// type Projects = {
//   [id: ProjectId]: ProjectItem;
// };

/**
 * ProjectId represents a unique identifier for a project in the todo list application.
 */
export type ProjectType = {
  id: ProjectId; // Unique identifier for the project
  title: string;
  description?: string;
  prev: ProjectId | null;
  next: ProjectId | null;
  userId: UserId;
};
export type ProjectId = string;
export type ProjectData = Record<ProjectId, ProjectType>;

/**
 * UserId represents a unique identifier for a user in the todo list application.
 */
export type UserProfileData = {
  id: UserId; // Unique identifier for the user
  nickname: string;
  lastProjectId: ProjectId | null; // The last project ID the user interacted with
  avatarUrl: string;
  language: string;
};

// UserId is a semantic identifier that uniquely identifies a user in the application.
export type UserId = string;

/**
 * Status represents a single status in the todo list.
 */
export type StatusType = {
  id: StatusId; // Unique identifier for the status
  title: string;
  description: string;
  color: string;
  prev: StatusId | null;
  next: StatusId | null;
  userId: UserId;
}
export type StatusId = string;
export type StatusData = Record<StatusId, StatusType>;



export type Actions = {
  addTask: (newTask: Omit<TaskType, 'id'>) => Promise<TaskId>; // Returns the ID of the newly added task
  updateTaskLocal: (id: TaskId, updatedFields: Partial<TaskType>) => void;
  updateTaskRemote: (id: TaskId, updatedFields: Partial<TaskType>) => Promise<void>;
  deleteTask: (id: TaskId) => void;
  completeTask: (id: TaskId) => void;
  hardDeleteTask: (id: TaskId) => void;
  refreshTasks: () => void;
  restoreTask: (id: TaskId) => void; // Action to restore a deleted task
  addProject: (newProject: Omit<ProjectType, 'id'>) => ProjectId; // Returns the ID of the newly added project
  updateProject: (id: ProjectId, updatedFields: Partial<ProjectType>) => void;
  deleteProject: (id: ProjectId) => void;
  setCurrentProjectID: (projectID: ProjectId | null) => void;
  setEditMode: (editMode: boolean) => void;
  setShowDeleted: (showDeleted: boolean) => void; // Action to toggle the visibility of deleted tasks
  setShowCompleted: (showCompleted: boolean) => void; // Optional action to toggle the visibility of completed tasks, for future use
};

export type States = {
  tasks: TaskData;
  projects: ProjectData;
  statuses: StatusData;
  userProfile: UserProfileData;
  draggedTask: [TaskId] | null;
  currentProjectID: ProjectId | null;
  editMode: boolean;
  showDeleted: boolean; // State to manage the visibility of deleted tasks
  showCompleted: boolean; // State to manage the visibility of completed tasks, optional for future use
};

export type setIsOverDeletedTaskArea = React.Dispatch<React.SetStateAction<boolean>>;

// web-client/src/components/type.ts

import type { DragStart, DragUpdate, DropResult, ResponderProvided } from "@hello-pangea/dnd";
import type { Updater } from "use-immer";

// using semanic types for better clarity and maintainability






/**
 * Task represents a single task in the todo list.
 */
export type TaskType = {
  id: TaskId; // Unique identifier for the task
  title: string;
  dueDate?: Date | null;
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
  id: UserId | null; // Unique identifier for the user
  nickname: string | null; // The nickname of the user, can be null if not set
  lastProjectId: ProjectId | null; // The last project ID the user interacted with
  avatarUrl: string | null; // The avatar URL of the user, can be null if not set;
  language: string | null; // The language preference of the user, can be null if not set
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
  addTask: (newTask: Omit<TaskType, 'id'>, bulkPayload: BulkPayload) => TaskId; // Returns the ID of the newly added task
  updateTask: (updatePayloads: { id: TaskId; updatedFields: Partial<TaskType> }, bulkPayload: BulkPayload) => void; // Accepts an array of update payloads, each containing the task ID and the fields to be updated
  hardDeleteTask: (id: TaskId, bulkPayload: BulkPayload) => void;
  moveTask: (id: TaskId, targetStatusId: StatusId, index: number | "start" | "end", bulkPayload: BulkPayload) => void;
  addProject: (newProject: Omit<ProjectType, 'id'>, bulkPayload: BulkPayload) => ProjectId; // Returns the ID of the newly added project
  updateProject: (id: ProjectId, updatedFields: Partial<ProjectType>, bulkPayload: BulkPayload) => void;
  moveProject: (id: ProjectId, index: number, bulkPayload: BulkPayload) => void;
  deleteProject: (projectId: ProjectId, bulkPayload: BulkPayload) => void;
  onDragEnd: (result: DropResult, provided: ResponderProvided) => void;
  onDragStart: (start: DragStart, provided: ResponderProvided) => void;
  onDragUpdate: (update: DragUpdate, provided: ResponderProvided) => void;
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

export type SetStates = {
  setTasks: Updater<TaskData>;
  setProjects: Updater<ProjectData>;
  setStatuses: Updater<StatusData>;
  setUserProfile: Updater<UserProfileData>;
  setDraggedTask: Updater<[TaskId] | null>;
  setCurrentProjectID: Updater<ProjectId | null>;
  setEditMode: Updater<boolean>;
  setShowDeleted: Updater<boolean>; // Action to toggle the visibility of deleted tasks
  setShowCompleted: Updater<boolean>; // Optional action to toggle the visibility of completed tasks, for future use
};

export type BulkPayload = {
  ops: {
    type: 'task' | 'project' | 'status',
    operation: 'add' | 'update' | 'delete',
    data:

    TaskType | ProjectType | StatusType | // New items to be added

    { id: TaskId; updatedFields: Partial<TaskType> } | // Update payloads for tasks, projects, and statuses
    { id: ProjectId; updatedFields: Partial<ProjectType> } |
    { id: StatusId; updatedFields: Partial<StatusType> } |

    TaskId | ProjectId | StatusId; // Ids for deletion

  }[];
  backup: { statuses: StatusData; tasks: TaskData; projects: ProjectData }; // Backup of the current state before changes, and use for undo functionality
}
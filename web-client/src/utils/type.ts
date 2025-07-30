// web-client/src/components/type.ts

import type { DragStart, DragUpdate, DropResult, ResponderProvided } from "@hello-pangea/dnd";
import type { Updater } from "use-immer";

// using semanic types for better clarity and maintainability






/**
 * Task represents a single task in the todo list.
 */
export type Task = {
  id: TaskId; // Unique identifier for the task
  title: string;
  dueDate?: Date | null;
  description?: string;
  status: string;
  previousStatus: string;
  prev: TaskId | null;
  next: TaskId | null;
  userId: UserId;
};
export type TaskId = string;
export type TaskMap = Record<TaskId, Task>;


/**
 * ProjectId represents a unique identifier for a project in the todo list application.
 */
export type Project = {
  id: ProjectId; // Unique identifier for the project
  title: string;
  description?: string;
  prev: ProjectId | null;
  next: ProjectId | null;
  userId: UserId;
};
export type ProjectId = string;
export type ProjectMap = Record<ProjectId, Project>;

/**
 * UserId represents a unique identifier for a user in the todo list application.
 */
export type UserProfileData = {
  id: UserId | null; // Unique identifier for the user
  nickname: string | null; // The nickname of the user, can be null if not set
  focusProject: ProjectId | null; // The last project ID the user interacted with
  focusConversation: ConversationId | null; // The last conversation ID the user interacted with
  avatarUrl: string | null; // The avatar URL of the user, can be null if not set;
  language: string | null; // The language preference of the user, can be null if not set
};

// UserId is a semantic identifier that uniquely identifies a user in the application.
export type UserId = string;

/**
 * Status represents a single status in the todo list.
 */
export type Status = {
  id: StatusId; // Unique identifier for the status
  title: string;
  description?: string;
  color: string;
  projectId: ProjectId; // The ID of the project this status belongs to
  prev: StatusId | null;
  next: StatusId | null;
  userId: UserId;
}
export type StatusId = string;
export type StatusMap = Record<StatusId, Status>;

/**
 * Conversation represents a single conversation in the todo list application.
 * It can be used for chat or discussion features related to tasks or projects.
 */
export type Conversation = {
  id: ConversationId; // Unique identifier for the conversation
  title: string;
  prev: ConversationId | null;
  next: ConversationId | null;
  userId: UserId;
};
export type ConversationId = string;
export type ConversationMap = Record<ConversationId, Conversation>;


/**
 * Message represents a single message in a conversation.
 */
export type Message = {
  id: MessageId; // Unique identifier for the message
  content: string; // The content of the message
  conversationId: ConversationId; // The ID of the conversation this message belongs to
  prev: MessageId | null; // The ID of the previous message in the conversation
  next: MessageId | null; // The ID of the next message in the conversation
  sender: 'user' | 'AI'; // The sender of the message, can be 'user' or 'AI'
  userId: UserId; // The ID of the user who sent the message
};
export type MessageId = string;
export type MessageMap = Record<MessageId, Message>;


export type Actions = {
  addItem: <Item extends { id: string; prev: string | null; next: string | null }, ItemMap extends Record<string, Item>>(type: 'task' | 'project' | 'status' | 'conversation' | 'message', newItem: Omit<Item, 'id'>, itemRecord: ItemMap, bulkPayload: BulkPayload) => string; // Returns the ID of the newly added project
  updateItem: <T extends Task | Project | Status | Conversation | Message>(type: 'task' | 'project' | 'status' | 'conversation' | 'message', id: string, updatedFields: Partial<T>, bulkPayload: BulkPayload) => void;
  moveTask: (id: TaskId, targetStatusId: StatusId, prev: TaskId | "start" | null, next: TaskId | "end" | null, bulkPayload: BulkPayload) => void;
  moveItem: <Item extends { id: string; prev: string | null; next: string | null }>(type: 'project' | 'status' | 'conversation', id: string, itemRecord: Record<string, Item>, prev: string | "start" | null, next: string | "end" | null, bulkPayload: BulkPayload) => void;
  deleteItem: <Item extends Task | Project | Status | Conversation | Message>(type: 'task' | 'project' | 'status' | 'conversation' | 'message', id: string, itemMap: Record<string, Item>, bulkPayload: BulkPayload) => void;
  focusItem: (type: 'project' | 'conversation', id: string | null, bulkPayload: BulkPayload) => void; // Focuses on a specific project, updating the user profile with the last interacted project ID
  // onDragEnd: (result: DropResult, provided: ResponderProvided) => void;
  // onDragStart: (start: DragStart, provided: ResponderProvided) => void;
  // onDragUpdate: (update: DragUpdate, provided: ResponderProvided) => void;
};

export type States = {
  tasks: TaskMap;
  projects: ProjectMap;
  statuses: StatusMap;
  userProfile: UserProfileData;
  conversations: ConversationMap;
  messages: MessageMap;
  draggedTask: TaskId[];
  editMode: boolean;
  showDeleted: boolean; // State to manage the visibility of deleted tasks
  showCompleted: boolean; // State to manage the visibility of completed tasks, optional for future use
  onDragging: boolean; // State to manage the dragging state of tasks
  activeId: string | null; // The currently active ID, used for drag and drop operations
};

export type SetStates = {
  setTasks: Updater<TaskMap>;
  setProjects: Updater<ProjectMap>;
  setStatuses: Updater<StatusMap>;
  setUserProfile: Updater<UserProfileData>;
  setConversations: Updater<ConversationMap>;
  setMessages: Updater<MessageMap>;
  setDraggedTask: Updater<TaskId[]>;
  setEditMode: Updater<boolean>;
  setShowDeleted: Updater<boolean>; // Action to toggle the visibility of deleted tasks
  setShowCompleted: Updater<boolean>; // Optional action to toggle the visibility of completed tasks, for future use
  setOnDragging: Updater<boolean>; // Action to manage the dragging state of tasks
  setActiveId: Updater<string | null>; // Action to set the currently active ID for drag and drop operations
};

export type BulkPayload = {
  ops: {
    type: 'task' | 'project' | 'status' | 'userProfile' | 'conversation' | 'message'; // Type of the operation
    operation: 'add' | 'update' | 'delete',
    data:

    Task | Project | Status | UserProfileData | Conversation | Message | // New items to be added

    { id: TaskId; updatedFields: Partial<Omit<Task, 'userId'>> } | // Update payloads for tasks, projects, and statuses
    { id: ProjectId; updatedFields: Partial<Omit<Project, 'userId'>> } |
    { id: StatusId; updatedFields: Partial<Omit<Status, 'userId'>> } |
    { id: UserId; updatedFields: Partial<Omit<UserProfileData, 'id'>> } | // Update payload for user profile
    { id: ConversationId; updatedFields: Partial<Omit<Conversation, 'userId'>> } | // Update payload for conversation
    { id: MessageId; updatedFields: Partial<Omit<Message, 'userId'>> } | // Update payload for message

    {id: TaskId} | {id: ProjectId} | {id: StatusId} | {id: ConversationId} | {id: MessageId}; // Ids for deletion

  }[];
  backup: {
    statuses: StatusMap;
    tasks: TaskMap;
    projects: ProjectMap;
    userProfile: UserProfileData;
  }; // Backup of the current state before changes, and use for undo functionality
}
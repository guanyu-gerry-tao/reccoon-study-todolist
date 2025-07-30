import { useImmer } from "use-immer";
import { useEffect } from "react";
import type { TaskMap, ProjectMap, UserProfileData, StatusMap, States, SetStates, ConversationMap, MessageMap } from "./type";

export const createStatesAndSetStates = (): [States, SetStates] => {


  // State management using useImmer for tasks, projects, user status, and dragged task

  const emptyUserProfile: UserProfileData = {
    id: null,
    nickname: null,
    focusProject: null,
    focusConversation: null,
    avatarUrl: null,
    language: null
  };

  const [tasks, setTasks] = useImmer<TaskMap>({}); // Initial tasks data loaded from testTaskData
  const [projects, setProjects] = useImmer<ProjectMap>({}); // Initial projects data loaded from testProjectData
  const [statuses, setStatuses] = useImmer<StatusMap>({}); // Initial statuses data loaded from testStatusData
  const [userProfile, setUserProfile] = useImmer<UserProfileData>(emptyUserProfile); // Initial users data loaded from testUserData
  const [conversations, setConversations] = useImmer<ConversationMap>({}); // Initial conversations data, can be empty or loaded from a source
  const [messages, setMessages] = useImmer<MessageMap>({}); //
  const [draggedTask, setDraggedTask] = useImmer<string[]>([]); // State to track the currently dragged task, if any
  const [editMode, setEditMode] = useImmer<boolean>(false);
  const [showDeleted, setShowDeleted] = useImmer<boolean>(false);
  const [showCompleted, setShowCompleted] = useImmer<boolean>(false);
  const [onDragging, setOnDragging] = useImmer<boolean>(false); // State to manage the dragging state of tasks
  const [activeId, setActiveId] = useImmer<string | null>(null);

  const states: States = {
    tasks,
    projects,
    statuses,
    userProfile,
    conversations,
    messages,
    draggedTask,
    editMode,
    showDeleted,
    showCompleted,
    onDragging,
    activeId
  };

  const setStates: SetStates = {
    setTasks,
    setProjects,
    setStatuses,
    setUserProfile,
    setConversations,
    setMessages,
    setDraggedTask,
    setEditMode,
    setShowDeleted,
    setShowCompleted,
    setOnDragging,
    setActiveId
  };

  return [states, setStates];
};
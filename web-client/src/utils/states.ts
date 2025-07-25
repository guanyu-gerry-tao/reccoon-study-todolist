import { useImmer } from "use-immer";
import { useEffect } from "react";
import type { TaskData, ProjectData, UserProfileData, StatusData, States, SetStates } from "./type";

export const createStatesAndSetStates = (): [States, SetStates] => {


  // State management using useImmer for tasks, projects, user status, and dragged task

  const emptyUserProfile: UserProfileData = {
    id: null,
    nickname: null,
    lastProjectId: null,
    avatarUrl: null,
    language: null
  };

  const [tasks, setTasks] = useImmer<TaskData>({}); // Initial tasks data loaded from testTaskData
  const [projects, setProjects] = useImmer<ProjectData>({}); // Initial projects data loaded from testProjectData
  const [statuses, setStatuses] = useImmer<StatusData>({}); // Initial statuses data loaded from testStatusData
  const [userProfile, setUserProfile] = useImmer<UserProfileData>(emptyUserProfile); // Initial users data loaded from testUserData
  const [draggedTask, setDraggedTask] = useImmer<string[]>([]); // State to track the currently dragged task, if any
  const [editMode, setEditMode] = useImmer<boolean>(false);
  const [showDeleted, setShowDeleted] = useImmer<boolean>(false);
  const [showCompleted, setShowCompleted] = useImmer<boolean>(false);
  const [onDragging, setOnDragging] = useImmer<boolean>(false); // State to manage the dragging state of tasks

  const states: States = {
    tasks,
    projects,
    statuses,
    userProfile,
    draggedTask,
    editMode,
    showDeleted,
    showCompleted,
    onDragging
  };

  const setStates: SetStates = {
    setTasks,
    setProjects,
    setStatuses,
    setUserProfile,
    setDraggedTask,
    setEditMode,
    setShowDeleted,
    setShowCompleted,
    setOnDragging
  };

  return [states, setStates];
};
import { useImmer } from "use-immer";
import { useEffect } from "react";
import { loadTestTasks, loadTestProjects, loadTestUserProfile, loadTestStatuses } from "../data/loadInitData";
import type { TaskData, ProjectData, UserProfileData, StatusData, States, SetStates } from "./type";

export const createStatesAndSetStates = (): [States, SetStates] => {
  // DEBUG: Load initial data for tasks, projects, and user status
  const testTaskData = loadTestTasks();
  const testProjectData = loadTestProjects();
  const testUserProfileData = loadTestUserProfile();
  const testStatusData = loadTestStatuses();
  const testData = { testTaskData, testProjectData, testUserProfileData, testStatusData };

  // State management using useImmer for tasks, projects, user status, and dragged task

  const [tasks, setTasks] = useImmer<TaskData>({}); // Initial tasks data loaded from testTaskData
  const [projects, setProjects] = useImmer<ProjectData>(testData.testProjectData); // Initial projects data loaded from testProjectData
  const [statuses, setStatuses] = useImmer<StatusData>(testData.testStatusData); // Initial statuses data loaded from testStatusData
  const [userProfile, setUserProfile] = useImmer<UserProfileData>(testData.testUserProfileData); // Initial users data loaded from testUserData
  const [draggedTask, setDraggedTask] = useImmer<[string] | null>(null); // State to track the currently dragged task, if any
  const [currentProjectID, setCurrentProjectID] = useImmer<string | null>("project0"); // State to manage the current project ID, which is used to filter tasks by project.
  const [editMode, setEditMode] = useImmer<boolean>(false);
  const [showDeleted, setShowDeleted] = useImmer<boolean>(false);
  const [showCompleted, setShowCompleted] = useImmer<boolean>(false);

  const states: States = {
    tasks,
    projects,
    statuses,
    userProfile,
    draggedTask,
    currentProjectID,
    editMode,
    showDeleted,
    showCompleted
  };

  const setStates: SetStates = {
    setTasks,
    setProjects,
    setStatuses,
    setUserProfile,
    setDraggedTask,
    setCurrentProjectID,
    setEditMode,
    setShowDeleted,
    setShowCompleted
  };

  return [states, setStates];
};
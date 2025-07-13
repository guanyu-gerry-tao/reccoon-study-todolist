import data from './testListChain.json';
import type { ProjectData, StatusData, TaskData, UserId, UserProfileData } from '../components/type.ts';

export function loadTestTasks(): TaskData {
  const rawdata = data.taskList;

  const taskList = Object.fromEntries(
    Object.entries(rawdata).map(([key, value]) => {
      return [
        key,
        {
          ...value,
          dueDate: value.dueDate ? new Date(value.dueDate) : undefined
        }
      ];
    })
  );

  return taskList;
}

export function loadTestProjects(): ProjectData {
  return data.projectList;
}

export function loadTestStatuses(): StatusData {
  return data.status;
}

export function loadTestUserProfile(): UserProfileData {
  const userId = import.meta.env.VITE_DEV_USERID as string;
  return (data.userProfile as Record<UserId, UserProfileData>)[userId];
}
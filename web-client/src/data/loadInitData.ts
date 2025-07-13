import data from './testListChain.json';
import type { ProjectData, StatusData, TaskData, UserData } from '../components/type.ts';

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

export function loadTestUsers(): UserData {
  const rawdata = data.user;

  const userList = Object.fromEntries(
    Object.entries(rawdata).map(([key, value]) => {
      return [
        key,
        {
          ...value,
          lastLoginAt: new Date(value.lastLoginAt),
          createdAt: new Date(value.createdAt),
        }
      ];
    })
  );

  return userList;
}
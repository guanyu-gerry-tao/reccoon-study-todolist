import data from './testListChain.json';
import type { TaskItem, Projects, ProjectItem, UserStatus } from '../components/type.ts';

export function loadInitData(): Record<string, TaskItem> {
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
  )

  return taskList;

  // return Object.entries(data.taskList).map(([key, value]) => {
  //     return {
  //         id: key,
  //         ...value,
  //         dueDate: value.dueDate ? new Date(value.dueDate) : undefined
  //     }
  // });
}

export function loadProjects(): Record<string, ProjectItem> {
  return data.projectList;

  // return  Object.entries(data.projectList).map(([key, value]) => {
  //     return {
  //         id: key,
  //         ...value
  //     }
  // });
}

export function loadTestUserData(): UserStatus {
  const userData = data.userLastState;
  return userData
}
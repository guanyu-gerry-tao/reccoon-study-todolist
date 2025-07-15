import data from './testListChain.json';
import type { ProjectData, StatusData, TaskData, UserId, UserProfileData, TaskType } from '../utils/type.ts';

export async function loadTestTasks(): Promise<TaskData> {
  try {
    let taskList: TaskData = {};
    const res = await fetch('/api/tasks', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to add task: ${res.statusText}`);
    }
    let taskListRaw = await res.json();
    (taskListRaw as TaskType[]).map(task => {
      taskList[task.id] = {
        id: task.id,
        title: task.title,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        description: task.description,
        status: task.status,
        previousStatus: task.previousStatus,
        projectId: task.projectId,
        prev: task.prev,
        next: task.next,
        userId: task.userId,
      };
    });
    return taskList;
  } catch (error) {
    console.error('Error loading test tasks:', error);
    let taskList = {};
    return taskList;
  }

  // const rawdata = data.taskList;

  // const taskList = Object.fromEntries(
  //   Object.entries(rawdata).map(([key, value]) => {
  //     return [
  //       key,
  //       {
  //         ...value,
  //         dueDate: value.dueDate ? new Date(value.dueDate) : undefined
  //       }
  //     ];
  //   })
  // );

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
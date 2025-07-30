import data from './testListChain.json';
import type { ProjectMap, StatusMap, TaskMap, UserId, UserProfileData, Task, Project, Status } from '../utils/type.ts';
import { useNavigate } from 'react-router-dom'; 

// const devUserId = import.meta.env.VITE_DEV_USERID; // TODO: after development, remove this line and use the user ID from the server
// if (!devUserId) {
//   console.error('VITE_DEV_USERID 没有被设置，在 .env 文件中设置一个默认的用户 ID： VITE_DEV_USERID=your_default_user_id');
// }

export async function loadAllData(navigate: any): Promise<{ taskData: TaskMap, projectData: ProjectMap, statusData: StatusMap, userProfileData: UserProfileData }> {

  // console.log("loadAllData called with devUserId:", devUserId);
  
  try {
    let taskData: TaskMap = {};
    let projectData: ProjectMap = {};
    let statusData: StatusMap = {};
    let userProfileData: UserProfileData = {
      id: null,
      nickname: null,
      focusProject: null,
      focusConversation: null,
      avatarUrl: null,
      language: null
    };

    const res = await fetch('/api/getAll', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session management
    });

    if (!res.ok) {
      if (res.status === 401) {
        navigate('/login');
        throw new Error('Unauthorized access, redirecting to login');
      } else {
        throw new Error(`Failed to add task`);
      }
    }
    let { tasks, projects, statuses, userProfile } = await res.json();

    (tasks as Task[]).map((task: Task) => {
      (taskData as TaskMap)[task.id] = {
        id: task.id,
        title: task.title,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        description: task.description,
        status: task.status,
        previousStatus: task.previousStatus,
        prev: task.prev,
        next: task.next,
        userId: task.userId,
      };
      setTimeout(() => {
        document.getElementById(task.id)?.classList.remove('hide');
      }, 10); // Ensure the task is added to the state after the initial render
    });

    (projects as Project[]) = projects.map((project: Project) => {
      (projectData as ProjectMap)[project.id] = {
        id: project.id,
        title: project.title,
        description: project.description,
        prev: project.prev,
        next: project.next,
        userId: project.userId,
      };
    });

    (statuses as Status[]) = statuses.map((status: Status) => {
      (statusData as StatusMap)[status.id] = {
        id: status.id,
        title: status.title,
        description: status.description,
        color: status.color,
        projectId: status.projectId,
        prev: status.prev,
        next: status.next,
        userId: status.userId,
      };
    });

    (userProfileData as UserProfileData) = {
      id: userProfile.id,
      nickname: userProfile.nickname,
      focusProject: userProfile.focusProject,
      focusConversation: userProfile.focusConversation,
      avatarUrl: userProfile.avatarUrl,
      language: userProfile.language
    };

    return { taskData, projectData, statusData, userProfileData };
  } catch (error) {
    console.error('Error loading test tasks:', error);
    return { taskData: {}, projectData: {}, statusData: {}, userProfileData: { id: null, nickname: null, focusProject: null, focusConversation: null, avatarUrl: null, language: null } };
  }
}
import data from './testList.json';
import type {TaskItem, Projects, ProjectItem, UserStatus} from '../components/type.ts';

export function loadInitData(): TaskItem[] {
    return Object.entries(data.taskList).map(([key, value]) => {
        return {
            id: key,
            ...value,
            dueDate: value.dueDate ? new Date(value.dueDate) : undefined
        }
    });
}

export function loadProjects(): ProjectItem[] {
    return  Object.entries(data.projectList).map(([key, value]) => {
        return {
            id: key,
            ...value
        }
    });
}

export function loadTestUserData(): UserStatus {
    const userData = data.userLastState;
    return userData
}
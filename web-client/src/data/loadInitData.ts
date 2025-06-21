import taskList from './testList.json';
import type {TaskItem} from '../components/type.ts';

export function loadInitData(): TaskItem[] {
    return Object.entries(taskList.taskList).map(([key, value]) => {
        return {
            id: key,
            ...value,
            dueDate: value.dueDate ? new Date(value.dueDate) : undefined
        }
    });
}
import { useState } from 'react'
import { useImmer } from 'use-immer'
import '../App.css'

import Menubar from './Menubar.tsx'
import TodoColumn from './TodoColumn.tsx'

type TaskItem = {
  id: string;
  title: string;
  dueDate?: Date;
  description?: string;
  status: 'planned' | 'working' | 'finished';
  isPending: boolean;
  isDeleted: boolean;
  isArchived: boolean;
}

type NewTaskItem = Omit<TaskItem, 'isPending' | 'isDeleted' | 'isArchived'>;

function Todolist() {

  const [tasks, setTasks] = useImmer<TaskItem[]>([]);

  const addTask = (newTask: NewTaskItem) => {
    setTasks(draft => {
      const id = crypto.randomUUID();
      draft.push({ ...newTask, id, isPending: false, isDeleted: false, isArchived: false });
    });
  };

  const updateTask = (id: string, updatedFields: Partial<TaskItem>) => {
    setTasks(draft => {
      const task = draft.find(task => task.id === id);
      if (task) {
        Object.assign(task, updatedFields);
      } else {
        console.warn(`Task with id ${id} not found.`);
      }
    });
  };

  return (
    <>
      <div className='relative flex flex-row'>
        <Menubar />
        <TodoColumn title={"Planned"} bgColor='#f5dacb'/> 
        <TodoColumn title={"Working"} bgColor='#f5f3cb'/>
        <TodoColumn title={"Finished"} bgColor='#d6f5cb'/>
      </div>
    </>
  )
}

export default Todolist
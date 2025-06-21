import { useState } from 'react'
import { useImmer } from 'use-immer'
import '../App.css'

import Menubar from './Menubar.tsx'
import TodoColumn from './TodoColumn.tsx'

import type { TaskItem, NewTaskItem } from './type.ts'


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

  const taskActions = {
    add: addTask,
    update: updateTask,
  };

  return (
    <>
      <div className='relative flex flex-row'>
        <Menubar />
        <TodoColumn title={"Planned"} bgColor='#f5dacb' status='planned' actions={taskActions} tasks={tasks.filter(task => task.status === 'planned')}/> 
        <TodoColumn title={"Working"} bgColor='#f5f3cb' status='working' actions={taskActions} tasks={tasks.filter(task => task.status === 'working')}/>
        <TodoColumn title={"Finished"} bgColor='#d6f5cb' status='finished' actions={taskActions} tasks={tasks.filter(task => task.status === 'finished')}/>
      </div>
    </>
  )
}

export default Todolist
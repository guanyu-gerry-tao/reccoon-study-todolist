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
      console.log(`Task added with id: ${id}`);
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

  const deleteTask = (id: string) => {
    setTasks(draft => {
      const index = draft.findIndex(task => task.id === id);
      if (index !== -1) {
        draft[index].isDeleted = true; // Mark the task as deleted
        // Optionally, you can remove the task from the array
        // draft.splice(index, 1);
      }
    })
  };


  const taskActions = {
    add: addTask,
    update: updateTask,
    delete: deleteTask,
  };

  function checkIfTaskAppears(task: TaskItem) {
    if (task.isDeleted) {
      return false; // Do not display deleted tasks
    }
    if (task.isArchived) {
      return false; // Do not display archived tasks
    }
    return true; // Display tasks that are not deleted or archived
  }

  return (
    <>
      <div className='relative flex flex-row'>
        <Menubar />
        <TodoColumn title={"Planned"} bgColor='#f5dacb' status='planned' actions={taskActions} tasks={tasks.filter(task => task.status === 'planned' && checkIfTaskAppears(task))}/>
        <TodoColumn title={"Working"} bgColor='#f5f3cb' status='working' actions={taskActions} tasks={tasks.filter(task => task.status === 'working' && checkIfTaskAppears(task))}/>
        <TodoColumn title={"Finished"} bgColor='#d6f5cb' status='finished' actions={taskActions} tasks={tasks.filter(task => task.status === 'finished' && checkIfTaskAppears(task))}/>
      </div>
    </>
  )
}

export default Todolist
import { useState } from 'react'
import { useImmer } from 'use-immer'
import '../App.css'

import Menubar from './Menubar.tsx'
import TodoColumn from './TodoColumn.tsx'
import {loadInitData} from '../data/loadInitData.ts'

import type { TaskItem, NewTaskItem } from './type.ts'


function Todolist() {

  const testInitData = loadInitData();
  const [tasks, setTasks] = useImmer<TaskItem[]>(testInitData);

  const addTask = (newTask: NewTaskItem) => {
    setTasks(draft => {
      const id = crypto.randomUUID();
      draft.push({ ...newTask, id, isCompleted: false, isPending: false, isDeleted: false, isArchived: false });
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
        <TodoColumn title={"Planned"} bgColor='#f5dacb' status={0} actions={taskActions} tasks={tasks.filter(task => task.status === 0 && checkIfTaskAppears(task))}/>
        <TodoColumn title={"Working"} bgColor='#f5f3cb' status={1} actions={taskActions} tasks={tasks.filter(task => task.status === 1 && checkIfTaskAppears(task))}/>
        <TodoColumn title={"Finished"} bgColor='#d6f5cb' status={2} actions={taskActions} tasks={tasks.filter(task => task.status === 2 && checkIfTaskAppears(task))}/>
      </div>
    </>
  )
}

export default Todolist
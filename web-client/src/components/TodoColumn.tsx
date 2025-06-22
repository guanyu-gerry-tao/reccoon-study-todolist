import { useState } from 'react'
import '../App.css'
import Dashline from './Dashline';
import AddNewTask from './AddNewTask.tsx';
import type { TodoColumnProps, TaskActions } from './type.ts';
import TaskList from './TaskList.tsx';


function TodoColumn({title, bgColor, status, actions, tasks} : TodoColumnProps) {

  const numTasks = tasks.length;

  return (
    <>
        <div className='relative bg-[#ac7d7d] rounded-2xl m-2 p-8 pr-0 h-[calc(100vh-4rem)] w-80 flex flex-col' style={{backgroundColor: bgColor}}>
            <h1 className='relative text-4xl h-15 '>{title}</h1>
            <TaskList tasks={tasks} actions={actions}/>
            <div>
                <AddNewTask actions={actions} status={status} newOrder={numTasks}/>
            </div>
        </div>
    </>
  )
}

export default TodoColumn
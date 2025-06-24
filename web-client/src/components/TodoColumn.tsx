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
        <div className='relative rounded-2xl m-2 mt-8 p-4 pl-3 pr-3 w-75 flex flex-col flex-shrink-0' style={{backgroundColor: bgColor}}>
            <h1 className='relative text-4xl h-15 pl-4 '>{title}</h1>
            
            <div className='relative flex flex-col'>
              <TaskList status={status}
              tasks={tasks}
              actions={actions}/>
            <AddNewTask actions={actions} status={status} newOrder={numTasks}/>
            </div>

        </div>
    </>
  )
}

export default TodoColumn
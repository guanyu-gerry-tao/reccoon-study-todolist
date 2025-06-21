import { useState } from 'react'
import '../App.css'
import Dashline from './Dashline';
import AddNewTask from './AddNewTask.tsx';
import type { TodoColumnProps, TaskActions } from './type.ts';
import TaskList from './TaskList.tsx';


function TodoColumn({title, bgColor, status, actions, tasks} : TodoColumnProps) {

  return (
    <>
        <div className='relative bg-[#ac7d7d] rounded-2xl m-2 p-8 h-[calc(100vh-4rem)] w-80 flex flex-col' style={{backgroundColor: bgColor}}>
            <h1 className='relative text-4xl h-15 '>{title}</h1>
            <TaskList tasks={tasks}/>
            <div>
                <Dashline />
                <AddNewTask actions={actions} status={status} />
            </div>
        </div>
    </>
  )
}

export default TodoColumn
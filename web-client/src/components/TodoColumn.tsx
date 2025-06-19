import { useState } from 'react'
import '../App.css'
import Dashline from './Dashline';
import AddNewTask from './AddNewTask.tsx';
import Task from './Task.tsx';

''
type TodoColumnProps = {
  title: React.ReactNode;
  bgColor: string;
}

function TodoColumn({title, bgColor} : TodoColumnProps) {

  return (
    <>
        <div className='relative bg-[#ac7d7d] rounded-2xl m-2 p-8 h-[calc(100vh-4rem)] w-80 flex flex-col' style={{backgroundColor: bgColor}}>
            <h1 className='relative text-4xl h-15 '>{title}</h1>
            <div>
                <Dashline />
                <AddNewTask />
            </div>
            <Task title='test1'/>
            <Task title='test21' />
            <Task title='test1' />
        </div>
    </>
  )
}

export default TodoColumn
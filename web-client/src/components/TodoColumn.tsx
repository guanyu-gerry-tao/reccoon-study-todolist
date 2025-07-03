import { useState } from 'react'

import '../App.css'
import './TodoColumn.css';

import AddNewTask from './AddNewTask.tsx';
import type { TodoColumnProps } from './type.ts';
import TaskList from './TaskList.tsx';


function TodoColumn({title, bgColor, status, actions, tasks, currentProjectID} : TodoColumnProps) {
  // FIXME: numTasks counted all tasks without filtering by project
  const numTasks = tasks.length;

  return (
    <>
        <div className='todoColumnCard' style={{backgroundColor: bgColor}}>
            <h1 className='todoColumnTitle'>{title}</h1>
            
            <div className='todoColumnContent'>
              <TaskList status={status}
              tasks={tasks}
              actions={actions}
              currentProjectID={currentProjectID}
              />
            <AddNewTask actions={actions} status={status} newOrder={numTasks} currentProjectID={currentProjectID}/>
            </div>

        </div>
    </>
  )
}

export default TodoColumn
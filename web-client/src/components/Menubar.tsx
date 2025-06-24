import { useState } from 'react'
import '../App.css'

import Project from './Project.tsx'
import TaskDropArea from './TaskDropArea.tsx'



function Menubar({draggedTask}: 
  {draggedTask: [string] | null }) {
  return (
    <>
        <div>
          <p className='relative inline-block m-2 font-extrabold text-2xl text-gray-800'>Reccoon Study</p>
        </div>
        <div className='relative search-bar todo h-10 flex-shrink-0'>
          {/* Search bar tbd */}
        </div>
        <div className='relative flex flex-col flex-grow overflow-hidden'>
          <p className='relative inline-block m-2'>Projects</p>
          <Project />
          <Project />
          <Project />
        </div>
        <div className='relative m-2 p-2 rounded-2xl bottom-0 flex flex-col'>

          <TaskDropArea status={-1} draggedTask={draggedTask} />
          <div className='menubarBottomItems'>
            <p>Deleted Tasks</p>
          </div>
          <div className='menubarBottomItems'>
            <p>Completed Tasks</p>
          </div>
          <div className='menubarBottomItems'>
            <p>Settings</p>
          </div>

          <div className='menubarBottomItems'>
            <p>Help & About</p>
          </div>
          <div className='menubarBottomItems'>
            <p>{draggedTask ? draggedTask.toString() : 'empty'}</p>
          </div>
        </div>
    </>
  )
}

export default Menubar
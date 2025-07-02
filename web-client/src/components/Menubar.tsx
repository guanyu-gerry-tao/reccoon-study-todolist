import { act, useState } from 'react'
import '../App.css'

import ProjectButton from './ProjectButton.tsx'
import TaskDropArea from './TaskDropArea.tsx'
import ProjectPanel from './ProjectPanel.tsx'
import type { ProjectItem, Projects, TaskActions } from './type.ts'



function Menubar({ taskActions, draggedTask, projects, currentProjectID, setCurrentProjectID }:
  { taskActions: TaskActions, draggedTask: [string] | null, projects: ProjectItem[], currentProjectID: string, setCurrentProjectID: (projectID: string) => void }) {

  const [isMouseOverDropZone, setIsMouseOverDropZone] = useState(false);



  return (
    <>
      <div className='menubarContainer relative flex flex-col w-65 p-2 mr-5 h-full flex-shrink-0 bg-[#f5f5f5] transition-all duration-300 ease-in-out'
        style={{ transform: isMouseOverDropZone ? 'translateX(-150%)' : 'translateX(0)' }}
      >
        <div>
          <p className='relative inline-block m-2 font-extrabold text-2xl text-gray-800'>Reccoon Study</p>
        </div>
        {/*
          // TODO: make a logo
          */}
        <div className='relative search-bar todo h-10 flex-shrink-0'>
          {/* TODO: Search bar tbd */}
        </div>
        <div className='relative flex flex-col flex-grow overflow-hidden'>

          <p className='relative inline-block mr-3 text-2xl pl-4'>Projects</p>

          {/*
          // TODO: make a add button, add to pop new project item with empty title and description, to input
          */}
          <ProjectPanel taskActions={taskActions} projects={projects} currentProjectID={currentProjectID} setCurrentProjectID={setCurrentProjectID} />

        </div>
        <div className='relative m-2 p-2 rounded-2xl bottom-0 flex flex-col'>
          {/*
          // TODO: Delete Button, hit to pop column with deleted tasks
          // TODO: Completed Tasks Button, hit to pop column with completed tasks
          */}
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
      </div>


      <div className='dropArea completeDropArea cursor-pointer pointer-events-none'>
        <TaskDropArea status={0} setIsMouseOverDropZone={setIsMouseOverDropZone} />
        <div className='dropAreaVisual completeDropArea'
          style={{ opacity: isMouseOverDropZone ? '1' : '0', transform: isMouseOverDropZone ? 'translateX(0)' : 'translateX(-150%)' }}
        >
          <p>Drop to Complete</p>
        </div>
      </div>
      <div className='dropArea deleteDropArea cursor-pointer pointer-events-none'>
        <TaskDropArea status={-1} setIsMouseOverDropZone={setIsMouseOverDropZone} />
        <div className='dropAreaVisual deleteDropArea'
          style={{ opacity: isMouseOverDropZone ? '1' : '0.5', transform: isMouseOverDropZone ? 'translateX(0)' : 'translateX(-150%)' }}
        >
          <p>Drop to Delete</p>
        </div>
      </div>

    </>
  )
}

export default Menubar
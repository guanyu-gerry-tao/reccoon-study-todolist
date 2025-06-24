import { useState } from 'react'
import '../App.css'

import ProjectButton from './ProjectButton.tsx'
import TaskDropArea from './TaskDropArea.tsx'
import type { ProjectItem, Projects } from './type.ts'



function Menubar({draggedTask, projects, currentProjectID, setCurrentProjectID}: 
  {draggedTask: [string] | null , projects: Projects, currentProjectID: string, setCurrentProjectID: (projectID: string) => void}) {

  const [isMouseOverDropZone, setIsMouseOverDropZone] = useState(false);

  

  return (
    <>
        <div className='menubarContainer relative flex flex-col w-65 p-2 mr-5 h-full flex-shrink-0 bg-[#f5f5f5] transition-all duration-300 ease-in-out'
        style={{transform: isMouseOverDropZone ? 'translateX(-150%)' : 'translateX(0)'}}
        >
        <div>
          <p className='relative inline-block m-2 font-extrabold text-2xl text-gray-800'>Reccoon Study</p>
        </div>
        <div className='relative search-bar todo h-10 flex-shrink-0'>
          {/* Search bar tbd */}
        </div>
        <div className='relative flex flex-col flex-grow overflow-hidden'>
          <p className='relative inline-block m-2'>Projects</p>
          {
            Object.entries(projects).map(([key, project]) => (
              <ProjectButton key={key} project={project} thisID={key} currentProjectID={currentProjectID} setCurrentProjectID={setCurrentProjectID}/>
            ))
          }
        </div>
        <div className='relative m-2 p-2 rounded-2xl bottom-0 flex flex-col'>

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
        

        <div className='dropArea completeDropArea'>
        <TaskDropArea status={0} setIsMouseOverDropZone={setIsMouseOverDropZone} />
        <div className='dropAreaVisual completeDropArea'
        style={{opacity: isMouseOverDropZone ? '1' : '0', transform: isMouseOverDropZone ? 'translateX(0)' : 'translateX(-150%)'}}
        >
          <p>Drop to Complete</p>
        </div>
      </div>
      <div className='dropArea deleteDropArea'>
        <TaskDropArea status={-1} setIsMouseOverDropZone={setIsMouseOverDropZone} />
        <div className='dropAreaVisual deleteDropArea'
        style={{opacity: isMouseOverDropZone ? '1' : '0.5', transform: isMouseOverDropZone ? 'translateX(0)' : 'translateX(-150%)'}}
        >
          <p>Drop to Delete</p>
        </div>
      </div>

    </>
  )
}

export default Menubar
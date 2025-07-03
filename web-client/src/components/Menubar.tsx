import { act, useState } from 'react'
import '../App.css'
import './Menubar.css'

import ProjectButton from './ProjectButton.tsx'
import { useImmer } from 'use-immer'
import TaskDropArea from './TaskDropArea.tsx'
import ProjectPanel from './ProjectPanel.tsx'
import type { ProjectItem, Projects, Actions } from './type.ts'



function Menubar({ actions, draggedTask, projects, currentProjectID, setCurrentProjectID, isMouseOverDropZone }:
  { actions: Actions, draggedTask: [string] | null, projects: ProjectItem[], currentProjectID: string, setCurrentProjectID: (projectID: string) => void, isMouseOverDropZone: boolean }) {




  const [projectDeleteMode, setProjectDeleteMode] = useImmer<boolean>(false);

  const handleDeleteModeClick = () => {
    console.log("delete mode clicked: " + projectDeleteMode);
    setProjectDeleteMode(!projectDeleteMode);
  };

  return (
    <>
      <div className='menubarContainer'
        style={{ transform: isMouseOverDropZone ? 'translateX(-150%)' : 'translateX(0)' }}
      >
        <div>
          <p className='menubarTitle'>Reccoon Study</p>
        </div>
        {/*
          // TODO: make a logo
          */}
        <div className='menubarSearchBar'>
          {/* TODO: Search bar tbd */}
        </div>


        <div className='menubarProjectsHeader'>
          <p className='menubarProjectsTitle'>Projects</p>
          <div className="delSwitch" onClick={handleDeleteModeClick}>Del</div>
        </div>

        <ProjectPanel actions={actions} projects={projects} currentProjectID={currentProjectID} projectDeleteMode={projectDeleteMode} setCurrentProjectID={setCurrentProjectID} />

        <div className='menubarBottom'>
          {/*
          // TODO: Delete Button, hit to pop column with deleted tasks
          // TODO: Completed Tasks Button, hit to pop column with completed task
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
        </div>
      </div>



    </>
  )
}

export default Menubar
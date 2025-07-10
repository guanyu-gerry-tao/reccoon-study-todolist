import { act, useState } from 'react'
import '../App.css'
import './Menubar.css'

import ProjectButton from './ProjectButton.tsx'
import { useImmer } from 'use-immer'
import TaskDropArea from './TaskDropArea.tsx'
import ProjectPanel from './ProjectPanel.tsx'
import type { ProjectItem, Projects, Actions, States } from './type.ts'



/**
 * The Menubar component is the left sidebar of the todolist application.
 * It contains the project list, search bar, and other menu items.
 * @param actions - The actions object containing functions to manipulate projects and tasks.
 * @param draggedTask - The currently dragged task, if any. Not used in this version yet.
 * @param projects - The list of projects available in the application.
 * @param currentProjectID - The ID of the currently selected project.
 * @param setCurrentProjectID - Function to set the currently selected project ID.
 * @param isMouseOverDropZone - Boolean indicating if the mouse is over the drop zone.
 */
function Menubar({
  actions,
  states
}: {
  actions: Actions,
  states: States
}) {


  /**
   * Handle click event for the edit mode toggle.
   */
  const handleEditModeClick = () => {
    console.log("edit mode clicked: " + states.editMode);
    actions.setEditMode(!states.editMode);
  };

  /**
   * Handle click event for the delete tasks button.
   */
  const handleDeleteTasksClick = () => {
    console.log("delete tasks clicked");
    actions.setShowDeleted(!states.showDeleted);
    console.log("show deleted tasks: " + states.showDeleted);
  };

  const handleCompletedTasksClick = () => {
    console.log("completed tasks clicked");
    actions.setShowCompleted(!states.showCompleted);
    console.log("show completed tasks: " + states.showCompleted);
  };
  
  return (
    <>
      <div className='menubarContainer'>
        {/* Logo part 
        // TODO: make a logo */}
        <div>
          <p className='menubarTitle'>Reccoon Study</p>
        </div>

        <div className='menubarSearchBar'>
          <input className="searchInput" type="text" placeholder="Search..." />
          {/* TODO: Search bar tbd */}
        </div>

        {/* The project list */}
        <div className='menubarProjectsHeader'>
          <p className='menubarProjectsTitle'>Projects</p>
          <div className="delSwitch" onClick={handleEditModeClick}>Edit</div>
        </div>

        {/* The actual project buttons components, a droppable */}
        <ProjectPanel actions={actions} states={states} />

        {/* Places for additional actions, such as call deleted and completed tasks, settings and Help+About */}
        <div className='menubarBottom'>
          {/*
          // TODO: Delete Button, hit to pop column with deleted tasks
          // TODO: Completed Tasks Button, hit to pop column with completed task
          */}
          <div className='menubarBottomItems'
            onClick={handleDeleteTasksClick}>
            <p>Deleted Tasks</p>
          </div>
          <div className='menubarBottomItems'
            onClick={handleCompletedTasksClick}>
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
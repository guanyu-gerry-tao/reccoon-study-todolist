import { useRef, useState, useEffect, act } from 'react'
import '../App.css'
import type { ProjectItem, Actions } from './type'
import { Draggable } from '@hello-pangea/dnd'


function ProjectButton(
  { project,
    projects,
    currentProjectID,
    setCurrentProjectID,
    actions,
    deleteMode }:
    {
      project: ProjectItem,
      projects: ProjectItem[],
      currentProjectID: string,
      setCurrentProjectID: (projectID: string) => void,
      actions: Actions,
      deleteMode: boolean
    }) {

  const handleClick = () => {
    setCurrentProjectID(project.id);
    console.log(`Project ${project.title} selected with ID: ${project.id}`);
    console.log(`Current project ID is now: ${project.id}`);
  }
  // TODO: make project buttons scrollable.

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
  }

  const handleDeleteButton = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevent the click event from propagating to the parent div
    if (window.confirm(`Are you sure you want to delete the project: ${project.title}? You cannot undo this action and all tasks will gone!`)) {
      actions.deleteProject(project.id);
      if (projects.length === 1) {
        actions.addProject({ title: 'New Project',
          order: 0,
        });
        setCurrentProjectID(projects[0].id);
        console.log(`Delete button clicked for project: ${project.title}, but it was the last project. A new project has been created.`);
      } else {
        const index = projects.indexOf(project);
        setCurrentProjectID(projects[index > 0 ? index - 1 : 0].id);
        console.log(`Delete button clicked for project: ${project.title}`);
      }
    }
  }


  return (
    <>
      <Draggable draggableId={project.id} index={project.order}>
        {
          (provided, snapshot) => (

            <div
              className='relative'
              onClick={handleClick}
              id={project.id}
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <div className='projectButton relative bg-white w-60 cursor-pointer pl-5 p-3 mt-1 mb-1'
              style={{border: currentProjectID === project.id ? '1px solid #808080' : '1px solid transparent'}}>
                <input
                  type='text'
                  className='relative w-45 bg-transparent outline-0 cursor-pointer'
                  defaultValue={project.title}
                  onChange={handleChange} />
              </div>

              <div className="deleteProjectButton" style={{
                opacity: deleteMode ? 1 : 0,
                visibility: deleteMode ? 'visible' : 'hidden',
                pointerEvents: deleteMode ? 'auto' : 'none'
              }} onClick={handleDeleteButton}
              ></div>
              <div className='projectDragHandlerIcon' ></div>
            </div>)}

      </Draggable >
    </>
  )
}

export default ProjectButton

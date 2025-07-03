import { useRef, useState, useEffect, act } from 'react'

import '../App.css'
import './ProjectButton.css'

import type { ProjectItem, Actions } from './type'
import { Draggable } from '@hello-pangea/dnd'

function getStyle(style: any, snapshot: any) {
  if (snapshot.isDragging) {
    return {
      ...style,
      boxShadow: `rgba(114, 114, 114, 0.5) 0px 5px 10px 5px`,
      opacity: 0.5,
    }
  }
  return style
}

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
        actions.addProject({
          title: 'New Project',
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
              className='projectButton'
              onClick={handleClick}
              id={project.id}
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={{ ...getStyle(provided.draggableProps.style, snapshot), border: currentProjectID === project.id ? '1px solid #808080' : '1px solid transparent' }}
            >
              <div className="projectButtonContent"
              >
                <input
                  type='text'
                  className='projectButtonInput'
                  defaultValue={project.title}
                  onChange={handleChange} />

              </div>
              <div className="deleteProjectButton"
                style={{
                  opacity: deleteMode ? 1 : 0,
                  visibility: deleteMode ? 'visible' : 'hidden',
                  pointerEvents: deleteMode ? 'auto' : 'none'
                }}
                onClick={handleDeleteButton}
              ></div>
              <div className='projectDragHandlerIcon' ></div>

            </div>)}

      </Draggable >
    </>
  )
}

export default ProjectButton

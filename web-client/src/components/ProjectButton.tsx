import { useRef, useState, useEffect } from 'react'
import '../App.css'
import type { ProjectItem } from './type'
import { Draggable } from '@hello-pangea/dnd'


function ProjectButton(
  { project,
    currentProjectID,
    setCurrentProjectID }:
    {
      project: ProjectItem,
      currentProjectID: string,
      setCurrentProjectID: (projectID: string) => void
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


  return (
    <>
      <Draggable draggableId={project.id} index={project.order}>
        {
          (provided, snapshot) => (

            <div
              className='relative bg-gray-200 w-60 rounded-3xl cursor-pointer pl-5 p-3 mb-2'
              onClick={handleClick}
              id={project.id}
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <div>
                <input type='text' className='relative w-45 outline-0 cursor-pointer' defaultValue={project.title} 
                onChange={handleChange}/>
              </div>
            </div>)}

      </Draggable>
    </>
  )
}

export default ProjectButton



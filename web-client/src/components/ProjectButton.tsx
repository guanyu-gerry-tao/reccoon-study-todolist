import { useState } from 'react'
import '../App.css'
import type { ProjectItem } from './type'


function ProjectButton(
  { project, 
  thisID,
  currentProjectID, 
  setCurrentProjectID }: 
  { project: ProjectItem, 
    thisID: string,
    currentProjectID: string,
    setCurrentProjectID: (projectID: string) => void }) {

  const handleClick = () => {
    setCurrentProjectID(thisID);
    console.log(`Project ${project.title} selected with ID: ${thisID}`);
    console.log(`Current project ID is now: ${thisID}`);
  }

  if (currentProjectID === thisID) {
    return (
      <div 
      className='relative bg-gray-200 m-2 p-2 mt-4 md-4 rounded-2xl duration-300 hover:scale-105 cursor-pointer'
      >
        <p className='relative ml-2'>{project.title}</p>
        <p className='relative ml-2 text-xs text-gray-500'>{project.description}</p>
      </div>
    )
  } else {
    return (
      <>
        <div 
        className='relative bg-gray-200 m-2 p-2 mt-4 md-4 rounded-2xl h-10 duration-300 hover:scale-105 cursor-pointer'
        onClick={handleClick}
        >
          <p className='relative ml-2'>{project.title}</p>
        </div>
      </>
    )
  }
}

export default ProjectButton
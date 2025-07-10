import { useRef, useState, useEffect, act } from 'react'

import '../App.css'
import './ProjectButton.css'

import type { ProjectItem, Actions } from './type'
import { Draggable } from '@hello-pangea/dnd'

/**
 * This function is used to get the style of the project button when it is being dragged
 * @param style - The current style of the project button
 * @param snapshot - The snapshot of the drag state, provides information about the drag state, provided by the Draggable component
 * @returns The updated style for the project button, used in the Draggable component.
 */
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

/**
 * ProjectButton component represents a single project button in the project panel.
 * It is draggable and can be clicked to select the project.
 * @param project - The project item to be displayed in this button. Contains properties like id, title, and order.
 * @param projects - The list of all projects, used for deleting and reordering.
 * @param currentProjectID - The ID of the currently selected/showing project.
 * @param setCurrentProjectID - Function to set the currently selected project ID.
 * @param actions - The actions object containing methods to manipulate projects. Defined in App.tsx.
 * @param deleteMode - Boolean indicating if the delete mode is active. Delete mode allows the user to delete projects by clicking the delete button on the X button.
 */
function ProjectButton({
  project,
  projects,
  currentProjectID,
  actions,
  deleteMode }:
  {
    project: [string, ProjectItem],
    projects: [string, ProjectItem][],
    currentProjectID: string | null,
    actions: Actions,
    deleteMode: boolean
  }) {

  /** Handle click event on the project button. */
  const handleClick = () => {
    actions.setCurrentProjectID(project[0]);
    console.log(`Project ${project[1].title} selected with ID: ${project[0]}`);
    console.log(`Current project ID is now: ${project[0]}`);
  }
  // TODO: make project buttons scrollable.


  /**
   * Handle change event for the project title input field.
   * @param e - The change event for the input field.
  */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    //TODO: Implement the logic to update the project title when the input field changes.
  }

  /**
   * Handle mouse event for the delete button.
   * @param e - The mouse event for the delete button.
   */
  const handleDeleteButton = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevent the click event from propagating to the parent div
    if (window.confirm(`Are you sure you want to delete the project: ${project[1].title}? You cannot undo this action and all tasks will gone!`)) {

      const index = projects.indexOf(project);

      actions.deleteProject(project[0]);
      projects.splice(index, 1); // Remove the project from the projects array

      // 1. [A, B, C] -> [A, C] when deleting B,, C.prev = A, A.next = C,, 
      // 2. [A, B, C] -> [A, B] when deleting C,, B.next = null,, index === 2 === projects.length - 1
      // 3. [A, B, C] -> [B, C] when deleting A,, B.prev = null,, index === 0
      // 4. [A, B] -> [B] when deleting A,, B.prev = null
      // 5. [A, B] -> [A] when deleting B,, A.next = null
      // 6. [A] -> [] when deleting A, do nothing, as there is no next or previous project

      // if the first project is deleted, and there is project left,
      // index===0 is the next one of the deleted project,
      // set the index===0 project.prev to null
      // scenario 3, 4
      if (index === 0 && projects.length > 0) {
        actions.updateProject(projects[0][0], { prev: null });
      }

      // if the last project is deleted, and there is still project left,
      // set the index===last project.next to null
      // index===length- is the previous one of the deleted project,
      // scenario 2, 5
      if (index === projects.length && projects.length > 0) {
        actions.updateProject(projects[index - 1][0], { next: null });
      }

      // if the project is in the middle of the list,
      // set the previous project's next to the next project,
      // and the next project's prev to the previous project.
      // scenario 1
      if (index > 0 && index < projects.length) {
        actions.updateProject(projects[index - 1][0], { next: projects[index][0] });
        actions.updateProject(projects[index][0], { prev: projects[index - 1][0] });
      }

      // if the project was the only project in the list,
      // do nothing, as there is no next or previous project.
      // scenario 6

      // handle changing of the current project ID
      // if project deleted and there are still projects left,
      // set the current project ID to the previous project.
      if (projects.length > 0) {
        actions.setCurrentProjectID(projects[index > 0 ? index - 1 : 0][0]);
      } else { // if no projects left, set the current project ID to an empty string
        actions.setCurrentProjectID(null);
      }

      console.log(`Delete button clicked for project: ${project[1].title}`);

    }
  }

  // Note: the Draggable component from @hello-pangea/dnd requires a unique draggableId for each task.
  // The setup below is specially for the draggable task component.
  // id: it should be unique and match the taskInfo.id, which is already unique. Specially required by Draggable component.
  // ref: it is used to get the reference of the task element for dragging. Specially Required by Draggable component.
  // ...provided.draggableProps: these are the props required by the Draggable component to make the task draggable.
  // ...provided.dragHandleProps: these are the props required by the Draggable component to make the <div> draggable.
  // style: this is used to apply the draggable styles to the task element. See getStyle function above.
  return (
    <>
      <Draggable draggableId={project[0]} index={projects.indexOf(project)}>
        {
          (provided, snapshot) => (

            <div
              className='projectButton'
              id={project[0]}
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={{ ...getStyle(provided.draggableProps.style, snapshot), border: currentProjectID === project[0] ? '1px solid #808080' : '1px solid transparent' }}
              onClick={handleClick}
            >
              <div className="projectButtonContent"
              >
                <input
                  type='text'
                  className='projectButtonInput'
                  defaultValue={project[1].title}
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

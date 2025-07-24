import { useRef, useState, useEffect, act } from 'react'

import '../App.css'
import './ProjectButton.css'

import type { ProjectType, Actions, States, ProjectId } from '../utils/type'
import { Draggable } from '@hello-pangea/dnd'
import { useAppContext } from './AppContext'
import { createBackup, createBulkPayload, optimisticUIUpdate, postPayloadToServer, restoreBackup } from '../utils/utils'

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
 * @param editMode - Boolean indicating if the editMode is active. Edit mode allows the user to edit project titles.
 */
function ProjectButton({
  project,
  projects,
  currentProjectID, }:
  {
    project: [ProjectId, ProjectType],
    projects: [ProjectId, ProjectType][],
    currentProjectID: ProjectId | null,
  }) {

  // Use the AppContext to access the global state and actions
  const { states, setStates, actions } = useAppContext();

  /** Handle click event on the project button. */
  const handleClick = () => {
    setStates.setCurrentProjectID(project[0]);
  }
  // TODO: make project buttons scrollable.


  /**
   * Handle change event for the project title input field.
   * @param e - The change event for the input field.
  */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const event = e; // Store the current target for later use
    const newTitle = event.target.value;
    //TODO: Implement the logic to update the project title when the input field changes.
  }

  /**
   * Handle mouse event for the delete button.
   * @param e - The mouse event for the delete button.
   */
  const handleDeleteButton = (e: React.MouseEvent<HTMLDivElement>) => {
    const event = e; // Store the current target for later use
    event.stopPropagation(); // Prevent the click event from propagating to the parent div
    if (window.confirm(`Are you sure you want to delete the project: ${project[1].title}? You cannot undo this action and all tasks will gone!`)) {

      // handle changing of the current project ID
      // if project deleted and there are still projects left,
      // set the current project ID to the previous project.
      if (states.currentProjectID === project[0]) {
        if (projects.length > 0) {
          setStates.setCurrentProjectID(project[1].prev || project[1].next);
          console.log(states.currentProjectID);
        } else { // if no projects left, set the current project ID to an empty string
          setStates.setCurrentProjectID(null);
        }
      }

      // Create a bulk payload and backup for the delete operation
      const bulkPayload = createBulkPayload();
      const backup = createBackup(states, bulkPayload);

      try {
        actions.deleteProject(project[0], backup); // Call the delete function from actions with the project ID
        Object.entries(states.tasks).filter(task => task[1].projectId === project[0]).forEach(task => {
          actions.hardDeleteTask(task[0], backup); // Delete all tasks in the project
        });
        optimisticUIUpdate(setStates, backup); // Optimistically update the UI with the deleted project
        postPayloadToServer('/api/bulk', backup); // Send the delete request to the server
      } catch (error) {
        console.error('Error deleting project:', error);
        restoreBackup(setStates, backup); // Restore the previous state in case of an error
      }

      // actions.deleteProject(project[0]); // Call the delete function from actions with the project ID

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
              className={`projectButton`}
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
                  opacity: states.editMode ? 1 : 0,
                  visibility: states.editMode ? 'visible' : 'hidden',
                  pointerEvents: states.editMode ? 'auto' : 'none',
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

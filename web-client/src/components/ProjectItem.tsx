import { useRef, useState, useEffect, act } from 'react'

import '../App.css'
import './ProjectItem.css'

import type { Project, Actions, States, ProjectId } from '../utils/type'
import { Draggable } from '@hello-pangea/dnd'
import { useAppContext } from './AppContext'
import { createBulkPayload, optimisticUIUpdate, postPayloadToServer, restoreBackup, sortChain } from '../utils/utils'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { s } from 'framer-motion/client'

/**
 * This function is used to get the style of the project button when it is being dragged
 * @param style - The current style of the project button
 * @param snapshot - The snapshot of the drag state, provides information about the drag state, provided by the Draggable component
 * @returns The updated style for the project button, used in the Draggable component.
 */
// function getStyle(style: any, snapshot: any) {
//   if (snapshot.isDragging) {
//     return {
//       ...style,
//       boxShadow: `rgba(114, 114, 114, 0.5) 0px 5px 10px 5px`,
//       opacity: 0.5,
//     }
//   }
//   return style
// }

/**
 * ProjectItem component represents a single project button in the project panel.
 * It is draggable and can be clicked to select the project.
 * @param project - The project item to be displayed in this button. Contains properties like id, title, and order.
 * @param projects - The list of all projects, used for deleting and reordering.
 * @param currentProjectID - The ID of the currently selected/showing project.
 * @param setCurrentProjectID - Function to set the currently selected project ID.
 * @param actions - The actions object containing methods to manipulate projects. Defined in App.tsx.
 * @param editMode - Boolean indicating if the editMode is active. Edit mode allows the user to edit project titles.
 */
function ProjectItem({ projectId }: { projectId: ProjectId }) {

  const navigate = useNavigate();

  // Use the AppContext to access the global state and actions
  const { states, setStates, actions } = useAppContext();

  const project = states.projects[projectId]; // Get the project by ID
  const projects = sortChain(states.projects) as [string, Project][]; // Get the sorted projects

  /** Handle click event on the project item. */
  const handleClick = () => {
    const payload = createBulkPayload(states); // Create a bulk payload for the project click
    try {
      actions.focusItem('project', projectId, payload); // Focus on the clicked project
      optimisticUIUpdate(setStates, payload); // Optimistically update the UI
      postPayloadToServer('/api/bulk', navigate, payload); // Send the focus request
    } catch (error) {
      console.error('Error focusing project:', error);
      restoreBackup(setStates, payload); // Restore the previous state in case of an error
    }
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
    if (window.confirm(`Are you sure you want to delete the project: ${project.title}? You cannot undo this action and all tasks will gone!`)) {

      // handle changing of the current project ID
      // if project deleted and there are still projects left,
      // set the current project ID to the previous project.


      // Create a bulk payload and backup for the delete operation
      const bulkPayload = createBulkPayload(states);
      try {
        actions.deleteItem('project', projectId, states.projects, bulkPayload); // Call the delete function from actions with the project ID
        if (states.userProfile.focusProject === projectId) {
          if (projects.length > 0) {
            actions.focusItem('project', project.prev || project.next, bulkPayload);
            console.log(states.userProfile.focusProject);
          } else { // if no projects left, set the current project ID to an empty string
            actions.focusItem('project', null, bulkPayload); // Focus on no project
          }
        }
        optimisticUIUpdate(setStates, bulkPayload); // Optimistically update the UI with the deleted project
        postPayloadToServer('/api/bulk', navigate, bulkPayload); // Send the delete request to the server
        console.log('tasks after deletion', JSON.stringify(states.projects));
      } catch (error) {
        console.error('Error deleting project:', error);
        restoreBackup(setStates, bulkPayload); // Restore the previous state in case of an error
      }

      // actions.deleteProject(project[0]); // Call the delete function from actions with the project ID

      console.log(`Delete button clicked for project: ${project.title}`);

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
    <motion.div
      className={`projectButton`}
      id={projectId}
      style={{ border: states.userProfile.focusProject === projectId ? '1px solid #808080' : '1px solid transparent' }}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      layoutId={projectId} // Magic property: layout animation ✅
      layout // Magic property: automatically detect layout changes
      initial={{ opacity: 0, scale: 0.95 }} // Initial animation state
      animate={{ opacity: 1, scale: 1 }} // Animation state when the component is mounted
      transition={{ type: 'spring', stiffness: 300, damping: 30, layout: { duration: 0.3 } }} // Animation transition properties
    >
      <div className="projectButtonContent">
        <input
          type='text'
          className='projectButtonInput'
          defaultValue={project.title}
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
    </motion.div>
  )
}

export default ProjectItem

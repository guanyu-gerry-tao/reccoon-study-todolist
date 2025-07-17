import '../App.css'
import './AddNewTask.css'

import type { Actions, ProjectId, States, TaskId, TaskType } from '../utils/type.ts';
import { createBackup, createBulkPayload, restoreBackup } from '../utils/utils'

import Project from './ProjectButton.tsx'
import { useAppContext } from './AppContext.tsx';

/**
 * AddNewTask component allows users to add a new task by typing in an input field.
 * @actions - The actions object containing methods to manipulate tasks.
 * @status - The status of the task (e.g., To Do, In Progress, Done).
 * @newOrder - The order number for the new task, used to determine its position in the list.
 * @currentProjectID - The ID of the current project to which the new task will be added.
 */
function AddNewTask({ status, tasksSorted, }: { status: string, tasksSorted: [TaskId, TaskType][], }) {

  // Use the AppContext to access the global state and actions
  const { states, actions, setStates } = useAppContext();

  /**
   * This function handles keyboard events in the input field.
   * @param e - The keyboard event triggered when the user presses a key in the input field.
   */
  const handleKeyboard = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { // Check if the Enter key is pressed: this will add a new task
      const newTaskTitle = e.currentTarget.value.trim(); // Get the trimmed value of the input field
      e.currentTarget.value = ''; // Clear the input field after adding the task

      if (newTaskTitle) { // Check if the input is not empty
        const newTask = {
          title: newTaskTitle,
          status: status,
          previousStatus: status, // for new task, the previous status is the same as the current status
          projectId: states.currentProjectID as ProjectId, // Assuming a default project, you can modify this as needed
          prev: null, // For a new task, new task is the last one, next are null
          next: tasksSorted.length > 0 ? tasksSorted[0][0] : null, // Get the first task ID as the next task
          userId: states.userProfile.id,
        };
        const bulkPayload = createBulkPayload(); // Create a bulk payload for the new task
        const backup = createBackup(states, bulkPayload); // Create a backup of the current state
        actions.addTasks([newTask], backup); // Call the addTasks function from actions with the new task
        try {
          await fetch('/api/tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(backup), // Send the new task to the server
          });
        } catch (error) {
          console.error('Error adding new task:', error);
          restoreBackup(setStates, backup);
        }
      }
    }
    if (e.key === 'Escape') { // Check if the Escape key is pressed: this will clear the input field
      e.currentTarget.value = ''; // Clear the input field
      e.currentTarget.blur(); // Remove focus from the input field
    }
  };

  return (
    <>
      <input type="text"
        placeholder={"+ add new task"}
        onKeyDown={handleKeyboard}
        className='addNewTaskInput' />
    </>
  )
}

export default AddNewTask
import '../App.css'
import './AddNewTask.css'

import type { Actions, TaskItem } from './type.ts';

import Project from './ProjectButton.tsx'

/**
 * AddNewTask component allows users to add a new task by typing in an input field.
 * @actions - The actions object containing methods to manipulate tasks.
 * @status - The status of the task (e.g., To Do, In Progress, Done).
 * @newOrder - The order number for the new task, used to determine its position in the list.
 * @currentProjectID - The ID of the current project to which the new task will be added.
 */
function AddNewTask({ actions,
  status,
  tasksSorted,
  currentProjectID }: {
    actions: Actions,
    status: number,
    tasksSorted: [string, TaskItem][],
    currentProjectID: string
  }) {

  /**
   * This function handles keyboard events in the input field.
   * @param e - The keyboard event triggered when the user presses a key in the input field.
   */
  const handleKeyboard = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { // Check if the Enter key is pressed: this will add a new task
      const newTaskTitle = e.currentTarget.value.trim(); // Get the trimmed value of the input field

      if (newTaskTitle) { // Check if the input is not empty
        const newTask = {
          title: newTaskTitle,
          status: status,
          previousStatus: status, // for new task, the previous status is the same as the current status
          project: currentProjectID, // Assuming a default project, you can modify this as needed
          prev: tasksSorted.length > 0 ? tasksSorted[tasksSorted.length - 1][0] : null, // Get the last task ID as the previous task
          next: null, // For a new task, new task is the last one, next are null
        };
        actions.addTask(newTask); // Call the add function from actions with the new task
        e.currentTarget.value = ''; // Clear the input field after adding the task
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
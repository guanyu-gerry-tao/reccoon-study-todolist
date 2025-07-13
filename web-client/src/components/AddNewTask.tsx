import '../App.css'
import './AddNewTask.css'

<<<<<<< HEAD
import type { Actions, ProjectId, States, TaskId, TaskType } from './type.ts';
=======
import type { Actions, States, TaskItem } from './type.ts';
>>>>>>> origin/Irene-change

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
  states }: {
    actions: Actions,
<<<<<<< HEAD
    status: string,
    tasksSorted: [TaskId, TaskType][],
=======
    status: number,
    tasksSorted: [string, TaskItem][],
>>>>>>> origin/Irene-change
    states: States
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
<<<<<<< HEAD
          project: states.currentProjectID as ProjectId, // Assuming a default project, you can modify this as needed
=======
          project: states.userStatus.project as string, // Assuming a default project, you can modify this as needed
>>>>>>> origin/Irene-change
          prev: tasksSorted.length > 0 ? tasksSorted[tasksSorted.length - 1][0] : null, // Get the last task ID as the previous task
          next: null, // For a new task, new task is the last one, next are null
          userId: states.userProfile.id,
        };
        const id = actions.addTask(newTask); // Call the add function from actions with the new task
        if (tasksSorted.length > 0) { // If there are existing tasks, update the last task to point to the new task
          actions.updateTask(tasksSorted[tasksSorted.length - 1][0], { next: id }); // Update the last task to point to the new task
        }
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
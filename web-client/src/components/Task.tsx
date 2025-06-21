import '../App.css'
import Dashline from './Dashline'
import type { TaskItem, TaskActions } from './type.ts'


function Task({ taskInfo, actions }: {taskInfo: TaskItem, actions: TaskActions}) {

  let tempValue = taskInfo.title; // Temporary variable to store the current value of the input field

  const handleClickTitle = (e: React.MouseEvent<HTMLInputElement>) => {
    tempValue = e.currentTarget.value; // Store the current value of the input field
  };

  const handleKeyboard = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); // Remove focus from the input field
    }
    if (e.key === 'Escape' && e.currentTarget.value !== '') {
      // Handle Escape key press logic here
      e.currentTarget.value = tempValue; // Restore the previous value
      e.currentTarget.blur(); // Remove focus from the input field
    }
    if (e.currentTarget.value === '' && (e.key === 'Delete' || e.key === 'Backspace' || e.key === 'Escape')) {
      // Handle Backspace or Delete key press logic here
      console.log(`Delete ${taskInfo.id}`)
      actions.delete(taskInfo.id); // Call the delete function from actions with the title
      e.currentTarget.blur(); // Remove focus from the input field
    }
  };

  return (
    <>
      <input type="text" defaultValue={taskInfo.title} onClick={handleClickTitle} onKeyDown={handleKeyboard}/>
    </>
  )
}

export default Task
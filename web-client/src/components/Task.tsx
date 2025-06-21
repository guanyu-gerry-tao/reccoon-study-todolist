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

  const handleDragStart = (e: React.DragEvent<HTMLInputElement>) => {
    console.log(`Drag started for task: ${taskInfo.id}`);
    const rect = e.currentTarget.getBoundingClientRect();
    e.dataTransfer.setDragImage(
      e.currentTarget,
      e.clientX - rect.left,
      e.clientY - rect.top
    ); // Set the drag image to the center of the input field
  }

  return (
    <div className='bg-amber-500 rounded-lg m-2 ml-0 mr-6 p-2'
    draggable={true}
    onDragStart={handleDragStart}>
      <input 
      className='cursor-default outline-0'
      type="text" 
      defaultValue={taskInfo.title} 
      onClick={handleClickTitle} 
      onKeyDown={handleKeyboard}/>
    </div>
  )
}

export default Task
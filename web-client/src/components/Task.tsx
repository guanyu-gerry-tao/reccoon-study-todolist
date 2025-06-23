import { style } from 'motion/react-client';
import '../App.css'
import Dashline from './Dashline'
import type { TaskItem, TaskActions } from './type.ts'


function Task({ taskInfo, actions, draggingType, draggingTaskId }: 
  {taskInfo: TaskItem, actions: TaskActions, draggingType?: string | null, draggingTaskId?: string | null}) {

  let tempValue = taskInfo.title; // Temporary variable to store the current value of the input field

  const handleClickTitle = (e: React.MouseEvent<HTMLInputElement>) => {
    tempValue = e.currentTarget.value; // Store the current value of the input field
  };

  const handleKeyboard = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.title = e.currentTarget.value;
      e.currentTarget.blur(); // Remove focus from the input field
      console.log(`update title: ${e.currentTarget.title}`)
    }
    if (e.key === 'Escape' && e.currentTarget.value !== '') {
      // Handle Escape key press logic here
      e.currentTarget.value = tempValue; // Restore the previous value
      e.currentTarget.blur(); // Remove focus from the input field
    }
    if (e.currentTarget.value === '' && (e.key === 'Delete' || e.key === 'Backspace' || e.key === 'Escape')) {
      // Handle Backspace or Delete key press logic here
      console.log(`Delete ${taskInfo.id}`)
      actions.deleteTask(taskInfo.id); // Call the delete function from actions with the title
      e.currentTarget.blur(); // Remove focus from the input field
    }
  }; 

  const handleLostFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.currentTarget.value === '') {
      actions.deleteTask(taskInfo.id);
      console.log(`Task deleted: ${taskInfo.id}`);
    } else if (e.currentTarget.value !== taskInfo.title) {
      actions.updateTask(taskInfo.id, { ...taskInfo, title: e.currentTarget.value });
      console.log(`Title updated to: ${e.currentTarget.value}`);
    }
  }

  const handleDragStart = (e: React.DragEvent<HTMLElement>) => {
    console.log(`Drag started for task: ${taskInfo.id}`);
    e.currentTarget.classList.add('pendingCard');
    actions.draggingTask(taskInfo.id); // Notify the parent component that a task is being dragged    
    
    requestAnimationFrame(() => {
      document.querySelectorAll('.dragZone').forEach(el => (el as HTMLElement).classList.add('active'))
    });
  }

  const handleDragEnd = (e: React.DragEvent<HTMLElement>) => {
    console.log(`Drag ended for task: ${taskInfo.id}`);
    e.currentTarget.classList.remove('pendingCard');
    actions.draggingTaskEnd(); // Notify the parent component that dragging has ended
    requestAnimationFrame(() => {
      document.querySelectorAll('.dragZone').forEach(el => (el as HTMLElement).classList.remove('active') )
    })
  }

  return (
    <div className='Card relative bg-amber-500 rounded-lg ml-0 mr-6 p-2'
    draggable={true}
    onDragStart={handleDragStart}
    onDragEnd={handleDragEnd}>
      <input 
      className='cursor-default outline-0'
      type="text" 
      defaultValue={taskInfo.title} 
      onClick={handleClickTitle} 
      onKeyDown={handleKeyboard} 
      onBlur={handleLostFocus}/>
      <span>{taskInfo.order}</span>
    </div>
  )
}

export default Task



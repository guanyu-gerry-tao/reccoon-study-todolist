import { style, text } from 'motion/react-client';
import '../App.css'
import Dashline from './Dashline'
import type { TaskItem, TaskActions } from './type.ts'
import { Draggable } from '@hello-pangea/dnd';
import React, { useRef, useEffect } from 'react';


function Task({ taskInfo, actions, draggingType, draggingTaskId }: 
  {taskInfo: TaskItem, actions: TaskActions, draggingType?: string | null, draggingTaskId?: string | null}) {
  
  let tempValue = taskInfo.title; // Temporary variable to store the current value of the input field

  const handleClickTitle = (e: React.MouseEvent<HTMLInputElement>) => {
    tempValue = e.currentTarget.value; // Store the current value of the input field
  };

  const handleTitleKeyboard = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const handleTitleLostFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.currentTarget.value === '') {
      actions.deleteTask(taskInfo.id);
      console.log(`Task deleted: ${taskInfo.id}`);
    } else if (e.currentTarget.value !== taskInfo.title) {
      actions.updateTask(taskInfo.id, { ...taskInfo, title: e.currentTarget.value });
      console.log(`Title updated to: ${e.currentTarget.value}`);
    }
  }

  const handleDescLostFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (e.currentTarget.value !== taskInfo.description) {
      actions.updateTask(taskInfo.id, { ...taskInfo, description: e.currentTarget.value });
      console.log(`Description updated to: ${e.currentTarget.value}`);
    }
  }

  const handleDescKeyboard = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default Enter key behavior (adding a new line)
      e.currentTarget.blur(); // Remove focus from the textarea
      console.log(`Description updated to: ${e.currentTarget.value}`);
      actions.updateTask(taskInfo.id, { ...taskInfo, description: e.currentTarget.value });
    }
    if (e.key === 'Escape' && e.currentTarget.value !== '') {
      // Handle Escape key press logic here
      e.currentTarget.value = taskInfo.description || ''; // Restore the previous value
      e.currentTarget.blur(); // Remove focus from the textarea
      if (textAreaRef.current) {
        textAreaRef.current!.style.height = 'auto'; // Reset height to auto
        textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px'; // Set height to scrollHeight
      }
    }
  }
  
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto'; // Reset height to auto to calculate scrollHeight correctly
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px'; // Set height to scrollHeight
    }
    console.log(`Task description updated: ${taskInfo.description}`);
  }, [taskInfo.description]);

  return (
    <Draggable draggableId={taskInfo.id} index={taskInfo.order}>
      {
        (provided) => (
          <div className='Card relative ml-0 mr-6 p-1'
            ref={provided.innerRef}
            {...provided.draggableProps}
            >
              <div className='bg-white w-full h-full rounded-2xl'
              {...provided.dragHandleProps}
              >
                <input 
                className='taskTitle cursor-default outline-0 relative left-0 p-2 pl-3 pb-0 font-semibold'
                type="text" 
                defaultValue={taskInfo.title} 
                onClick={handleClickTitle} 
                onKeyDown={handleTitleKeyboard} 
                onBlur={handleTitleLostFocus}/>

                <textarea
                className='taskDesc cursor-default outline-0 relative left-0 p-2 pl-3 pt-0 text-sm text-gray-500 resize-none overflow-hidden'
                defaultValue={taskInfo.description}
                ref={textAreaRef}
                onChange={(e) => {
                  e.currentTarget.style.height = 'auto'; // Reset height to auto to calculate scrollHeight correctly
                  e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'; // Set height to scrollHeight
                }}
                onKeyDown={ handleDescKeyboard}
                onBlur={handleDescLostFocus}
                />

                <span>{taskInfo.order}</span>
              </div>
          </div>
        )
      }
    </Draggable>
  )
}

export default Task



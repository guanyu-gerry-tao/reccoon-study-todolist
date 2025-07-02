import { div, filter, style, text } from 'motion/react-client';
import '../App.css'
import Dashline from './Dashline'
import type { TaskItem, TaskActions } from './type.ts'
import { Draggable } from '@hello-pangea/dnd';
import React, { useRef, useEffect } from 'react';

import draggableIcon from '../assets/draggableHandler.svg';

function getStyle(style: any, snapshot: any) {
  if (snapshot.dropAnimation) {
    const { moveTo, curve, duration } = snapshot.dropAnimation;
    // move to the right spot
    const translate = `translate(calc(${moveTo.x}px - 100%), ${moveTo.y}px)`;
    // add a bit of turn for fun
    const rotate = 'rotate(-0.05turn)';

    if (snapshot.draggingOver === '-1' || snapshot.draggingOver === '0') {
      return {
        ...style,
        transform: `${translate} ${rotate}`,
        // slowing down the drop because we can
        transition: `all ${curve} ${duration}s`,
      };
    }
  }
  if (snapshot.isDragging && snapshot.draggingOver === '-1') {
    return {
      ...style,
      backgroundColor: `rgba(255, 0, 0, 0.418)`,
      boxShadow: `0 0 5px 5px rgba(255, 0, 0, 1)`,
    }
  }
  return style
}

// TODO: refine style when dropping task 

function Task({ taskInfo, actions }:
  { taskInfo: TaskItem, actions: TaskActions }) {

  let tempValue = taskInfo.title; // Temporary variable to store the current value of the input field

  const handleClickTitle = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    tempValue = e.currentTarget.value; // Store the current value of the input field
  };

  const handleTitleKeyboard = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      actions.updateTask(taskInfo.id, { title: e.currentTarget.value });
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

  const handleTitleLostFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (e.currentTarget.value === '') {
      actions.deleteTask(taskInfo.id);
      console.log(`Task deleted: ${taskInfo.id}`);
    } else if (e.currentTarget.value !== taskInfo.title) {
      actions.updateTask(taskInfo.id, { title: e.currentTarget.value });
      console.log(`Title updated to: ${e.currentTarget.value}`);
    }
  }

  const handleDescLostFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (e.currentTarget.value !== taskInfo.description) {
      actions.updateTask(taskInfo.id, { description: e.currentTarget.value });
      console.log(`Description updated to: ${e.currentTarget.value}`);
    }
  }

  const handleDescKeyboard = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default Enter key behavior (adding a new line)
      e.currentTarget.blur(); // Remove focus from the textarea
      console.log(`Description updated to: ${e.currentTarget.value}`);
      actions.updateTask(taskInfo.id, { description: e.currentTarget.value });
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
  const textAreaRef2 = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '0px'; // Reset height to auto to calculate scrollHeight correctly
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px'; // Set height to scrollHeight
    }
  }, [taskInfo.title, taskInfo.description]);

  useEffect(() => {
    if (textAreaRef2.current) {
      textAreaRef2.current.style.height = '0px'; // Reset height to auto to calculate scrollHeight correctly
      textAreaRef2.current.style.height = textAreaRef2.current.scrollHeight + 'px'; // Set height to scrollHeight
    }
  }, [taskInfo.title]);

  return (
    <Draggable draggableId={taskInfo.id} index={taskInfo.order}>
      {
        (provided, snapshot) => (
          <div className='card relative bg-white w-full rounded-2xl bt-2 mb-2'
            id={taskInfo.id}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={getStyle(provided.draggableProps.style, snapshot)}
          >

            <div className='taskDragHandlerIcon' ></div>

            <div className='cardTitleContainer relative p-4 flex flex-col gap-1'>
              <textarea
                className='taskTitle relative cursor-default outline-0 font-semibold resize-none'
                placeholder='Add a title...'
                defaultValue={taskInfo.title}
                ref={textAreaRef2}
                onChange={(e) => {
                  e.currentTarget.style.height = '0px'; // Reset height to auto to calculate scrollHeight correctly
                  e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'; // Set height to scrollHeight
                }}
                onClick={handleClickTitle}
                onKeyDown={handleTitleKeyboard}
                onBlur={handleTitleLostFocus} />

              <textarea
                className='taskDesc relative cursor-default outline-0 text-xs font-thin text-gray-500 resize-none'
                defaultValue={taskInfo.description}
                placeholder='Add a description...'
                ref={textAreaRef}
                onChange={(e) => {
                  e.currentTarget.style.height = '0px'; // Reset height to auto to calculate scrollHeight correctly
                  e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'; // Set height to scrollHeight
                }}
                onKeyDown={handleDescKeyboard}
                onBlur={handleDescLostFocus}
              />

              <input type='date'
                className='taskDueDate relative cursor-default outline-0 text-xs font-thin w-22 opacity-50 resize-none '
                defaultValue={taskInfo.dueDate ? taskInfo.dueDate.toISOString().slice(0, 10) : undefined}
                onChange={(e) => {
                  if (!e.currentTarget.value) {
                    actions.updateTask(taskInfo.id, { dueDate: undefined });
                  } else {

                    actions.updateTask(taskInfo.id, { dueDate: new Date(e.currentTarget.value) });
                    console.log(`Due date updated to: ${e.currentTarget.value}`);
                  }
                }}
                style={{
                  color: taskInfo.dueDate && taskInfo.dueDate < new Date() ? 'red' : '',
                  fontWeight: taskInfo.dueDate && taskInfo.dueDate < new Date() ? 'normal' : '',
                  opacity: taskInfo.dueDate && taskInfo.dueDate < new Date() ? '1' : ''
                }}
              />
              
              {/* 
              <p className='cardDebug'>
                id: {taskInfo.id }<br/>
              order: {taskInfo.order}
              </p>
              */}

              {//TODO: add subtasks function: click to drop down subtasks, subtasks can be added, deleted, updated, dragged
              }



            </div>
          </div>
        )
      }
    </Draggable>
  )
}

export default Task



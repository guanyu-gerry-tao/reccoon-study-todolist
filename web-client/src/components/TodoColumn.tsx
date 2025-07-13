import { useState } from 'react'

import '../App.css'
import './TodoColumn.css';

import AddNewTask from './AddNewTask.tsx';
import type { TaskType, Actions, States, TaskData, TaskId } from './type.ts';
import Task from './Task.tsx';
import { Droppable } from '@hello-pangea/dnd';
import { sortChain } from '../utils/utils.ts';

/**
 * TodoColumn component represents a single column in the Kanban board.
 * It displays tasks for a specific status (e.g., "To Do", "In Progress", "Done").
 * @param title - The title of the column (e.g., "To Do", "In Progress", "Done").
 * @param bgColor - The background color of the column.
 * @param status - The status of the tasks in this column (e.g., 0 for "To Do", 1 for "In Progress", 2 for "Done").
 * @param actions - The actions object containing methods to manipulate tasks (e.g., add, update, delete tasks).
 * @param tasks - The list of tasks to be displayed in this column.
 * @param currentProjectID - The ID of the current project to which the tasks belong.
 */
function TodoColumn({
  title,
  bgColor,
  status,
  actions,
  tasks,
  states }: {
    title: string;
    bgColor: string;
    status: string;
    actions: Actions;
    tasks: TaskData;
    states: States;
  }) {

  const tasksSorted = sortChain(tasks) as [TaskId, TaskType][];

  // This counts the number of tasks in the current column, which is used to determine the order of the new task.

  return (
    <>
      <div className='todoColumnCard' style={{ backgroundColor: bgColor }}>
        <h1 className='todoColumnTitle'>{title}</h1>

        <div className='todoColumnContent'>

          <Droppable droppableId={status.toString()} type='task'>
            {(provided) => (
              <div className='taskListContainer'
                ref={provided.innerRef}
                {...provided.droppableProps}>

                {/* Render the tasks in the task list */}
                {/* tasksSorted.map: this maps over the sorted tasks and renders a Task for each */}
                {tasksSorted.map((task) => (
                  <Task key={task[0]} task={task} tasks={tasksSorted}
                    actions={actions} states={states} />
                ))}

                {provided.placeholder}

                <AddNewTask actions={actions} status={status} tasksSorted={tasksSorted} states={states} />
              </div>
            )}
          </Droppable>
        </div>

      </div>
    </>
  )
}

export default TodoColumn
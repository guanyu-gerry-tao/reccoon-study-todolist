import { useState } from 'react'

import '../App.css'
import './TodoColumn.css';

import AddNewTask from './AddNewTask.tsx';
import type { TodoColumnProps } from './type.ts';
import TaskList from './TaskList.tsx';

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
  currentProjectID }: TodoColumnProps) {

  // This counts the number of tasks in the current column, which is used to determine the order of the new task.
  const numTasks = tasks.filter(task => task.project === currentProjectID).length;

  return (
    <>
      <div className='todoColumnCard' style={{ backgroundColor: bgColor }}>
        <h1 className='todoColumnTitle'>{title}</h1>

        <div className='todoColumnContent'>
          <TaskList status={status}
            tasks={tasks}
            actions={actions}
            currentProjectID={currentProjectID}
          />
          <AddNewTask actions={actions} status={status} newOrder={numTasks} currentProjectID={currentProjectID} />
        </div>

      </div>
    </>
  )
}

export default TodoColumn
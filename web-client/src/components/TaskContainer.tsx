import { useEffect, useState } from 'react'

import '../App.css'
import './TaskContainer.css';

import AddNewTask from './AddNewTask.tsx';
import type { Task, Actions, States, StatusId, TaskId } from '../utils/type.ts';
import TaskItem from './TaskItem.tsx';
import { sortChain } from '../utils/utils.ts';
import { useAppContext } from './AppContext.tsx';
import { motion } from 'motion/react';
import { useSortable, type AnimateLayoutChanges } from '@dnd-kit/sortable';

// Use the AppContext to access the global state and actions

/**
 * TaskContainer component represents a single column in the Kanban board.
 * It displays tasks for a specific status (e.g., "To Do", "In Progress", "Done").
 * @param title - The title of the column (e.g., "To Do", "In Progress", "Done").
 * @param bgColor - The background color of the column.
 * @param status - The status of the tasks in this column (e.g., 0 for "To Do", 1 for "In Progress", 2 for "Done").
 * @param actions - The actions object containing methods to manipulate tasks (e.g., add, update, delete tasks).
 * @param currentProjectID - The ID of the current project to which the tasks belong.
 */
function TaskContainer({ statusId, placeholder = false }: { statusId: StatusId, placeholder?: boolean }) {

  const { states } = useAppContext();
  
  const tasks = Object.fromEntries(Object.entries(states.tasks).filter(([_, task]) => task.status === statusId));
  const tasksSorted = sortChain(tasks) as [TaskId, Task][];

  const animateLayoutChanges: AnimateLayoutChanges = (_) => false; // Disable layout animations

  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
  } = useSortable({
    id: statusId,
    data: {
      type: 'container',
      children: tasksSorted.map(task => task[0]), // Pass the task IDs as children
    },
    animateLayoutChanges,
  });

  return (
    <>
      <motion.div className='todoColumnCard'
        ref={setNodeRef}
        id={statusId}
        layoutId={placeholder ? statusId : undefined}                     // 魔法属性：布局动画 ✅
        layout                                  // 魔法属性：自动检测布局变化
        style={{
          backgroundColor: states.statuses[statusId]?.color,
          borderColor: (statusId === "completed" || statusId === "deleted") ? 'black' : states.statuses[statusId].color,
        }}
        animate={{
          x: transform?.x || 0,                 // 使用 Motion 处理拖拽变换
          y: transform?.y || 0,
          // scale: isDragging ? 1.02 : 1,         // 拖拽时放大
          opacity: isDragging ? 0.9 : 1,        // 拖拽时半透明
        }}
        // transition={states.activeId ? {
        //   type: "spring",                       // 魔法属性：弹性动画
        //   stiffness: 300,
        //   damping: 30,
        //   layout: { duration: 0.3 },            // 布局动画持续时间
        // } : undefined}
        // whileHover={states.activeId ? { scale: 1.01 } : undefined}            // 魔法属性：悬停动画
        // whileDrag={states.activeId ? {
        //   scale: 1.05,
        //   rotate: 2,
        //   boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
        // } : undefined}                                      // 魔法属性：拖拽时动画
        // {...attributes}
        // {...listeners}
      >

        <h1 className='todoColumnTitle'>{states.statuses[statusId]?.title}</h1>

        <div className='todoColumnContent'>
          {/* 直接渲染任务，不再使用 hello-pangea/dnd 的 Droppable */}
          <motion.div
            className='taskListContainer'
            layout  // 自动处理任务重排序动画
          >
            {/* 渲染可拖拽的任务 - 这些与 children 保持一致 */}
            {tasksSorted.map((task) => (
              <TaskItem key={task[0]} taskId={task[0]} />
            ))}

            {/* AddNewTask 不在 children 中，所以不可拖拽，始终在最后 */}
            <AddNewTask status={statusId} />
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}

export default TaskContainer
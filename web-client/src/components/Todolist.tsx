import '../App.css';
import './Todolist.css';
import './TaskDropArea.css';

import Menubar from './Menubar.tsx'
import TodoColumn from './TaskContainer.tsx'
import AIChatPanel from './AIChatPanel.tsx'

import type { States, StatusMap, Status, TaskMap, StatusId, TaskId, BulkPayload } from '../utils/type.ts'
import { useImmer } from 'use-immer'
import TaskDropArea from './TaskDropArea.tsx'
import { sortChain } from '../utils/utils.ts';
import { useAppContext } from './AppContext.tsx';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal, unstable_batchedUpdates } from 'react-dom';

import { createBulkPayload, optimisticUIUpdate, postPayloadToServer, restoreBackup } from '../utils/utils'

import {
  closestCenter,
  pointerWithin,
  rectIntersection,
  closestCorners,
  type CollisionDetection,
  type UniqueIdentifier,
  DndContext,
  DragOverlay,
  getFirstCollision,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensors,
  useSensor,
  MeasuringStrategy,
  defaultDropAnimationSideEffects,
  type Collision,
  type Over,
  type Active,
} from '@dnd-kit/core';
import {
  type AnimateLayoutChanges,
  SortableContext,
  useSortable,
  arrayMove,
  defaultAnimateLayoutChanges,
  verticalListSortingStrategy,
  type SortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';



import { createStatesAndSetStates } from '../utils/states.ts';
import { createActions } from '../utils/actions.ts';
import { DragDropContext } from '@hello-pangea/dnd';
import { loadAllData } from '../data/loadInitData.ts'
import { AppContext } from '../components/AppContext.tsx';
import { useNavigate } from 'react-router-dom';
import { rect, title } from 'framer-motion/client';
import TaskItem from './TaskItem.tsx';
import TaskContainer from './TaskContainer.tsx';

function getItemLocationRelativeToTarget(active: Active, over: Over) {
  if (active && over && active.rect.current.translated && over.rect) {
    const activeCenter = {
      x: active.rect.current.translated.left + active.rect.current.translated.width / 2,
      y: active.rect.current.translated.top + active.rect.current.translated.height / 2,
    }
    const overCenter = {
      x: over.rect.left + over.rect.width / 2,
      y: over.rect.top + over.rect.height / 2,
    }
    return {
      deltaX: overCenter.x - activeCenter.x, 
      // if deltaX > 0, meaning active is to the left of over
      deltaY: overCenter.y - activeCenter.y,
      // if deltaY > 0, meaning active is above over
    }
  }
}

/**
 * Todolist component represents the main todo list interface.
 * It displays the task columns and handles the overall state and actions.
 * @param tasks - The list of tasks to be displayed.
 * @param projects - The list of projects to which tasks belong.
 * @param userStatus - The current user's status information.
 * @param actions - The actions object containing methods to manipulate tasks and projects.
 * @param draggedTask - The currently dragged task information.
 */
function Todolist() {


  // Initialize states and actions using custom hooks
  const [states, setStates] = createStatesAndSetStates();
  const actions = createActions(states, setStates);
  const appContextValue = { states, setStates, actions };
  const [bulkPayload, setBulkPayload] = useImmer<BulkPayload | null>(null);

  const navigate = useNavigate();

  const lastOverId = useRef<string | null>(null);
  const recentlyMovedToNewContainer = useRef(false);

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {

      let overId: string | null = null;

      // check if active is a status. if so, simply return the closest center of the status
      if (states.activeId && states.activeId in states.statuses) { // if the active item is a status
        return closestCenter({ // simply return the closest center if the active item is a status
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in states.statuses
          ),
        });
      } else if (states.activeId && states.activeId in states.tasks) {  // if the active item is a task

        // if the active is task:
        // 1. when task is overlapping 30%+ with New Status area,
        //   explicitly set the overId to "newStatus"
        // 2. when task is overlapping 30%+ with "deleted" area, or "completed" area,
        //   explicitly set the overId to "deleted" or "completed"
        // 3. when task is overlapping 30%+ with a status container,
        // 3.1 if the status is empty, 
        //   return the status Id
        // 3.2 if the status is not empty, 
        //   return the closest center of a task in the status
        // 4. if the task is not overlapping 30%+ with any droppable area,
        //   return null to cancel the drop

        // Summary of the return:
        // overId === "newStatus": the task is dropped in the New Status area => create a new status
        // overId === "deleted": the task is dropped in the Trash area => mark the task as deleted
        // overId === "completed": the task is dropped in the Completed area => mark the task as completed
        // overId is included in states.statuses: the task is dropped in a empty status => move the task to the status, and index = 0
        // overId is included in states.tasks: the task is dropped in a non-empty status, move the task to the task.status, and index = OfIndex(task.status)
        // overId is null: the task is not dropped in any droppable area => cancel the drop




        // find all intersecting droppables
        const collisions: Collision[] = rectIntersection({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in states.statuses || container.id === 'deleted' || container.id === 'completed' || container.id === 'newStatus'
          ),
        });

        const activeRect = args.active.rect.current?.translated;
        if (!activeRect) {
          console.warn("No active rectangle found for the active draggable item.");
          return []; // If no active rectangle, cancel the drop, return null
        } else {


          // find the most intersecting droppable
          if (collisions.length > 0) {
            // const overlappingRatios = collisions.map((collision) => {
            //   const droppableRect = args.droppableRects.get(collision.id);
            //   return {
            //     id: collision.id,
            //     ratio: getIntersectionRatio(
            //       activeRect,
            //       droppableRect as DOMRect
            //     ),
            //   }
            // });

            const closestContainerId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) => container.id in states.statuses || container.id === 'deleted' || container.id === 'completed' || container.id === 'newStatus'
              ),
            })[0].id as string;

            // check if the most intersecting droppable has a ratio > 0.3
            // if so, check if the droppable is a status, or "deleted", or "completed", or "newStatus"
            // otherwise, set the overId to null

            if (closestContainerId) {
              if (closestContainerId === 'newStatus') {
                overId = closestContainerId as string; // set the overId to "newStatus"
                // console.log("Task is dropped in the New Status area.");
              } else { // if the most intersecting droppable is a status, check if it is empty or not
                const statusId = closestContainerId as StatusId;
                const status = states.statuses[statusId];
                if (status) {
                  const tasksInStatus = Object.keys(states.tasks).filter(
                    (taskId) => states.tasks[taskId].status === statusId
                  );
                  // console.log("Tasks in status:", tasksInStatus);
                  if (tasksInStatus.length === 0) {
                    overId = statusId; // set the overId to the status id
                    // console.log("Task is dropped in an empty status area.", tasksInStatus.length);
                    // console.log("Status ID:", statusId);
                  } else {
                    // if the status is not empty, find the closest center of a task in the status
                    overId = closestCenter({
                      ...args,
                      droppableContainers: args.droppableContainers.filter(
                        (container) => tasksInStatus.includes(container.id as string)
                      ),
                    })[0]?.id as string;
                    // console.log("Task is dropped in a non-empty status area.", tasksInStatus.length);
                    // console.log("Status ID:", statusId);
                  }
                }
              }
            } else { // if the most intersecting droppable has a ratio < 0.3, meaning the task is dropped outside of any droppable area, return null
              return [];
            }
          }
        }

        lastOverId.current = overId;

        if (recentlyMovedToNewContainer.current) {
          lastOverId.current = states.activeId;
        }

        return [{ id: overId }] as Collision[]; // Return the overId as the only collision
      }
      return []; // If no states.activeId or states.activeId is not a task or status, return empty array
    }, [states.activeId, states.statuses]);



  const [clonedTasks, setClonedTasks] = useState<TaskMap | null>(null);
  const [clonedStatuses, setClonedStatuses] = useState<StatusMap | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
  );


  // Handle the cancel drop action
  const onDragCancel = () => {
    if (bulkPayload) {
      restoreBackup(setStates, bulkPayload); // Restore the previous state from the backup
    } else {
      console.warn("No bulk payload found to restore.");
    }
    // Reset the states.activeId and cloned states
    setStates.setActiveId(null);
    setBulkPayload(null);
  }

  // Reset the recently moved flag after a drag operation
  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [states.tasks, states.statuses]);


  // Load initial data after the DOM has been rendered
  useEffect(() => {
    loadAllData(navigate).then((d) => {
      console.log("tasks loaded raw", d);
      setStates.setTasks(draft => {
        Object.assign(draft, d.taskData);
        if (Object.keys(d.taskData).length === 0) {
          console.warn("No tasks found in the initial data. Please add some tasks to get started.");
        } else {
          console.log("Tasks loaded successfully.", d.taskData);
        }
      });
      setStates.setProjects(draft => {
        Object.assign(draft, d.projectData);
        if (Object.keys(d.projectData).length === 0) {
          console.warn("No projects found in the initial data. Please add some projects to get started.");
        } else {
          console.log("Projects loaded successfully.", d.projectData);
        }
      });
      setStates.setStatuses(draft => {
        Object.assign(draft, d.statusData);
        if (Object.keys(d.statusData).length === 0) {
          console.warn("No statuses found in the initial data. Please add some statuses to get started.");
        } else {
          console.log("Statuses loaded successfully.", d.statusData);
        }
      });
      setStates.setUserProfile(draft => {
        if (!d.userProfileData.id) {
          console.warn("No user profile data found. Please set up your profile.");
          return;
        } else {
          draft.id = d.userProfileData.id; // Set a default user ID for testing
          draft.nickname = d.userProfileData.nickname; // Set a default nickname for testing
          draft.focusProject = d.userProfileData.focusProject; // Set a default last project ID for testing
          draft.focusConversation = d.userProfileData.focusConversation; // Set a default last conversation ID for testing
          draft.avatarUrl = d.userProfileData.avatarUrl; // Set a default avatar URL for testing
          draft.language = d.userProfileData.language; // Set a default language for testing
          console.log("User profile loaded successfully.");
        }
      });
    }).catch((error) => {
      console.error('Error loading initial data:', error);
      // Optionally, you can load test data here if the initial data loading fails
      // loadTestTasks().then(tasks => setStates.setTasks(tasks));
      // loadTestProjects().then(projects => setStates.setProjects(projects));
      // loadTestStatuses().then(statuses => setStates.setStatuses(statuses));
    });
  }, []);

  // function renderSortableItemDragOverlay(id: UniqueIdentifier) {
  //   return (
  //     <TaskItem
  //       task={[id as string, states.tasks[id]]}
  //     />
  //     // <Item
  //     //   value={id}
  //     //   handle={handle}
  //     //   style={getItemStyles({
  //     //     containerId: findContainer(id) as UniqueIdentifier,
  //     //     overIndex: -1,
  //     //     index: getIndex(id),
  //     //     value: id,
  //     //     isSorting: true,
  //     //     isDragging: true,
  //     //     isDragOverlay: true,
  //     //   })}
  //     //   color={getColor(id)}
  //     //   wrapperStyle={wrapperStyle({ index: 0 })}
  //     //   renderItem={renderItem}
  //     //   dragOverlay
  //     // />
  //   );
  // }

  // function renderContainerDragOverlay(containerId: UniqueIdentifier) {
  //   return (
  //     <TaskContainer
  //       statusId={containerId as StatusId}
  //     />
  //     // <Container
  //     //   label={`Column ${containerId}`}
  //     //   columns={columns}
  //     //   style={{
  //     //     height: '100%',
  //     //   }}
  //     //   shadow
  //     //   unstyled={false}
  //     // >
  //     //   {items[containerId].map((item, index) => (
  //     //     <Item
  //     //       key={item}
  //     //       value={item}
  //     //       handle={handle}
  //     //       style={getItemStyles({
  //     //         containerId,
  //     //         overIndex: -1,
  //     //         index: getIndex(item),
  //     //         value: item,
  //     //         isDragging: false,
  //     //         isSorting: false,
  //     //         isDragOverlay: false,
  //     //       })}
  //     //       color={getColor(item)}
  //     //       wrapperStyle={wrapperStyle({ index })}
  //     //       renderItem={renderItem}
  //     //     />
  //     //   ))}
  //     // </Container>
  //   );
  // }



  return (
    <AppContext.Provider value={appContextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}

        onDragStart={({ active }) => { // Handle the start of a drag operation
          setStates.setActiveId(active.id as string);
          setBulkPayload(createBulkPayload(states)); // reset the payload for the new drag operation
        }}

        // onDragMove={({ active, over }) => {
        // }}


        onDragOver={({ active, over }) => { // Handle the end of a drag operation
          // Create a bulk payload for the drag operation

          restoreBackup(setStates, bulkPayload as BulkPayload); // Restore the previous state from the backup

          if (over) {
            const { deltaX, deltaY } = getItemLocationRelativeToTarget(active, over) || { deltaX: 0, deltaY: 0 };
            // If the dragged item is a status, move it to the new position
            if (active.id in states.statuses) {
              console.log("Dragged item is a status:", active.id);
              const sortedStatuses = sortChain(states.statuses);
              const activeIndex = sortedStatuses.findIndex(([id]) => id === active.id);
              const overIndex = sortedStatuses.findIndex(([id]) => id === over.id);
              if (deltaX > 0) { // if deltaX > 0, meaning the active is to the left of over
                actions.moveItem('status', active.id as string, states.statuses, null, over.id as string, bulkPayload as BulkPayload);
              } else { // if deltaX < 0, meaning the active is to the right of over
                actions.moveItem('status', active.id as string, states.statuses, over.id as string, null, bulkPayload as BulkPayload);
              }
              console.log(`Moved status ${active.id} from index ${activeIndex} to ${overIndex}`);
              return;
            }
            // if the dragged item is a task
            else if (active.id in states.tasks) {
              // check the dropped type by check the over.id. See detectionStrategy for details
              const overId = over.id as string;
              if (overId === 'newStatus') { // If the task is dropped in the New Status area, create a new status
                const newStatus = {
                  title: "New Status",
                  description: "",
                  color: "#f0f0f0",
                  prev: null,
                  next: null,
                  userId: states.userProfile.id, // Use a default user ID if not set
                };
                const newStatusId = actions.addItem('status', newStatus, states.statuses, bulkPayload as BulkPayload); // Create a new status
                actions.moveTask(active.id as TaskId, newStatusId, null, 'end', bulkPayload as BulkPayload); // Move the task to the new status
              } else {
                if (overId === 'deletedZone') { // If the task is dropped in the Trash area, mark the task as deleted
                  actions.moveTask(active.id as TaskId, 'deleted', null, 'end', bulkPayload as BulkPayload);
                } else if (overId === 'completedZone') { // If the task is dropped in the Completed area, mark the task as completed
                  actions.moveTask(active.id as TaskId, 'completed', null, 'end', bulkPayload as BulkPayload);
                } else if (overId in states.statuses) { // If the task is dropped in a status, meaning the status is empty. See detectionStrategy for details
                  const targetStatusId = overId as StatusId;
                  actions.moveTask(active.id as TaskId, targetStatusId, null, 'end', bulkPayload as BulkPayload);
                } else if (overId in states.tasks) { // If the task is dropped in a non-empty status, move the task to the task.status, and index = OfIndex(task.status). See detectionStrategy for details
                  const targetTaskId = overId as TaskId;
                  const targetTask = states.tasks[targetTaskId];
                  const tasksInStatus = Object.keys(states.tasks).filter(
                    (taskId) => states.tasks[taskId].status === targetTask.status && taskId !== active.id
                  );
                  if (targetTask) {
                    if (deltaY > 0) { // if deltaY > 0, meaning the active is above over
                      actions.moveTask(active.id as TaskId, targetTask.status, null, over.id as TaskId, bulkPayload as BulkPayload); // move the task to the start of the status
                    } else {
                      actions.moveTask(active.id as TaskId, targetTask.status, over.id as TaskId, null, bulkPayload as BulkPayload); // move the task to the end of the status
                    }
                    // console.log(`Moved task ${active.id} to status ${targetTask.status} at index ${tasksInStatus.indexOf(targetTaskId)}`);
                  }
                }
              }
            }
          }

          optimisticUIUpdate(setStates, bulkPayload as BulkPayload); // Optimistically update the UI with the new task title

        }}

        onDragEnd={({ over }) => { // Handle the end of a drag operation
          if (over) {
            if (bulkPayload !== null) {
              try {
                postPayloadToServer('/api/bulk', navigate, bulkPayload); // Send the update to the server
              } catch (error) {
                console.error('Error updating task title:', error);
                // If the request fails, restore the previous state from the backup
                restoreBackup(setStates, bulkPayload);
              } finally {
                setBulkPayload(null); // Reset the bulk payload
                setStates.setActiveId(null); // Reset the active ID after the drag ends
              }
            }
          }
        }}

        onDragCancel={onDragCancel} // Handle the cancel drop action
        modifiers={[restrictToWindowEdges]}
      >
        {/* <DragDropContext
        onDragEnd={actions.onDragEnd} onDragStart={actions.onDragStart} onDragUpdate={actions.onDragUpdate}> */}
        <div className='todolistContainer'>
          {/* The top menu bar */}
          {/* Contains logos, project, user information */}
          <Menubar />
          <div className='todolistColumns'>

            <TodoColumn key="deleted"
              statusId="deleted"
            />

            <TodoColumn key="completed"
              statusId="completed"
            />

            {Object.keys(states.statuses).filter(statusId => states.statuses[statusId].projectId === states.userProfile.focusProject).map(statusId => (
              <TodoColumn key={statusId}
                statusId={statusId}
              />
            ))}
          </div>

          {/* The right panel for AI chat */}
          {/* This panel is used to interact with the AI chat feature, which can help users with task management and organization. */}
          {/* //TODO: implement the AI chat feature in future */}
          {/* <AIChatPanel onClose={() => {}} /> */}

        </div>
        {createPortal(
          <DragOverlay>
            {states.activeId
              ? Object.keys(states.statuses).includes(states.activeId)
                ? <TaskContainer statusId={states.activeId} placeholder={true} />
                : <TaskItem taskId={states.activeId} placeholder={true} />
              : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </AppContext.Provider >
  )
}

export default Todolist
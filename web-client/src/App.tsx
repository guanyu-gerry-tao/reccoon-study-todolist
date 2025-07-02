import { useState, useRef } from 'react';
import { useImmer } from 'use-immer';
import './App.css';

import Todolist from './components/Todolist.tsx';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DragDropContextProps } from '@hello-pangea/dnd';
import type { TaskItem, NewTaskItem, Actions, Projects, ProjectItem, NewProjectItem } from './components/type.ts';
import { loadInitData, loadProjects, loadTestUserData } from './data/loadInitData.ts'


function App() {

  const testInitData = loadInitData();
  const testProjectsData = loadProjects();
  const testUserData = loadTestUserData();

  const [tasks, setTasks] = useImmer<TaskItem[]>(testInitData);
  const [projects, setProjects] = useImmer<ProjectItem[]>(testProjectsData);
  const [userStatus, setUserStatus] = useImmer(testUserData);
  const [draggedTask, setDraggedTask] = useImmer<[string] | null>(null);


  const addTask = (newTask: NewTaskItem) => {
    setTasks(draft => {
      const id = crypto.randomUUID();
      draft.push({ ...newTask, id });
      console.log(`Task added with id: ${id}`);

      const filtered = draft.filter(t => t.status === newTask.status && t.project === newTask.project).sort((a, b) => a.order - b.order);
      filtered.forEach((task, index) => {
        task.order = index;
      })
    });
  };

  const updateTask = (id: string, updatedFields: Partial<TaskItem>) => {
    setTasks(draft => {
      const task = draft.find(task => task.id === id);
      if (task) {
        Object.assign(task, updatedFields);
      } else {
        console.warn(`Task with id ${id} not found.`);
      }
      const filtered = draft.filter(t => t.status === task?.status && t.project === task.project).sort((a, b) => a.order - b.order);
      filtered.forEach((task, index) => {
        task.order = index;
      })
    });
  };

  const deleteTask = (id: string) => {
    setTasks(draft => {
      const index = draft.findIndex(task => task.id === id);
      const deletedTask = draft[index];
      if (index !== -1) {
        draft[index].status = -1; // Mark as deleted
      }
      // reorder tasks in the previous status, the deleted task was in
      const filtered = draft.filter(t => t.status === deletedTask.previousStatus).sort((a, b) => a.order - b.order);
      filtered.forEach((task, index) => {
        task.order = index;
      })
    })
  };

  const hardDeleteTask = (id: string) => {
    setTasks(draft => {
      const index = draft.findIndex(task => task.id === id);
      if (index !== -1) {
        draft.splice(index, 1);
      }
    })
  };


  const refreskTasks = () => {
    // This function can be used to refresh the tasks from the server or local storage
  };

  const addProject = (newProject: NewProjectItem) => {
    setProjects(draft => {
      const id = crypto.randomUUID();
      draft.push({ ...newProject, id });
      console.log(`Task added with id: ${id}`);

      draft.forEach((project, index) => {
        project.order = index;
      })
    });
  };

  const updateProject = (id: string, updatedFields: Partial<ProjectItem>) => {
    setProjects(draft => {
      const project = draft.find(project => project.id === id);
      if (project) {
        Object.assign(project, updatedFields);
      } else {
        console.warn(`Task with id ${id} not found.`);
      }
      draft.forEach((project, index) => {
        project.order = index;
      })
    });
  };

  const deleteProject = (id: string) => {
    setProjects(draft => {
      const index = draft.findIndex(project => project.id === id);
      draft.splice(index, 1)
      draft.forEach((project, index) => {
        project.order = index;
      })
    })
    
    setTasks(draft => {
      draft.forEach(task => {
        if (task.project === id) {
          hardDeleteTask(task.id);
        }
      })
    })
    
    console.log(projects);
  };

  const actions: Actions = {
    addTask: addTask,
    updateTask: updateTask,
    deleteTask: deleteTask,
    hardDeleteTask: hardDeleteTask,
    refreshTasks: refreskTasks,
    addProject: addProject,
    updateProject: updateProject,
    deleteProject: deleteProject,
  };

  const onDragEnd: DragDropContextProps['onDragEnd'] = (result) => {
    if (result.type === 'task') {
      console.log('onDragEnd', result);
      if (result.destination) {
        setTasks(draft => {
          const task = draft.find(t => t.id === result.draggableId);

          if (task && result.destination) {
            const previousStatus = task.status;
            const previousOrder = task.order;
            const resultStatus = Number(result.destination.droppableId);
            const resultIndex = result.destination.index;


            // If the task is moving within the same status
            if (resultStatus === previousStatus && resultIndex !== previousOrder) {
              if (resultIndex > previousOrder) { // If moving down (3 to 5 ex.), move 4, 5 to 3, 4
                draft.filter(t => t.status === resultStatus &&
                  t.order > previousOrder &&
                  t.order <= resultIndex)
                  .forEach(t => {
                    t.order -= 1
                  })
              } else { // If moving up (5 to 3 ex.), move 3, 4 to 4, 5
                draft.filter(t => t.status === resultStatus &&
                  t.order >= resultIndex &&
                  t.order < previousOrder)
                  .forEach(t => {
                    t.order += 1
                  })
              }
            }

            // If the task is moving to a different status
            if (resultStatus !== previousStatus) {
              draft.filter(t => t.status === previousStatus &&
                t.order > previousOrder)
                .forEach(t => {
                  t.order -= 1; // Decrease order of tasks in the previous status
                });
              draft.filter(t => t.status === resultStatus &&
                t.order >= resultIndex)
                .forEach(t => {
                  t.order += 1; // Increase order of tasks in the new status
                });
            }

            // Update the task's order and status
            task.order = resultIndex;
            task.status = resultStatus;

            console.log('previousStatus:', previousStatus);
            console.log('resultStatus:', resultStatus);
            console.log('previousOrder:', previousOrder);
            console.log('resultIndex:', resultIndex);
          }
        });
      } else {
        // If the task was dropped outside of a droppable area, handle it here
      }
      setDraggedTask(null);

      console.log('onDragEnd completed');
    }

    if (result.type === 'project') {
      console.log('onDragEnd for project', result);
      // Handle project drag and drop logic here
      // For example, you might want to update the order of projects or their properties
      if (result.destination) {
        setProjects(draft => {
          const project = draft.find(p => p.id === result.draggableId);
          const resultIndex = result.destination!.index;
          if (project) {
            if (result.destination!.index > result.source.index) { // Moving down  3=>5   4,5=>3,4
              draft.filter((p, index) => p.order > result.source.index && p.order <= result.destination!.index)
                .forEach((p, index) => {
                  p.order -= 1; // Decrease order of projects in the range
                });
              console.log('Moving project down');
            } else if (result.destination!.index < result.source.index) { // Moving up   5=>3   3,4=>4,5
              draft.filter((p, index) => p.order >= result.destination!.index && p.order < result.source.index)
                .forEach((p, index) => {
                  p.order += 1; // Increase order of projects in the range
                });
              console.log('Moving project up');
            } else {
              // Handle the case where the project is not moving
            }
            project!.order = resultIndex; // Update the order of the project
          }
        })
      }
    }
  };



  const onDragStart: DragDropContextProps['onDragStart'] = (start) => {
    if (start.type === 'task') {
      setDraggedTask([start.draggableId]);
    }
    if (start.type === 'project') {

    }
  }




  const prevDroppableId = useRef<string | null>(null);

  const onDragUpdate: DragDropContextProps['onDragUpdate'] = (update) => {
    const current = update.destination?.droppableId || null;

    if (current !== prevDroppableId.current) {
      if (prevDroppableId.current === '-1') { // exit delete-zone
        document.querySelectorAll(`#${update.draggableId}`).forEach(el => {
          // Remove the class indicating the draggable is over the delete area
        });
      }

      if (current === '-1') { // enter delete-zone
        document.querySelectorAll(`#${update.draggableId}`).forEach(el => {
          // Add a class to indicate the draggable is over the delete area
        });
      }

      if (prevDroppableId.current !== null && current === null) { // exit all Droppable
        // places to handle when the draggable is not over any droppable area
      }
      prevDroppableId.current = current;
    }
  }



  return (
    <DragDropContext
      onDragEnd={onDragEnd} onDragStart={onDragStart} onDragUpdate={onDragUpdate}>
      <Todolist tasks={tasks} projects={projects} userStatus={userStatus} actions={actions} draggedTask={draggedTask}
      />
    </DragDropContext>
  )
}

export default App
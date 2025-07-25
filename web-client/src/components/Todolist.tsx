import '../App.css';
import './Todolist.css';
import './TaskDropArea.css';

import Menubar from './Menubar.tsx'
import TodoColumn from './TodoColumn.tsx'
import AIChatPanel from './AIChatPanel.tsx'

import type { Actions, States, StatusData, StatusType } from '../utils/type.ts'
import { useImmer } from 'use-immer'
import TaskDropArea from './TaskDropArea.tsx'
import { sortChain } from '../utils/utils.ts';
import { useAppContext } from './AppContext.tsx';
import { useState, useRef, useEffect } from 'react';



import { createStatesAndSetStates } from '../utils/states.ts';
import { createActions } from '../utils/actions.ts';
import { DragDropContext } from '@hello-pangea/dnd';
import { loadAllData } from '../data/loadInitData.ts'
import { AppContext } from '../components/AppContext.tsx';
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();

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
          draft.lastProjectId = d.userProfileData.lastProjectId; // Set a default last project ID for testing
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

  const statusesSorted = sortChain(states.statuses);

  return (
    <AppContext.Provider value={appContextValue}>
      <DragDropContext
        onDragEnd={actions.onDragEnd} onDragStart={actions.onDragStart} onDragUpdate={actions.onDragUpdate}>
        <div className='todolistContainer'>
          {/* The top menu bar */}
          {/* Contains logos, project, user information */}
          <Menubar />

          {/* The task columns */}
          <div className='todolistColumns'>

            <TodoColumn key="deleted" title="Deleted"
              bgColor="#ffcce6"
              status="deleted"
            />

            <TodoColumn key="completed" title="Completed"
              bgColor="#e6f2ff"
              status="completed"
            />

            {statusesSorted.map(([key, status]) => (
              <TodoColumn key={key} title={status.title}
                bgColor={status.color}
                status={status.id}
              />
            ))}
          </div>

          {/* The right panel for AI chat */}
          {/* This panel is used to interact with the AI chat feature, which can help users with task management and organization. */}
          {/* //TODO: implement the AI chat feature in future */}
          {/* <div className='todolistRightPanel'>
          <AIChatPanel />
        </div> */}

        </div>
      </DragDropContext>
    </AppContext.Provider >
  )
}

export default Todolist
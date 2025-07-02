import '../App.css'

import Menubar from './Menubar.tsx'
import TodoColumn from './TodoColumn.tsx'
import AIChatPanel from './AIChatPanel.tsx'

import type { TaskItem , Actions, Projects, UserStatus, ProjectItem } from './type.ts'
import { useImmer } from 'use-immer'
import TaskDropArea from './TaskDropArea.tsx'


function Todolist({tasks, projects, userStatus, actions, draggedTask}: 
  {tasks: TaskItem[], projects: ProjectItem[], userStatus: UserStatus, actions: Actions, draggedTask: [string] | null } ) {

  const [currentProjectID, setCurrentProjectID] = useImmer<string>(userStatus.project);
  const [isDeletedTaskClicked, setIsDeletedTaskClicked] = useImmer<boolean>(false);
  const [isCompletedTaskClicked, setIsCompletedTaskClicked] = useImmer<boolean>(false);


  return (
    <>
      <div className='relative flex flex-row h-screen w-screen overflow-hidden'>
          <Menubar actions={actions} draggedTask={draggedTask} projects={projects} currentProjectID={currentProjectID} setCurrentProjectID={setCurrentProjectID} />


        <div className='relative flex flex-row max-w-245 flex-grow overflow-y-auto overflow-x-auto items-start'>

          <TodoColumn title={"Now"} 
          bgColor='#e8fdec' 
          status={1} 
          actions={actions} 
          tasks={tasks.filter(task => task.status === 1 && task.project === currentProjectID)} 
          currentProjectID={currentProjectID}
          />
          
          <TodoColumn title={"Next"} 
          bgColor='#f0f1fd' 
          status={2} 
          actions={actions} 
          tasks={tasks.filter(task => task.status === 2 && task.project === currentProjectID)} 
          currentProjectID={currentProjectID}
          />
          
          <TodoColumn title={"Later"} 
          bgColor='#fff8e8' 
          status={3} 
          actions={actions} 
          tasks={tasks.filter(task => task.status === 3 && task.project === currentProjectID)} 
          currentProjectID={currentProjectID}
          />
          </div>
      
      <div className='relative right-0 top-0 flex flex-col w-100 min-w-100 h-screen bg-gray-200 border-l border-gray-300 flex-grow'>
        <AIChatPanel />
      </div>

      </div>

      

    </>
  )
}

export default Todolist
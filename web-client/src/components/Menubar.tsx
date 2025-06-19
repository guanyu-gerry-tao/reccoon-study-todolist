import { useState } from 'react'
import '../App.css'

import Project from './Project.tsx'

function Menubar() {

  return (
    <>
      <div className='relative w-80 rounded-2xl m-2 p-2 h-[calc(100vh-4rem)] flex flex-col bg-[#f5f5f5]'>
        <div>
          <p className='relative inline-block m-2 font-extrabold text-2xl text-gray-800'>Reccoon Study</p>
        </div>
        <div className='relative search-bar todo h-10 flex-shrink-0'>
          {/* Search bar tbd */}
        </div>
        <div className='relative flex flex-col flex-grow overflow-hidden'>
          <p className='relative inline-block m-2'>Projects</p>
          <Project />
          <Project />
          <Project />
        </div>
        <div className='relative m-2 p-2 rounded-2xl bottom-0 flex flex-col'>
          <p className='relative inline-block m-2'>Settings</p>
          <p className='relative inline-block m-2'>Help</p>
        </div>
      </div>
    </>
  )
}

export default Menubar
import { useState } from 'react'
import '../App.css'

import Project from './Project.tsx'

function Menubar() {

  return (
    <>
      <div className='relative bg-gray-200 m-2 p-2 rounded-3xl [height:calc(100vh-1rem)]'>
        <div className='relative bg-amber-300 w-100 rounded-2xl p-2 [height:calc(100vh-2rem)]'>
          <div>
            <p className='relative inline-block m-2 font-extrabold text-2xl text-gray-800'>Menu</p>
          </div>
          <div className='search-bar todo h-10'>
            {/* Search bar tbd */}
          </div>
          <div>
            <p className='relative inline-block m-2'>tasks</p>
            <Project />
          </div>
        </div>
      </div>
    </>
  )
}

export default Menubar
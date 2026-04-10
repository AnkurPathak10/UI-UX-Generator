import { ProjectType } from '@/data/types';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

type Props = {
    project: ProjectType;
}

function ProjectCard({project}: Props) {
  return (
    <Link href={`/project/${project.projectId}`}>
      <div className=' rounded-2xl p-4 cursor-pointer'>
        {project.screensShot ? (
          <Image
            className='rounded-xl object-cover h-[200px] w-full'
            src={project.screensShot}
            alt={project.projectName ?? 'Project screenshot'}
            width={600}
            height={400}
            unoptimized
          />
        ) : (
          <div className='rounded-xl h-[200px] w-full bg-gray-800 flex items-center justify-center text-gray-400 text-sm'>
            No preview available
          </div>
        )}
        <div className='p-2'>
          <h2>{project.projectName}</h2>
          <p className='text-sm text-gray-500'>{project.createdOn}</p>
        </div>
      </div>
    </Link>
  )
}

export default ProjectCard
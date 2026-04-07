import { ProjectType } from '@/data/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import ProjectCard from './ProjectCard';
import { Skeleton } from '@/components/ui/skeleton';

function ProjectList() {
    const [projectList, setProjectList] = useState<ProjectType[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getProjectList();
    }, []);

    const getProjectList = async () => {
        setLoading(true);
        const result = await axios.get('/api/project');
        console.log(result.data);
        setProjectList(result.data);
        setLoading(false);
    }
  return (
    <div className='px-10 md:px-24 lg:px-44 xl:px-56'>
        <h2 className='font-semibold text-2xl mb-5'>My Projects</h2>
        {!loading && projectList.length === 0 && <div className='p-6 border border-dashed rounded-2xl flex items-center justify-center'>
            <h2 className='text-center'>No Project Available</h2>
        </div>}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5'>
            {loading ? 
                [1,2,3,4,5].map((item) => (
                    <div key={item}>
                       <Skeleton className='w-full h-[200px] rounded-2xl'/> 
                       <Skeleton className='mt-3 w-full h-6'/> 
                       <Skeleton className='mt-3 w-20 h-3'/> 
                    </div>
                ))
                :
                projectList.map((project, index) => (
                    <ProjectCard key={index} project={project}/>
                ))
            }
        </div>
    </div>
  )
}

export default ProjectList
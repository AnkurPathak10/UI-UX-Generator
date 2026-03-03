"use client"
import axios from 'axios';
import ProjectHeader from './_shared/ProjectHeader';
import SettingsSection from './_shared/SettingsSection';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ProjectType, ScreenConfig } from '@/data/types';
import { Loader2Icon } from 'lucide-react';

const ProjectCanvasPlayground = () => {
  const {projectId} = useParams();
  const [projectDetail, setProjectDetail] = useState<ProjectType>();
  const [screenConfig, setScreenConfig] = useState<ScreenConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...')

  useEffect(() => {
    projectId && GetProjectDetail();
  }, [projectId]);

  const GetProjectDetail = async () => {
    setLoading(true);
    setLoadingMsg('Loading...');
    const result = await axios.get('/api/project?projectId=' + projectId);

    setProjectDetail(result?.data?.projectDetail);
    setScreenConfig(result?.data?.screenConfig);

    //if(result?.data?.screenConfig?.length === 0){
    //  generateScreenConfig();
    //}
    setLoading(false);
  }

  const isGenerating = useRef(false); // ✅ tracks if generation is in progress

useEffect(() => {
    if (!projectDetail) return;
    if (isGenerating.current) return; // ✅ prevent re-entry during generation

    if (screenConfig?.length === 0) {
      isGenerating.current = true;
      generateScreenConfig().finally(() => { isGenerating.current = false; });
    } else if (screenConfig.some(s => !s.code)) { // ✅ only run if screens need generation
      isGenerating.current = true;
      GenerateScreenUIUX(screenConfig).finally(() => { isGenerating.current = false; });
    }
}, [projectDetail, screenConfig]);


  // Auto-generate screen configuration if project has no screens yet
  const generateScreenConfig = async () => {
    console.log("generateScreenConfig called");
    try {
      setLoading(true);
      setLoadingMsg('Generating Screen Config...');
  
      const result = await axios.post('/api/generate-config', {
        projectId,
        deviceType: projectDetail?.device,
        userInput: projectDetail?.userInput,
      });
  
      console.log("Generate Config Response:", result.data);
  
      await GetProjectDetail();
    } catch (error: any) {
      console.error("Generate Config Error:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const GenerateScreenUIUX = async (screens: ScreenConfig[]) => {
    console.log("GenerateScreenUIUX called with", screens);
    setLoading(true);

    for (let index = 0; index < screens.length; index++) {
      const screen = screens[index];

      if (!screen?.screenId || screen?.code) continue; // ✅ guard against empty screens

      setLoadingMsg(`Generating Screen ${index + 1}`);

      try {
        const result = await axios.post('/api/generate-screen-ui', {
          projectId,
          screenId: screen.screenId,
          screenName: screen.screenName,
          purpose: screen.purpose,
          screenDescription: screen.screenDescription,
        });
        console.log("Screen result:", result.data);
        setScreenConfig(prev => prev.map((item, i) => (i === index ? result.data : item)));
      } catch (err) {
        console.error(`Error generating screen ${index + 1}:`, err);
      }
    }

    setLoading(false);
  }

  return (
    <div>
        <ProjectHeader/>

        <div>
            {loading && <div className='p-3 rounded-xl absolute left-1/2 top-20 bg-blue-300/20 border border-blue-400'>
              <h2 className='flex gap-2 items-center'> 
                <Loader2Icon className='animate-spin'/> {loadingMsg}
              </h2>
            </div>}

            {/* Settings */}
            <SettingsSection projectDetail = {projectDetail}/>

            {/* Canvas */}
        </div>
    </div>
  )
}

export default ProjectCanvasPlayground;
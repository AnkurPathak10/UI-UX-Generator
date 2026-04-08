"use client"
import axios from 'axios';
import ProjectHeader from './_shared/ProjectHeader';
import SettingsSection from './_shared/SettingsSection';
import { useParams } from 'next/navigation';
import { useContext, useEffect, useRef, useState } from 'react';
import { ProjectType, ScreenConfig } from '@/data/types';
import { Loader2Icon } from 'lucide-react';
import Canvas from '../../_shared/Canvas';
import { SettingContext } from '@/context/SettingContext';
import { RefreshDataContext } from '@/context/RefreshDataContext';
import { toast } from 'sonner';

const ProjectCanvasPlayground = () => {
  const {projectId} = useParams();
  const [projectDetail, setProjectDetail] = useState<ProjectType>();
  const [screenConfig, setScreenConfig] = useState<ScreenConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [screenConfigOriginal, setScreenConfigOriginal] = useState<ScreenConfig[]>([]);
  const {settingDetails, setSettingDetails} = useContext(SettingContext);
  const {refreshData, setRefreshData} = useContext(RefreshDataContext);
  const [takeScreenshot, setTakeScreenshot] = useState<any>();

  useEffect(() => {
    projectId && GetProjectDetail();
  }, [projectId]);

  useEffect(() => {
    if(refreshData?.method === 'screenConfig'){
      GetProjectDetail();
    }
  }, [refreshData]);
  const GetProjectDetail = async () => {
    try {
      setLoading(true);
      setLoadingMsg('Loading...');
      const result = await axios.get('/api/project?projectId=' + projectId);

      setProjectDetail(result?.data?.projectDetail);
      setScreenConfigOriginal(result?.data?.screenConfig ?? []);
      setScreenConfig(result?.data?.screenConfig ?? []);
      setSettingDetails(result?.data?.projectDetail);
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  const isGenerating = useRef(false); // ✅ tracks if generation is in progress

useEffect(() => {
    if (!projectDetail) return;
    if (isGenerating.current) return; // ✅ prevent re-entry during generation

    if (screenConfigOriginal?.length === 0) {
      isGenerating.current = true;
      generateScreenConfig();
    } else if (screenConfigOriginal.some(s => !s.code)) { // ✅ only run if screens need generation
      isGenerating.current = true;
      GenerateScreenUIUX(screenConfigOriginal).finally(() => { isGenerating.current = false; });
    }
    console.log("screenConfigOriginal state:", screenConfigOriginal);
}, [projectDetail, screenConfigOriginal]);


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

      isGenerating.current = false;
      await GetProjectDetail();
    } catch (error: any) {
      console.error("Generate Config Error:", error.response?.data || error);
      toast.error('Failed to generate screen config. Please refresh to retry.');
    } finally {
      isGenerating.current = false;
      setLoading(false);
    }
  };

  const GenerateScreenUIUX = async (screens: ScreenConfig[]) => {
    console.log("GenerateScreenUIUX called with", screens);
    setLoading(true);

    let successCount = 0;
    let failCount = 0;

    for (let index = 0; index < screens.length; index++) {
      const screen = screens[index];

      if (!screen?.screenId || screen?.code) continue;

      setLoadingMsg(`Generating Screen ${index + 1} of ${screens.length}`);

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
        successCount++;
      } catch (err) {
        console.error(`Error generating screen ${index + 1}:`, err);
        failCount++;
        toast.error(`Failed to generate screen ${index + 1} (${screen.screenName}). You can refresh to retry.`);
      }
    }
    setLoading(false);

    if (failCount > 0 && successCount === 0) {
      toast.error('All screens failed to generate. Please refresh the page to retry.');
    } else if (failCount > 0) {
      toast.warning(`${failCount} screen(s) failed. Refresh to retry failed screens.`);
    }

    if (successCount > 0) {
      setTakeScreenshot(Date.now());
    }
  }

  return (
    <div>
        <ProjectHeader/>

        <div className='flex'>
            {loading && <div className='p-3 rounded-xl absolute left-1/2 top-20 bg-blue-300/20 border border-blue-400'>
              <h2 className='flex gap-2 items-center'> 
                <Loader2Icon className='animate-spin'/> {loadingMsg}
              </h2>
            </div>}

            {/* Settings */}
            <SettingsSection projectDetail = {projectDetail} screenDescription={screenConfig[0]?.screenDescription} takeScreenshot={()=>setTakeScreenshot(Date.now())}/>

            {/* Canvas */}
            <Canvas projectDetail={projectDetail} screenConfig={screenConfig} takeScreenshot={takeScreenshot}/>
        </div>
    </div>
  )
}

export default ProjectCanvasPlayground;
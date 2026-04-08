"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RefreshDataContext } from '@/context/RefreshDataContext'
import { SettingContext } from '@/context/SettingContext'
import { THEME_NAME_LIST, THEMES } from '@/data/themes'
import { ProjectType } from '@/data/types'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import { Camera, Loader2Icon, Share, Sparkles } from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'

type Props = {
  projectDetail: ProjectType | undefined;
  screenDescription?: string | undefined;
  takeScreenshot: any;
}

const SettingsSection = ({projectDetail, screenDescription, takeScreenshot}: Props) => {
  const [selectedTheme, setSelectedTheme] = useState('AURORA_INK');
  const [projectName ,setProjectName] = useState(projectDetail?.projectName ?? '');
  const [userNewScreenInput, setUserNewScreenInput] = useState<string>();
  const {settingDetails, setSettingDetails} = useContext(SettingContext);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const {refreshData, setRefreshData} = useContext(RefreshDataContext);

  const {has} = useAuth();
  const hasPremiumAccess = has && has({plan: 'premium'});

  useEffect(()=>{   // Sync project name from backend when projectDetail loads
    projectDetail && setProjectName(projectDetail?.projectName ?? '');
    setSelectedTheme(projectDetail?.theme as string)
  },[projectDetail])

  const onThemeSelect = (theme: string) => {
    setSelectedTheme(theme);
    setSettingDetails((prev: any) => ({
      ...prev,
      theme: theme,
    }))
  }

  const generateNewScreen = async () => {

    if(!hasPremiumAccess){
      toast.error('You need to upgrade to premium to generate new screens.');
      return;
    }

    try {
      setLoading(true);
      toast.info('Generating new screen , please wait...');
      const result = await axios.post('/api/generate-config',{
        projectId: projectDetail?.projectId,
        userInput: userNewScreenInput,
        deviceType: projectDetail?.device,
        theme: selectedTheme,
      });
      console.log(result.data);
      toast.success('Screen Generated Successfully');
      setRefreshData({method: 'screenConfig', date: Date.now()});
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
    
  }

  return (
    <div className='w-[300px] h-[90vh] p-5 border-r'>
        <h2 className='font-medium text-lg'>Settings</h2>

        <div className='mt-3'>
            <h2 className='text-sm mb-1'>Project Name</h2>
            <Input placeholder='Project Name'
              value={projectName}
              onChange={(event) => {
                setProjectName(event.target.value)
                setSettingDetails((prev: any) => ({
                  ...prev,
                  projectName: projectName,
                }))
              }}
            />
        </div>
        
        <div className='mt-5'>
            <h2 className='text-sm mb-1'>Generate New Screen</h2>
            <Textarea placeholder='Enter Prompt to generate using AI'
              onChange={(event) => setUserNewScreenInput(event.target.value)}
            />
            <Button size={'sm'} className='mt-2 w-full' onClick={()=>generateNewScreen()} disabled={loading} > {loading ? <Loader2Icon className='animate-spin'/> : <Sparkles/>} Generate with AI</Button>
        </div>

        <div className='mt-5'>
            <h2 className='text-sm mb-1'>Themes</h2>
            <div className='h-[300px] overflow-auto'>
                {THEME_NAME_LIST.map((theme, index) => (
                  <div className={`p-3 border rounded-xl mb-2
                    ${theme === selectedTheme && 'border-primary bg-primary/20'}`} key = {theme}
                    onClick={() => onThemeSelect(theme)}
                  >
                    <h2>{theme}</h2>
                    <div className='flex gap-2'>
                      <div className={'h-4 w-4 rounded-full'} 
                        style={{background: THEMES[theme].primary}}
                      />
                      <div className={'h-4 w-4 rounded-full'} 
                        style={{background: THEMES[theme].secondary}}
                      />
                      <div className={'h-4 w-4 rounded-full'} 
                        style={{background: THEMES[theme].accent}}
                      />
                      <div className={'h-4 w-4 rounded-full'} 
                        style={{background: THEMES[theme].background}}
                      />
                      <div className={'h-4 w-4 rounded-full'} 
                        style={{
                          background: `linear-gradient(
                            135deg,
                            ${THEMES[theme].background},
                            ${THEMES[theme].primary},
                            ${THEMES[theme].accent}
                        )`,
                      }}
                      />
                    </div>
                  </div>
                ))}
            </div>
        </div>

        <div className='mt-5'>
            <h2 className='text-sm mb-1'>Extras</h2>
            
            <div className='flex gap-3'>
              <Button size={'sm'} variant={'outline'} className='mt-2' onClick={()=>takeScreenshot()}><Camera/>Screenshot</Button>
              <Button size={'sm'} variant={'outline'} className='mt-2'><Share/>Share</Button>
            </div>
        </div>
    </div>
  )
}

export default SettingsSection



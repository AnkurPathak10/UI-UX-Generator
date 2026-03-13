import { Button } from '@/components/ui/button'
import { SettingContext } from '@/context/SettingContext'
import axios from 'axios'
import { Loader2, Save } from 'lucide-react'
import Image from 'next/image'
import React, { useContext, useState } from 'react'
import { toast } from 'sonner'

const ProjectHeader = () => {
  const {settingDetails, setSettingDetails} = useContext(SettingContext);
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    try {
      setLoading(true);

      const result = await axios.put('/api/project', {
        theme: settingDetails?.theme,
        projectId: settingDetails?.projectId,
        projectName: settingDetails?.projectName,
      })
      setLoading(false);

      toast.success('Settings Saved');
    } catch (error) {
        setLoading(false);
        toast.error('Internal Server Error')
    }
    
  }
  return (
    <div className='flex items-center justify-between p-3 shadow'>
        <div className='flex gap-2 items-center'>
            <Image src={'/logo.png'} alt='logo' width={40} height={40} />
            <h2 className='text-xl font-semibold'><span className='text-primary'>Sketch</span>Pilot</h2>
        </div>
        <Button
           disabled={loading}
           onClick={onSave}
        > 
          {loading ? <Loader2 className='animate-spin'/> : <Save/>} Save
        </Button>
    </div>
  )
}

export default ProjectHeader
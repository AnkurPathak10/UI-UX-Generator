"use client"
import React, { useState } from 'react'
import {TransformWrapper, TransformComponent, useControls} from "react-zoom-pan-pinch"
import ScreenFrame from './ScreenFrame'
import { ProjectType, ScreenConfig } from '@/data/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Rnd } from 'react-rnd'
import { Minus, Plus, RefreshCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
    projectDetail: ProjectType | undefined,
    screenConfig: ScreenConfig[],
    loading?: boolean,
}

function Canvas({projectDetail, screenConfig, loading}: Props) {
    const [panningEnabled, setPanningEnabled] = useState(true);

    const isMobile = projectDetail?.device == 'mobile';

    const SCREEN_WIDTH = isMobile ? 400 : 1200;
    const GAP = isMobile ? 10 : 70;
    const SCREEN_HEIGHT = 800;

    const Controls = () => {
        const { zoomIn, zoomOut, resetTransform } = useControls();
      
        return (
          <div className="tools absolute p-2 px-3 bg-white shadow flex gap-3 z-30 text-gray-500 rounded-4xl left-1/2 bottom-10">
            <Button variant={'ghost'} size={'sm'} onClick={() => zoomIn()}><Plus/></Button>
            <Button variant={'ghost'} size={'sm'} onClick={() => zoomOut()}><Minus/></Button>
            <Button variant={'ghost'} size={'sm'} onClick={() => resetTransform()}><RefreshCcw/></Button>
          </div>
        );
      };


  return (
    <div className='w-full h-screen bg-gray-100'
        style={{
            backgroundImage: "radial-gradient(rgba(0,0,0,0.15) 1px, transparent 1px)",
            backgroundSize: "20px 20px"
        }}    
    >
        
        <TransformWrapper 
            initialScale={0.7} 
            minScale={0.2}
            maxScale={3}
            initialPositionX={50} 
            initialPositionY={50}
            limitToBounds={false}
            wheel={{step : 0.01}}        //how fast you want to zoom-in/zoom-out with mouse scroller
            doubleClick={{disabled: false}}
            panning={{disabled: !panningEnabled}}
        >
            {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
            <>
                <Controls />
            <TransformComponent
                wrapperStyle={{width: '100%', height: '100%'}} 
            >
                
                {screenConfig?.map((screen, index) => (
                    screen?.code ? (
                        <ScreenFrame
                            key={index}
                            x={index * (SCREEN_WIDTH + GAP)}
                            y={0}
                            width={SCREEN_WIDTH}
                            height={SCREEN_HEIGHT}
                            setPanningEnabled={setPanningEnabled}
                            htmlCode={screen?.code}
                            projectDetail={projectDetail}
                            screen={screen}
                        />
                    ) : (
                        <Rnd
                            key={index}
                            default={{ x: index * (SCREEN_WIDTH + GAP), y: 0, width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
                            disableDragging
                            enableResizing={false}
                        >
                            <div className='bg-white flex flex-col gap-4 p-5 rounded-2xl w-full h-full'>
                                <Skeleton className='w-full rounded-lg h-10 bg-gray-200'/>
                                <Skeleton className='w-[50%] rounded-lg h-20 bg-gray-200'/>
                                <Skeleton className='w-[70%] rounded-lg h-10 bg-gray-200'/>
                                <Skeleton className='w-[30%] rounded-lg h-10 bg-gray-200'/>
                                <Skeleton className='w-full rounded-lg h-10 bg-gray-200'/>
                                <Skeleton className='w-[50%] rounded-lg h-20 bg-gray-200'/>
                                <Skeleton className='w-[70%] rounded-lg h-10 bg-gray-200'/>
                                <Skeleton className='w-[30%] rounded-lg h-10 bg-gray-200'/>
                            </div>
                        </Rnd>
                    )
                ))}
            </TransformComponent>
            </>
            )}
            
        </TransformWrapper>
    </div>
  )
}

export default Canvas
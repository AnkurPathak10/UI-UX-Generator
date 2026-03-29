import { SettingContext } from '@/context/SettingContext';
import { THEMES, themeToCssVars } from '@/data/themes';
import { ProjectType, ScreenConfig } from '@/data/types';
import { GripVertical } from 'lucide-react';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import {Rnd} from "react-rnd";
import ScreenHandler from '../project/[projectId]/_shared/ScreenHandler';
import { HtmlWrapper } from '@/data/constant';

type Props = {
    x: number,
    y: number,
    setPanningEnabled: (enabled: boolean) => void
    width: number,
    height: number,
    htmlCode: string | undefined,
    projectDetail: ProjectType | undefined,
    screen: ScreenConfig | undefined,
}
function ScreenFrame({x, y, setPanningEnabled, width, projectDetail, height, htmlCode, screen}: Props) {

    const {settingDetails, setSettingDetails} = useContext(SettingContext);
    //@ts-ignore
    const theme = THEMES[settingDetails?.theme ?? projectDetail?.theme]
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [size, setSize] = useState({width, height});

    useEffect(()=>{
        setSize({width, height});
    },[height, width])

    const currentThemeKey = (settingDetails?.theme ?? projectDetail?.theme) as string;

    // ✅ Check if it's a valid theme key, otherwise fallback
    const validThemeKeys = Object.keys(THEMES);
    const resolvedKey = validThemeKeys.includes(currentThemeKey) ? currentThemeKey : 'AURORA_INK';
    const themeObject = THEMES[resolvedKey as keyof typeof THEMES];

    const html = HtmlWrapper(theme , htmlCode as string);

    const measureIframeHeight = useCallback(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        try {
            const doc = iframe.contentDocument;
            if (!doc) return;

            const headerH = 40; // drag bar height
            const htmlEl = doc.documentElement;
            const body = doc.body;

            // ✅ choose the largest plausible height
            const contentH = Math.max(
                htmlEl?.scrollHeight ?? 0,
                body?.scrollHeight ?? 0,
                htmlEl?.offsetHeight ?? 0,
                body?.offsetHeight ?? 0
            );

            // optional min/max clamps
            const next = Math.min(Math.max(contentH + headerH, 160), 2000);

            setSize((s) => (Math.abs(s.height - next) > 2 ? { ...s, height: next } : s));
        } catch {
            // if sandbox/origin blocks access, we can't measure
        }
    }, []);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const onLoad = () => {
            measureIframeHeight();

            // ✅ observe DOM changes inside iframe
            const doc = iframe.contentDocument;
            if (!doc) return;

            const observer = new MutationObserver(() => measureIframeHeight());
            observer.observe(doc.documentElement, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true,
            });

            // ✅ re-check a few times for fonts/images/tailwind async layout
            const t1 = window.setTimeout(measureIframeHeight, 50);
            const t2 = window.setTimeout(measureIframeHeight, 200);
            const t3 = window.setTimeout(measureIframeHeight, 600);

            return () => {
                observer.disconnect();
                window.clearTimeout(t1);
                window.clearTimeout(t2);
                window.clearTimeout(t3);
            };
        };

        iframe.addEventListener("load", onLoad);
        window.addEventListener("resize", measureIframeHeight);

        return () => {
            iframe.removeEventListener("load", onLoad);
            window.removeEventListener("resize", measureIframeHeight);
        };
    }, [measureIframeHeight, htmlCode]);
  
  return (
    <Rnd default={{
            x,
            y,
            width: width,
            height: height,
        }}
        size={size}
        dragHandleClassName='drag-handle'
        enableResizing={{
            bottomLeft: true,
            bottomRight: true,
        }}
        onDragStart={()=>setPanningEnabled(false)}
        onDragStop={()=>setPanningEnabled(true)}
        onResize={()=>setPanningEnabled(false)}
        onResizeStop={(_,__,ref,___,position)=>{setPanningEnabled(true);
            setSize({
                width: ref.offsetWidth,
                height: ref.offsetHeight,
            })
        }}
    >
        <div className='drag-handle flex gap-2 items-center cursor-move bg-white rounded-lg p-5'>
            <ScreenHandler screen={screen} theme={theme} iframeRef={iframeRef} projectId={projectDetail?.projectId}/>
        </div>
        <iframe
            ref={iframeRef}
            className='w-full h-[calc(100%-40px)] rounded-2xl mt-5 bg-white'
            sandbox='allow-same-origin allow-scripts'
            srcDoc={html}
        />
    </Rnd>
  )
}

export default ScreenFrame
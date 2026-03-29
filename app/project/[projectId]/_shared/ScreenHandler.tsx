import { Button } from '@/components/ui/button';
import { ScreenConfig } from '@/data/types'
import { Code2Icon, CopyIcon, Download, GripVertical, Loader2Icon, MoreVertical, MoreVerticalIcon, SparkleIcon, TrashIcon } from 'lucide-react'
import React, { useContext, useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { toast } from 'sonner';
import { HtmlWrapper } from '@/data/constant';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { RefreshDataContext } from '@/context/RefreshDataContext';
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { Textarea } from '@/components/ui/textarea';

type Props = {
    screen: ScreenConfig | undefined;
    theme: any;
    iframeRef: any;
    projectId: string | undefined;
}

function ScreenHandler({screen, theme, iframeRef, projectId} : Props) {
    const htmlCode = HtmlWrapper(theme , screen?.code as string);
    const {refreshData, setRefreshData} = useContext(RefreshDataContext);
    const [editUserInput, setEditUserInput] = useState<string>();
    const takeIframeScreenshot = async () => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        try {
            const doc = iframe.contentDocument;
            if (!doc) return;

            const body = doc.body;

            // wait one frame to ensure layout is stable
            await new Promise((res) => requestAnimationFrame(res));

            const canvas = await html2canvas(body, {
                backgroundColor: null,
                useCORS: true,
                scale: window.devicePixelRatio || 1,
            });

            const image = canvas.toDataURL("image/png");

            // download automatically
            const link = document.createElement("a");
            link.href = image;
            link.download = `${screen?.screenName as string || "screen"}.png`;
            link.click();
        } catch (err) {
            console.error("Screenshot failed:", err);
        }
    };
    const [loading, setLoading] = useState(false);

    const onDelete = async () => {
        const result = await axios.delete(`/api/generate-config?projectId=${projectId}&screenId=${screen?.screenId}`);
        toast.success('Screen Deleted Successfully');
        setRefreshData({method: 'screenConfig', date: Date.now()});
    }

    const editScreen = async () => {
        setLoading(true);
        toast.info('Regenerating new screen , please wait...');
        const result = await axios.post('/api/edit-screen',{
            projectId: projectId,
            screenId: screen?.screenId,
            userInput: editUserInput,
            oldCode: screen?.code,
        });
        console.log(result.data);
        toast.success('Screen Edited Successfully');
        setRefreshData({method: 'screenConfig', date: Date.now()});
        setLoading(false);
    }
  return (
    <div className='flex w-full justify-between items-center'>
        <div className='flex items-center gap-2'>
            <GripVertical className='text-grey-500 h-4 w-4'/>
            <h2>{screen?.screenName}</h2>
        </div>

        <div>
            <Dialog>
                <DialogTrigger>
                    <Button variant={'ghost'} >
                        <Code2Icon/>
                    </Button>
                </DialogTrigger>
                <DialogContent className='max-w-6xl w-full h-[70vh] flex flex-col'>
                    <DialogHeader>
                    <DialogTitle>HTML + Tailwind CSS Code</DialogTitle>
                    <DialogDescription>
                        <div className='flex-1 overflow-y-auto rounded-md border bg-muted p-4'>
                            {/* @ts-ignore */}
                            <SyntaxHighlighter language="html" style={docco}
                                customStyle={{
                                    margin: 0,
                                    padding: 0,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    overflowX: 'hidden',
                                    height: '50vh',
                                }}
                                codeTagProps={{
                                    style: {
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                    }
                                }}>
                                {htmlCode}
                            </SyntaxHighlighter>

                            
                        </div>
                        <Button onClick={() => {navigator.clipboard.writeText(htmlCode as string);
                            toast.success('Copied to clipboard');
                        }} className='mt-4'>
                            <CopyIcon/> Copy
                        </Button>
                    </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            
             
            
            <Button variant={'ghost'} onClick={takeIframeScreenshot}>
                <Download/>
            </Button>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant={'ghost'}>
                        <SparkleIcon/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent>
                    <div>
                        <Textarea placeholder='What changes you want to make ?' onChange={(e)=>setEditUserInput(e.target.value)}/>
                        <Button size={'sm'} className='mt-2 w-full' onClick={()=>editScreen()} disabled={loading} >
                            {loading ? <Loader2Icon className='animate-spin'/> : <SparkleIcon/>} Regenerate
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={'ghost'}>
                        <MoreVertical/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    
                    <DropdownMenuItem variant='destructive' onClick={()=>onDelete()}>
                        <TrashIcon/> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
               
        </div>


    </div>
  )
}

export default ScreenHandler
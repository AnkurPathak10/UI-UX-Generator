import { db } from "@/config/db";
import { ProjectTable, ScreenConfigTable } from "@/config/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    
    const user = await currentUser(); 
    
    if (!user?.primaryEmailAddress?.emailAddress) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {userInput, device, projectId} = await req.json();

    if (!projectId || !device || !userInput) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const {has} = await auth();
    const hasPremiumAccess = has({plan: 'premium'});

    if (!hasPremiumAccess) {
        const projects = await db.select().from(ProjectTable)
            .where(eq(ProjectTable.userId, user?.primaryEmailAddress?.emailAddress as string));

        if (projects?.length >= 2 && !hasPremiumAccess) {
            return NextResponse.json({ msg: 'You have reached the maximum number of projects. Upgrade to premium to create more projects.' }, { status: 403 });
        }
    }

    try {
        const result = await db.insert(ProjectTable).values({
            projectId: projectId,
            userId: user.primaryEmailAddress.emailAddress,
            device: device,
            userInput: userInput,
        }).returning();

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error('Failed to create project:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {   // GET project details along with all related screen configurations
    const projectId = req.nextUrl.searchParams.get('projectId');
    const user = await currentUser();

    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }

    try {
        if(!projectId){
            const result = await db.select().from(ProjectTable)
            .where( eq(ProjectTable.userId, user?.primaryEmailAddress?.emailAddress as string))
            .orderBy(desc(ProjectTable.id));

            return NextResponse.json(result);
        }    
        
        const projectResult = await db.select().from(ProjectTable)
            .where(eq(ProjectTable.projectId, projectId as string));

        const screenConfigResult = await db.select().from(ScreenConfigTable)
            .where(eq(ScreenConfigTable.projectId, projectId as string));

        return NextResponse.json({
            projectDetail: projectResult[0],
            screenConfig: screenConfigResult
        });
    } catch (error) {
        return NextResponse.json({msg: 'Error'}, { status: 500 });
    }
}

export async function PUT(req: NextRequest){
    const {projectName, theme, projectId, screenShot} = await req.json();

    const result = await db.update(ProjectTable).set({
        projectName: projectName,
        theme: theme,
        screensShot: screenShot as string ?? null,
    }).where(eq(ProjectTable.projectId, projectId)).returning();

    return NextResponse.json(result[0]);
}
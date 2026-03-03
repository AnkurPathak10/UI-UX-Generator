import { db } from "@/config/db";
import { ProjectTable, ScreenConfigTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
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
    } catch (error) {
        console.error('Failed to fetch project:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }     }

    try {
        const result = await db.select().from(ProjectTable)
        .where(and(eq(ProjectTable.projectId, projectId as string), eq(ProjectTable.userId, user?.primaryEmailAddress?.emailAddress as string)));

        const ScreenConfig = await db.select().from(ScreenConfigTable)
            .where(eq(ScreenConfigTable.projectId, projectId as string));

        return NextResponse.json({
            projectDetail: result[0],
            screenConfig: ScreenConfig
        });
    } catch (error) {
        return NextResponse.json({msg: 'Error'});
    }
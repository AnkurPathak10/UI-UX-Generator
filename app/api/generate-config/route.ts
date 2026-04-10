import { db } from "@/config/db";
import { openrouter, OPENROUTER_MODEL } from "@/config/openroute";
import { ProjectTable, ScreenConfigTable } from "@/config/schema";
import { APP_LAYOUT_CONFIG_PROMPT, GENRATE_NEW_SCREEN_IN_EXISITING_PROJECT_PROJECT } from "@/data/prompt";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            const isRetryable = error?.cause?.code === 'ECONNRESET' || error?.message?.includes('terminated');
            if (!isRetryable || attempt === maxRetries) throw error;
            const delay = 1000 * Math.pow(2, attempt);
            console.log(`Retrying AI call (attempt ${attempt + 2}/${maxRetries + 1}) after ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));
        }
    }
    throw new Error('Unreachable');
}

export async function POST(req: NextRequest) {
    const { userInput, deviceType, projectId, oldScreenDescription, theme } = await req.json();
  
    try {
    const aiResult = await callWithRetry(() => openrouter.chat.send({
      chatGenerationParams: {
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: oldScreenDescription? GENRATE_NEW_SCREEN_IN_EXISITING_PROJECT_PROJECT.replace(
                  "{deviceType}",
                  deviceType
                ).replace("{theme}", theme) : APP_LAYOUT_CONFIG_PROMPT.replace(
                  "{deviceType}",
                  deviceType
                ),
              },
            ],
          },
          {
            role: "user",
            content: [
                {
                    type: "text",
                    text: oldScreenDescription? userInput + "Old Screen Description is: " + oldScreenDescription + " User Input is: " + userInput : userInput,
                }
            ]
          },
        ],
        stream: false,
      },
    }));
    
    const rawContent = aiResult?.choices[0]?.message?.content;
    if (!rawContent) {
        return NextResponse.json({ msg: 'AI returned empty response' }, { status: 500 });
    }
    const cleaned = rawContent
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const JSONAiResult = JSON.parse(cleaned);

    if(JSONAiResult){
        //Update project table with AI-generated metadata
        !oldScreenDescription && await db.update(ProjectTable).set({   // Updates project metadata
            projectVisualDescription: JSONAiResult?.projectVisualDescription,
            projectName: JSONAiResult?.projectName,
            theme: JSONAiResult?.theme,
        }).where(eq(ProjectTable.projectId, projectId as string));

        //insert screen config into ScreenConfig table
        await Promise.all(JSONAiResult.screens?.map(async (screen: any) => {
          await db.insert(ScreenConfigTable).values({
              projectId: projectId,
              purpose: screen?.purpose,
              screenDescription: screen?.layoutDescription,
              screenId: screen?.id,
              screenName: screen?.name,
          });
        }));
        return NextResponse.json(JSONAiResult);
    }
    else{
        return NextResponse.json({msg: "Internal Server Error"}, { status: 500 });
    }
    } catch (error) {
        console.error('Error generating config:', error);
        return NextResponse.json({msg: "Failed to generate config. Please try again."}, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
  const projectId  = req.nextUrl.searchParams.get('projectId');
  const screenId = req.nextUrl.searchParams.get('screenId');
  const user = await currentUser();

  if(!user){
    return NextResponse.json({msg: "Unauthorized User"}, { status: 400 });
  }

  const result = await db.delete(ScreenConfigTable).where(and(eq(ScreenConfigTable.projectId, projectId as string), eq(ScreenConfigTable.screenId, screenId as string)));

  return NextResponse.json({msg: "Screen Deleted Successfully"}, { status: 200 });
}
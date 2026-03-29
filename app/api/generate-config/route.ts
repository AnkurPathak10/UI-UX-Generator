import { db } from "@/config/db";
import { openrouter } from "@/config/openroute";
import { ProjectTable, ScreenConfigTable } from "@/config/schema";
import { RefreshDataContext } from "@/context/RefreshDataContext";
import { APP_LAYOUT_CONFIG_PROMPT, GENRATE_NEW_SCREEN_IN_EXISITING_PROJECT_PROJECT } from "@/data/prompt";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { useContext } from "react";

export async function POST(req: NextRequest) {  // Call AI to generate project structure + screen layouts
    const { userInput, deviceType, projectId, oldScreenDescription, theme } = await req.json();
  
    const aiResult = await openrouter.chat.send({ // Generates screen configuration via AI
      chatGenerationParams: {
        model: "arcee-ai/trinity-large-preview:free", //replace any model
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
    });
    
    const rawContent = aiResult?.choices[0]?.message?.content;
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
    }  }

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
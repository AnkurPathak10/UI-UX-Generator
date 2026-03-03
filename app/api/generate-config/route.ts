import { db } from "@/config/db";
import { openrouter } from "@/config/openroute";
import { ProjectTable, ScreenConfigTable } from "@/config/schema";
import { APP_LAYOUT_CONFIG_PROMPT } from "@/data/prompt";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {  // Call AI to generate project structure + screen layouts
    const { userInput, deviceType, projectId } = await req.json();
  
    const aiResult = await openrouter.chat.send({ // Generates screen configuration via AI
      chatGenerationParams: {
        model: "arcee-ai/trinity-large-preview:free", //replace any model
        messages: [
          {
            role: "system",
            content: APP_LAYOUT_CONFIG_PROMPT.replace(
              "{deviceType}",
              deviceType
            ),
          },
          {
            role: "user",
            content: [
                {
                    type: "text",
                    text: userInput,
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
        await db.update(ProjectTable).set({   // Updates project metadata
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
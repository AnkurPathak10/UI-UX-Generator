import { db } from "@/config/db";
import { openrouter } from "@/config/openroute";
import { ScreenConfigTable } from "@/config/schema";
import { GENERATION_SCREEN_PROMPT } from "@/data/prompt";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    let body;
    try {
        body = await req.json();
    } catch (e) {
        return NextResponse.json({ msg: 'Invalid or empty request body' }, { status: 400 });
    }
    const {
        projectId,
        screenId,
        screenName,
        purpose,
        screenDescription,
        projectVisualDescription
    } = body;

    if (!screenId || !projectId) {
        return NextResponse.json({ msg: 'Missing required fields' }, { status: 400 });
    }

    const userInput =`
    screenName is: ${screenName}
    screen Purpose: ${purpose}
    screen Description: ${screenDescription}
    `
    try {
        const aiResult = await openrouter.chat.send({ // Generates screen configuration via AI
            chatGenerationParams: {
              model: "arcee-ai/trinity-large-preview:free", //replace any model
              messages: [
                {
                  role: "system",
                  content: GENERATION_SCREEN_PROMPT
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
            },
          });
    
          const code = aiResult?.choices[0]?.message?.content;
          const updateResult = await db.update(ScreenConfigTable).set({
            code: code as string
          }).where(and(eq(ScreenConfigTable.projectId, projectId), eq(ScreenConfigTable?.screenId, screenId as string)))
                    .returning()
    
          return NextResponse.json(updateResult[0]);
    } catch (error) {
        return NextResponse.json({msg: 'Internal server error!'})
    }
    
}
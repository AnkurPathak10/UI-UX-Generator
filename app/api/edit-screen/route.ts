import { db } from "@/config/db";
import { openrouter, OPENROUTER_MODEL } from "@/config/openroute";
import { ScreenConfigTable } from "@/config/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    const {projectId, screenId, oldCode, userInput} = await req.json();
    const USER_INPUT = `${oldCode} Make Changes in this code as per user input ,keeping design and style same. Do not change it, just make changes that user has requested. UserInput is: ${userInput}`;
    try {
        const aiResult = await openrouter.chat.send({ // Generates screen configuration via AI
            chatGenerationParams: {
              model: OPENROUTER_MODEL,
              messages: [
                {
                  role: "user",
                  content: [
                      {
                          type: "text",
                          text: USER_INPUT,
                      }
                  ]
                },
              ],
            },
          });
    
           const code = aiResult?.choices[0]?.message?.content;
          if (!code) {
            return NextResponse.json({ msg: 'AI failed to generate content' }, { status: 500 });
          }
          const updateResult = await db.update(ScreenConfigTable).set({
            code: code as string
          }).where(and(eq(ScreenConfigTable.projectId, projectId), eq(ScreenConfigTable?.screenId, screenId as string))).returning();

          return NextResponse.json(updateResult[0]);
    } catch (error) {
        console.error('Error generating screen UI:', error);
        return NextResponse.json({ msg: 'Internal server error!' }, { status: 500 });
    } 
}
import { db } from "@/config/db";
import { openrouter, OPENROUTER_MODEL } from "@/config/openroute";
import { ScreenConfigTable } from "@/config/schema";
import { GENERATION_SCREEN_PROMPT } from "@/data/prompt";
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
        const aiResult = await callWithRetry(() => openrouter.chat.send({
            chatGenerationParams: {
              model: OPENROUTER_MODEL,
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
          }));
    
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
    
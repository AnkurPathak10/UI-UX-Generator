import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    const user = await currentUser(); //Clerk reads the auth cookie from the request
                                      //→ identifies logged in user
                                        //No token manually sent. No headers manually sent.
                                    //Next automatically forwards cookies.
    
    if (!user?.primaryEmailAddress?.emailAddress) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.primaryEmailAddress.emailAddress;
    
    const users = await db.select().from(usersTable)   //does this email already exist? Two possibilities: CASE A : First Login, B : Existing user
    .where(eq(usersTable.email, email));
    if(users?.length == 0){
        const data = {
            name: user?.fullName ?? '',
            email: user?.primaryEmailAddress?.emailAddress as string,
        }

        const result = await db.insert(usersTable).values({  //CASE A : First login -> No row exist so we insert
            ...data,
        }).returning();   

        return NextResponse.json(result[0] ?? {}); //User created in database.
    }
    return NextResponse.json(users[0] ?? {}); //CASE B — Existing user : Skip insert and return existing
}
"use client"
import { UserDetailContext } from "@/context/UserDetailContext";
import axios from "axios";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

type UserDetail = {
    id: number;
    name: string;
    email: string;
    credits: number;
  };

function Provider({children}:{ children: React.ReactNode }) {
    const { user, isLoaded } = useUser();
    const [userDetail, setUserDetail] = useState<UserDetail | null>(null);

    useEffect(() => {                       //This runs once after hydration: So browser sends request POST /api/user
        if (!isLoaded || !user) return;                    //and then API route runs (SERVER SIDE) = export async function POST(req: NextRequest)
        const createNewUser = async () => {
            const result = await axios.post('/api/user'); //Response comes back to browser after checking in route that user exists or not
    
            console.log(result);
            setUserDetail(result.data); //now react knows who the DB user is
        }
        
        createNewUser();
    }, [user, isLoaded]);   // Now request runs only when: Clerk finished loading AND user exists

    
  return (
    <UserDetailContext.Provider value={{userDetail, setUserDetail}}>
        {children}
    </UserDetailContext.Provider>

  )
}

export default Provider
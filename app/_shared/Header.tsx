"use client"
import { Button } from '@/components/ui/button'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Header = () => {
  return (
    <div className='flex items-center justify-between p-4'>
        <div className='flex gap-2 items-center'>
            <Image src={'/logo.png'} alt='logo' width={40} height={40} />
            <h2 className='text-xl font-semibold'><span className='text-primary'>Sketch</span>Pilot</h2>
        </div>
        <ul className='flex gap-3 md:gap-7 lg:gap-10 items-center font-semibold'>
            <Link href={"/"}> <li className='hover:text-primary cursor-pointer text-lg'>Home</li> </Link>
            <Link href={"/pricing"}> <li className='hover:text-primary cursor-pointer text-lg'>Pricing</li> </Link>
        </ul>
        
        <SignedIn>
            <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
            <Link href="/sign-in">
                <Button>Get Started</Button>
            </Link>
        </SignedOut>
    </div>
  )
}

export default Header
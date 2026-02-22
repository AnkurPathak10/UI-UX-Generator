"use client"
import { Button } from '@/components/ui/button'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import Image from 'next/image'
import React from 'react'

const Header = () => {
  const {user} = useUser();
  return (
    <div className='flex items-center justify-between p-4'>
        <div className='flex gap-2 items-center'>
            <Image src={'/logo.png'} alt='logo' width={40} height={40} />
            <h2 className='text-xl font-semibold'><span className='text-primary'>Sketch</span> Pilot</h2>
        </div>
        <ul className='flex gap-10 items-center font-semibold'>
            <li className='hover:text-primary cursor-pointer text-lg'>Home</li>
            <li className='hover:text-primary cursor-pointer text-lg'>Pricing</li>
        </ul>
        {!user ? 
          <SignInButton mode='modal'>
            <Button>Get Started</Button>
          </SignInButton> : 
          <UserButton/>}
        
    </div>
  )
}

export default Header
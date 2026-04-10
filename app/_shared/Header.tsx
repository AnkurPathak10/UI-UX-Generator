"use client"
import { Button } from '@/components/ui/button'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className='relative'>
      <div className='flex items-center justify-between p-4'>
        <div className='flex gap-2 items-center'>
            <Image src={'/logo.png'} alt='logo' width={40} height={40} />
            <h2 className='text-xl font-semibold'><span className='text-primary'>Sketch</span>Pilot</h2>
        </div>

        <ul className='hidden md:flex gap-7 lg:gap-10 items-center font-semibold absolute left-1/2 -translate-x-1/2'>
            <Link href={"/"}> <li className='hover:text-primary cursor-pointer text-lg'>Home</li> </Link>
            <Link href={"/pricing"}> <li className='hover:text-primary cursor-pointer text-lg'>Pricing</li> </Link>
        </ul>

        <div className='flex items-center gap-3'>
          <SignedIn>
              <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
              <Link href="/sign-in">
                  <Button>Get Started</Button>
              </Link>
          </SignedOut>

          <button
            className='md:hidden p-1.5 rounded-md hover:bg-gray-100 transition-colors'
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label='Toggle menu'
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className='md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-md z-50'>
          <ul className='flex flex-col font-semibold p-4 gap-1'>
            <Link href={"/"} onClick={() => setMenuOpen(false)}>
              <li className='hover:bg-gray-50 rounded-lg px-3 py-2.5 text-lg'>Home</li>
            </Link>
            <Link href={"/pricing"} onClick={() => setMenuOpen(false)}>
              <li className='hover:bg-gray-50 rounded-lg px-3 py-2.5 text-lg'>Pricing</li>
            </Link>
          </ul>
        </div>
      )}
    </div>
  )
}

export default Header
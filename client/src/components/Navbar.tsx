"use client"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import ShinyText from '@/blocks/ShinyText'

const Navbar = () => {
  const [isOpen,setIsOpen]=useState(false)
  return (
<nav className="bg-white p-3 fixed w-full z-50">
    <div className="container mx-auto flex justify-between items-center">
      <Link href="/">
      <div className="flex gap-2 w-48 align-middle items-center">
        <Image
        src="/logo.png"
        width={60}
        height={40}
        alt="WorkBook Logo"
        />
        <p className="text-3xl font-bold">
          GeneralStore
        </p>
        
      </div>
      </Link>
      <div className={`md:flex flex-col md:flex-row md:items-center absolute md:static bg-gray-900 md:bg-transparent w-auto md:w-auto left-0 top-16 transition-all duration-300 ease-in-out hidden
      }`}>
        <ul className="flex flex-col md:flex-row md:gap-6 gap-2 p-4 md:p-0 text-lg">
          <li>
            <a href="#" className="hover:text-gray-300">
              Stall
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-blue-700 text-blue-600">
              Purchase
            </a>
          </li>
          <li className="relative group">
            <a
              href="#"
              className="flex items-center gap-1 hover:text-gray-300 cursor-pointer"
              onClick={()=>setIsOpen(!isOpen)}
            >
              Sell
              <ChevronDown/>
            </a>
            {isOpen && (
              <ul className="absolute left-0 mt-2 w-40 bg-black text-white rounded-lg shadow-lg transition-opacity duration-300 text-base">
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-900">
                  Action
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-900">
                  Another
                </a>
              </li>
              <li>
                <hr className="border-gray-600" />
              </li>
              <li>
                <a href="#" className="block px-4 py-2 hover:bg-gray-900">
                  Login
                </a>
              </li>
            </ul>
            )}
            
          </li>
        </ul>
        
      </div>
      <Link href="/user-registration">
      <Button className="font-semibold bg-gray-900 hover:ring-2 hover:ring-blue-900 hover:shadow-blue-700/50 transition-all duration-300 w-48">
      <ShinyText text="Register Now" disabled={false} speed={1} className='custom-class' />
      </Button>
      </Link>
    </div>
</nav>
  )
}

export default Navbar

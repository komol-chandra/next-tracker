import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className='navbar'>
        <span>My Webpage</span>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/signup">Sign Up</Link>
    </nav>
  )
}

export default Navbar
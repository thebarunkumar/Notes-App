import React, { useState } from "react";
import { BookA, Menu, BookOpen, LogOut, User, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import { toast } from "sonner";
import { setUser } from "@/redux/authSlice";
const API_URL = import.meta.env.VITE_API_URL;

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const accessToken = localStorage.getItem("accessToken");
  const logoutHandler = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/v1/user/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (res.data.success) {
        dispatch(setUser(null));
        toast.success(res.data.message);
        localStorage.clear();
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <nav className="p-2 border-b border-gray-200 bg-transparent">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div
          onClick={() => navigate("/")}
          className="flex gap-2 items-center cursor-pointer"
        >
          <BookOpen className="h-6 w-6 text-primaryBlue" />
          <h1 className="font-bold text-xl">
            <span className="text-primaryBlue">Notes</span>App
          </h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-7 items-center">
          <ul className="flex gap-6 lg:gap-8 items-center text-base lg:text-lg font-semibold text-primaryBlue">
            <li><Link to="/">Team</Link></li>
            <li><Link to="/">Tools</Link></li>
            <li><Link to="/">The Story</Link></li>
            <li><Link to="/">About</Link></li>
            <li>{user?.username}</li>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[200px]">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BookA />
                    Notes
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logoutHandler}>
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <li>Sign in</li>
              </Link>
            )}
          </ul>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-primaryBlue focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-t border-gray-200 flex flex-col items-center gap-4 py-4 md:hidden z-50">
          <Link to="/team" onClick={() => setMenuOpen(false)}>
            Team
          </Link>
          <Link to="/tools" onClick={() => setMenuOpen(false)}>
            Tools
          </Link>
          <Link to="/story" onClick={() => setMenuOpen(false)}>
            The Story
          </Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>
            About
          </Link>

          {user ? (
            <Button
              onClick={() => {
                logoutHandler();
                setMenuOpen(false);
              }}
              variant="outline"
              className="text-primaryBlue border-blue-500"
            >
              Logout
            </Button>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              <Button className="bg-primaryBlue hover:bg-blue-500">
                Sign in
              </Button>
            </Link>
          )}

          <Button onClick={()=>navigate('/create-todo')} className="bg-primaryBlue hover:bg-blue-500 w-[90%]">
            Start Taking Notes <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

        </div>
      )}
    </nav>
  );
};

export default Navbar;

// components/Header.js
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { FaCamera } from "react-icons/fa";

const Header = () => {
  return (
    <header className="p-4 flex justify-between items-center bg-white dark:bg-gray-800 shadow">
      <div className="flex items-center space-x-2">
        <FaCamera className="text-blue-500 text-2xl" />
        <Link
          href="/"
          passHref
          className="text-2xl font-bold text-gray-800 dark:text-white"
        >
          Image Analyzer
        </Link>
      </div>
      <ThemeToggle />
    </header>
  );
};

export default Header;

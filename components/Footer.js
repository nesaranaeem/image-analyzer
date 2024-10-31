// components/Footer.js
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaHeart,
} from "react-icons/fa";

const Footer = () => {
  const socialLinks = [
    {
      href: "https://github.com/nesaranaeem",
      icon: <FaGithub />,
    },
    {
      href: "https://twitter.com/nesaranaeem",
      icon: <FaTwitter />,
    },
    {
      href: "https://linkedin.com/in/nesaranaeem",
      icon: <FaLinkedin />,
    },
    {
      href: "https://facebook.com/nesaranaeem",
      icon: <FaFacebook />,
    },
    {
      href: "https://instagram.com/nesaranaeem",
      icon: <FaInstagram />,
    },
  ];

  return (
    <footer className="p-4 text-center bg-white dark:bg-gray-800 shadow mt-8">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        Built with <FaHeart className="inline text-red-500" /> in Dhaka by{" "}
        <span className="font-semibold">Nesar Ahmed Naeem</span>
      </p>
      <div className="flex justify-center space-x-4">
        {socialLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
          >
            {link.icon}
          </a>
        ))}
      </div>
    </footer>
  );
};

export default Footer;

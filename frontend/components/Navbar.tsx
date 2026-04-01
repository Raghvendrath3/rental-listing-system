import Link from 'next/link';
// import SmartSearchBox from './search/SmartSearchBox';
const Navbar = () => {
  return (
    <nav className="w-full flex items-center justify-between p-4 bg-gray-900 text-white">
      {/* Logo / Home Link */}
      <div className="text-xl font-bold">
        <Link href="/" className="hover:text-gray-300">
          MyApp
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center space-x-4">
        <Link href="/" className="hover:text-blue-400 transition-colors">
          Home
        </Link>
        {/* <SmartSearchBox placeholder="Search properties..." /> */}
        {/* Auth Buttons */}
        <div className="flex items-center space-x-2 ml-4">
            <Link 
            href="/auth/login"
            className="px-4 py-2 text-sm font-medium text-white hover:text-gray-200 transition-colors"
            >
            Login
            </Link>
          <Link 
            href="/auth/register" 
            className="px-4 py-2 text-sm font-medium bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

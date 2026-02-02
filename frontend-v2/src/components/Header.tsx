import NavItem from "./client/NavItem";
import ThemeToggle from "./client/ThemeToggle";
import UserDropdown from "./client/UserDropdown";

const Header = () => {
  const renderNavItem = (path: string, label: string) => {
    return <NavItem path={path} label={label} />
  }

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timeline App</h1>
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-4">
              {renderNavItem("/creator", "Creator")}
              {renderNavItem("/crosses", "Crosses")}
              {renderNavItem("/locations", "Locations")}
              {renderNavItem("/travels", "Travels")}
              {renderNavItem("/visits", "Visits")}
            </nav>
            <div className="flex items-center space-x-2">
              <UserDropdown />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

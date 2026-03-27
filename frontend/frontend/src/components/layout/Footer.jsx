import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  const links = {
    Company:  [{ label: 'About Us', href: '#' }, { label: 'Careers', href: '#' }, { label: 'Blog', href: '#' }],
    Support:  [{ label: 'Help Center', href: '#' }, { label: 'Contact Us', href: '#' }, { label: 'Safety', href: '#' }],
    Legal:    [{ label: 'Privacy Policy', href: '#' }, { label: 'Terms of Service', href: '#' }, { label: 'Cookie Policy', href: '#' }],
  };

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">FoodRush</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Fast, fresh food delivery from the best restaurants near you.
            </p>
            <div className="flex gap-3 mt-4">
              {['🍎', '🤖'].map((icon, i) => (
                <button key={i} className="flex items-center gap-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                  <span>{icon}</span>
                  <span>{i === 0 ? 'App Store' : 'Play Store'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{section}</h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-400">© {year} FoodRush. All rights reserved.</p>
          <p className="text-sm text-gray-400">Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
}

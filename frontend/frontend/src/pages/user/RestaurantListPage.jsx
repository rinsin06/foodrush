import { useSearchParams } from 'react-router-dom';
import RestaurantGrid from '../../components/restaurant/RestaurantGrid.jsx';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function RestaurantListPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="page-container py-8">
        <div className="mb-6">
          <h1 className="section-heading mb-4">All Restaurants</h1>
          <div className="relative max-w-xl">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants or cuisines..."
              className="input-field pl-12" />
          </div>
        </div>
        <RestaurantGrid searchQuery={searchQuery} />
      </div>
    </div>
  );
}

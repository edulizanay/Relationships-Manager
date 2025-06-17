import RelationshipManager from '@/components/RelationshipManager';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">BeeWithMe</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/contacts"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                Manage Contacts
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <RelationshipManager />
    </div>
  );
}

import { Link } from 'react-router-dom';

export function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        <p className="mb-4">If you can see this, routing is working!</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Go back to home
        </Link>
      </div>
    </div>
  );
}
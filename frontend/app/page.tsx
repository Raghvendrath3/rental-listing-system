import { listings } from '@/lib/api';
import Pagination from '@/components/Pagination/page';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // Convert string param to number, default to page 1
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const limit = 10;

  const response = await listings({ page: currentPage, limit });
  const { data, meta } = response;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Listings</h1>

      <div className="grid gap-4">
        {data.map((item) => (
          <div key={item.id} className="p-4 border rounded shadow-sm">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-gray-600">{item.city} — ${item.price}</p>
          </div>
        ))}
      </div>

      {/* Pass meta data to the Pagination component */}
      <Pagination 
        currentPage={currentPage} 
        totalPages={meta.totalPages} 
      />
    </main>
  );
}

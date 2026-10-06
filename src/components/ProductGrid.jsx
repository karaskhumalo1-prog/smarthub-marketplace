import ProductCard from './ProductCard.jsx'

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card h-72 animate-pulse bg-navy/5" />
        ))}
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-navy/15 py-16 text-center">
        <p className="font-semibold text-navy">No products found</p>
        <p className="mt-1 text-sm text-navy/50">
          Try a different category or search term.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

const DEFAULT_CATEGORIES = [
  'All',
  'Food & Groceries',
  'Fashion & Apparel',
  'Electronics',
  'Home & Garden',
  'Beauty & Health',
  'Services',
  'Crafts & Art',
]

export default function CategoryFilter({
  categories = DEFAULT_CATEGORIES,
  active,
  onChange,
}) {
  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
      {categories.map((category) => {
        const isActive = active === category
        return (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={
              isActive
                ? 'whitespace-nowrap rounded-full bg-navy px-4 py-1.5 text-sm font-semibold text-gold'
                : 'whitespace-nowrap rounded-full border border-navy/15 px-4 py-1.5 text-sm font-medium text-navy/70 hover:border-navy/30'
            }
          >
            {category}
          </button>
        )
      })}
    </div>
  )
}

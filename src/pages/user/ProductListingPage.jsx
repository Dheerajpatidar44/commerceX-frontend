import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import api from '../../api/axios';
import ProductCard from '../../components/product/ProductCard';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const vendorFilter = searchParams.get('vendorId') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter);
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sync state with URL params
  useEffect(() => {
    setSelectedCategory(categoryFilter);
  }, [categoryFilter]);

  const handleCategoryChange = (c) => {
    setPage(1);
    setSelectedCategory(c);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (c) p.set('category', c);
      else p.delete('category');
      p.delete('search');
      return p;
    });
  };

  // Fetch categories
  useEffect(() => {
    window.scrollTo(0, 0);
    api.get('/products/meta/categories')
      .then(res => {
        const dbCategories = res.data.categories || [];
        const defaultCategories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys', 'Automotive', 'Health', 'Grocery', 'Jewelry', 'Pet Supplies'];
        setCategories(Array.from(new Set([...dbCategories, ...defaultCategories])));
      })
      .catch(err => console.error('Categories fetch failed', err));
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          search: searchQuery,
          category: selectedCategory,
          vendorId: vendorFilter,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          sort: sortBy,
          page,
          limit: 9
        };
        const { data } = await api.get('/products', { params });
        if (page > 1) {
          setProducts(prev => [...prev, ...data.products]);
        } else {
          setProducts(data.products);
        }
        setTotalPages(data.pages);
        setTotalCount(data.total);
      } catch (err) {
        console.error('Products fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchQuery, selectedCategory, vendorFilter, priceRange, sortBy, page]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, priceRange, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title text-2xl font-display font-bold">
            {searchQuery ? `Results for "${searchQuery}"` : selectedCategory || 'All Products'}
          </h1>
          <p className="page-subtitle text-sm text-surface-500">{totalCount} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary btn-sm lg:hidden">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          <div className="relative">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="input-field pr-8 py-2 text-xs min-w-[140px]">
              <option value="default">Sort: Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rating</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'} lg:block lg:static lg:w-56 flex-shrink-0`}>
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h3 className="font-display font-semibold text-lg">Filters</h3>
            <button onClick={() => setShowFilters(false)} className="p-1.5 rounded-lg hover:bg-surface-100"><X className="w-5 h-5" /></button>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-surface-900 mb-3">Category</h4>
            <div className="space-y-1">
              <button onClick={() => handleCategoryChange('')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-brand-50 text-brand-700 font-medium' : 'text-surface-600 hover:bg-surface-50'}`}>
                All Categories
              </button>
              {categories.map(c => (
                <button key={c} onClick={() => handleCategoryChange(c)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === c ? 'bg-brand-50 text-brand-700 font-medium' : 'text-surface-600 hover:bg-surface-50'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-surface-900 mb-3">Price Range</h4>
            <div className="space-y-3">
              <input type="range" min="0" max="150000" step="500" value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full accent-brand-600" />
              <div className="flex items-center gap-2 text-xs text-surface-500">
                <span>₹{priceRange[0].toLocaleString()}</span>
                <span className="flex-1 border-t border-surface-200" />
                <span>₹{priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          {(selectedCategory || priceRange[1] < 150000) && (
            <button onClick={() => { handleCategoryChange(''); setPriceRange([0, 150000]); }}
              className="btn-ghost btn-sm w-full justify-center text-red-600 hover:bg-red-50 hover:text-red-700">
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {loading && page === 1 ? (
            <div className="flex justify-center py-12"><Loader size="lg" /></div>
          ) : products.length === 0 ? (
            <EmptyState title="No products found" description="Try adjusting your filters or search terms" actionLabel="Clear Filters" actionTo="/products" />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
              {page < totalPages && (
                <div className="text-center mt-8">
                  <button 
                    disabled={loading}
                    onClick={() => setPage(prev => prev + 1)} 
                    className="btn-secondary"
                  >
                    {loading ? <Loader size="sm" /> : 'Load More Products'} <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  item_class?: string;
  category_name?: string;
  max_order_qty?: number;
  order_unit?: string;
  image_url?: string;
};

export default function ProductCard({ product, onOrder }: { product: Product; onOrder: (id: number) => void }) {
  return (
    <div className="card p-5 border-zinc-800 hover:border-[#F06292]/50 transition-colors shadow-lg hover:shadow-[0_0_15px_rgba(240,98,146,0.15)]">
      <div className="mb-4 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-zinc-900">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-zinc-500">No Image</span>
        )}
      </div>

      <div className="mb-2 flex flex-wrap gap-2">
        {product.category_name && (
          <span className="rounded-full border border-[#F06292]/30 bg-[#F06292]/10 px-2 py-1 text-xs font-semibold text-[#F06292]">
            {product.category_name}
          </span>
        )}
        {product.item_class && (
          <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-300">
            {product.item_class}
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold text-white">{product.name}</h3>
      <p className="mt-2 text-sm text-zinc-400">{product.description}</p>

      <div className="mt-4 space-y-1 text-sm text-zinc-300">
        <div>Max Order: {product.max_order_qty} {product.order_unit || 'pcs'}</div>
        <div>Stock: {product.stock}</div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="font-semibold text-[#F06292] text-lg">${Number(product.price).toLocaleString('en-US')}</div>
        <button onClick={() => onOrder(product.id)} className="btn-primary">
          Order
        </button>
      </div>
    </div>
  );
}
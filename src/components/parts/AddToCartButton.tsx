"use client";

import { useState } from "react";
import { ShoppingCart, Check, Plus, Minus } from "lucide-react";
import { useCart, CartItem } from "@/lib/context/CartContext";

interface Props {
  item: Omit<CartItem, "quantity">;
  showQuantity?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AddToCartButton({
  item,
  showQuantity = false,
  size = "md",
  className = "",
}: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock = item.stock <= 0;

  function handleAdd() {
    if (isOutOfStock) return;
    addItem(item, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  const sizeClasses = {
    sm: "py-2 px-3 text-xs",
    md: "py-2.5 px-4 text-xs font-bold",
    lg: "py-3.5 px-6 text-sm font-extrabold",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showQuantity && !isOutOfStock && (
        <div className="flex items-center glass rounded-xl border border-white/10 p-1">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-8 text-center text-xs font-bold text-white">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(Math.min(item.stock, quantity + 1))}
            disabled={quantity >= item.stock}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={isOutOfStock}
        className={`flex-1 flex items-center justify-center gap-2 rounded-xl transition-all cursor-pointer ${sizeClasses[size]} ${
          isOutOfStock
            ? "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
            : justAdded
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
            : "gradient-brand text-white hover:opacity-95 shadow-lg shadow-blue-500/25"
        }`}
      >
        {justAdded ? (
          <>
            <Check className="w-4 h-4 text-white" />
            <span>Added to Cart!</span>
          </>
        ) : isOutOfStock ? (
          <span>Out of Stock</span>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </>
        )}
      </button>
    </div>
  );
}

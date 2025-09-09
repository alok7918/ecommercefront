import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "./api";

function ProductDetailPage1() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    API.get(`/admin/products/${4}`).then((res) => {
        console.log(JSON.stringify(res.data, null, 2));

      setProduct(res.data);
    });
  }, [id]);

  if (!product) return <p>Loading...</p>;

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  return (
    <div className="product-detail" style={{ display: "flex", gap: "30px" }}>
      {/* Product Image */}
      <div className="image-section">
        <img
          src={
            selectedVariant?.imageUrl || product.imageUrl || "/placeholder.jpg"
          }
          alt={product.name}
          width="300"
        />
      </div>

      {/* Product Info */}
      <div className="info-section">
        <h1>{product.name}</h1>
        <p>Category: {product.category?.name}</p>
        <p>Subcategory: {product.subcategory?.name}</p>

        {/* Price */}
        <h2>
          ₹{selectedVariant ? selectedVariant.price : product.price}
        </h2>

       {/* Variants */}
<div className="variants-section">
  <h3>Available Variants</h3>
  {product.variants?.map((variant) => {
    const label = variant.attributes
      ?.map((attr) => {
        // Try multiple possible backend key names
        const name = attr.name || attr.attributeName || "";
        const value =
          attr.value ||
          attr.attributeValue ||
          (attr.values ? attr.values.join(", ") : "");
        return `${name}: ${value}`;
      })
      .join(" | ");

    return (
      <button
        key={variant.id}
        onClick={() => handleVariantSelect(variant)}
        style={{
          margin: "5px",
          padding: "10px",
          border:
            selectedVariant?.id === variant.id
              ? "2px solid blue"
              : "1px solid gray",
        }}
      >
        {label || "Unnamed Variant"}
      </button>
    );
  })}
</div>

        {/* Stock */}
        {selectedVariant && <p>Stock: {selectedVariant.stock}</p>}
      </div>
    </div>
  );
}

export default ProductDetailPage1;

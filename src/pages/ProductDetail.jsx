// import React, { useState, useEffect } from "react";
// import API from "./api";

// function ProductDetail({ productId }) {
//   const [product, setProduct] = useState(null);
//   const [selectedAttributes, setSelectedAttributes] = useState({});
//   const [selectedVariant, setSelectedVariant] = useState(null);

//   useEffect(() => {
//     API.get(`admin/products/as/${1}`).then((res) => {
//       setProduct(res.data);
      
//     });
 

//   }, [productId]);


// useEffect(() => {
//   if(product) {
//     console.log("Updated product variants:", product.variants);
//   }
// }, [product]);



// const handleAttributeChange = (attrName, value) => {
//   setSelectedAttributes((prev) => {
//     const updated = { ...prev, [attrName]: value };

//     const matchedVariant = product.variants.find((variant) => {
//       console.log("Checking variant:", variant.attributes);
//       return Object.entries(updated).every(
//         ([name, val]) =>
//           variant.attributes[name] &&
//           variant.attributes[name].toLowerCase() === val.toLowerCase()
//       );
//     });

//     setSelectedVariant(matchedVariant || null);
//     console.log("Selected Attributes:", updated);

//     return updated;
//   });
// };


//   if (!product) return <div>Loading...</div>;

//   return (
//     <div>
//       <h2>{product.name}</h2>

//       {/* Render attributes */}
//       {product.attributes.map((attr) => (
//         <div key={attr.id} style={{ marginBottom: "15px" }}>
//           <h4>{attr.name}</h4>
//           {attr.values.map((val) => (
//             <button
//               key={`${attr.id}-${val.id}`} // unique key
//               style={{
//                 margin: "5px",
//                 padding: "8px 15px",
//                 border:
//                   selectedAttributes[attr.name] === val.value
//                     ? "2px solid blue"
//                     : "1px solid gray",
//                 borderRadius: "5px",
//                 backgroundColor:
//                   selectedAttributes[attr.name] === val.value
//                     ? "#e0f0ff"
//                     : "#fff",
//                 cursor: "pointer",
//               }}
//               onClick={() => handleAttributeChange(attr.name, val.value)}
//             >
//               {val.value}
//             </button>
//           ))}
//         </div>
//       ))}

//       {/* Show selected variant */}
//       {selectedVariant ? (
//         <div style={{ marginTop: "20px" }}>
//           <h3>Selected Variant</h3>
//           <p>Price: ₹{selectedVariant.price}</p>
//           <p>Stock: {selectedVariant.stock}</p>
//           {selectedVariant.image && (
//             <img
//               src={selectedVariant.image}
//               alt="variant"
//               style={{ maxWidth: "200px", marginTop: "10px" }}
//             />
//           )}
//         </div>
//       ) : (
//         Object.keys(selectedAttributes).length === product.attributes.length && (
//           <p style={{ color: "red" }}>No matching variant found.</p>
//         )
//       )}
//     </div>
//   );
// }

// export default ProductDetail;

// import React, { useState, useEffect } from "react";
// import API from "./api";

// function ProductDetail({ productId }) {
//   const [product, setProduct] = useState(null);
//   // Store selectedAttributes as an array: [{ attrName, value }]
//   const [selectedAttributes, setSelectedAttributes] = useState([]);
//   const [selectedVariant, setSelectedVariant] = useState(null);

//   useEffect(() => {
//     API.get(`admin/products/as/${1}`).then((res) => {
//       setProduct(res.data);
//       const initialSelected = res.data.attributes.map((attr) => ({
//         attrName: attr.name,
//         value: "",
//       }));
//       setSelectedAttributes(initialSelected);
//       setSelectedVariant(null);
//     });
//   }, [productId]);

//   // Helper to find matching variant for given selectedAttributes
//   const findMatchingVariant = (selection) => {
//     if (!product) return null;

//     const lookup = {};
//     selection.forEach(({ attrName, value }) => {
//       if (value) lookup[attrName] = value.toLowerCase();
//     });

//     return product.variants.find((variant) =>
//       Object.entries(lookup).every(
//         ([name, val]) =>
//           variant.attributes[name] &&
//           variant.attributes[name].toLowerCase() === val
//       )
//     );
//   };

//   // Helper to get available values for attribute given current selection (excluding that attr)
//   const getAvailableValues = (attrName, currentSelection) => {
//     if (!product) return [];

//     const filter = currentSelection.filter(
//       (a) => a.attrName !== attrName && a.value
//     );

//     const matchingVariants = product.variants.filter((variant) =>
//       filter.every(
//         (a) =>
//           variant.attributes[a.attrName] &&
//           variant.attributes[a.attrName].toLowerCase() === a.value.toLowerCase()
//       )
//     );

//     const valuesSet = new Set();
//     matchingVariants.forEach((variant) => {
//       const val = variant.attributes[attrName];
//       if (val) valuesSet.add(val);
//     });

//     if (filter.length === 0) {
//       return (
//         product.attributes.find((a) => a.name === attrName)?.values.map((v) => v.value) || []
//       );
//     }

//     return Array.from(valuesSet);
//   };

//   // On attribute value click, update selectedAttributes,
//   // and auto reset conflicting attributes to maintain valid combination
//   const handleAttributeChange = (attrName, value) => {
//     if (!product) return;

//     setSelectedAttributes((prevSelected) => {
//       // Update chosen attribute value
//       let updated = prevSelected.map((item) =>
//         item.attrName === attrName ? { ...item, value } : item
//       );

//       // Try to find a matching variant with this selection
//       let matchedVariant = findMatchingVariant(updated);

//       // If no variant matches, try resetting conflicting attrs one by one
//       if (!matchedVariant) {
//         // We'll try to reset attributes except the one just changed
//         // Reset attributes in order until variant matches or all reset
//         const attrOrder = updated.map((a) => a.attrName);
//         for (let resetAttr of attrOrder) {
//           if (resetAttr === attrName) continue; // keep changed attr fixed
//           updated = updated.map((item) =>
//             item.attrName === resetAttr ? { ...item, value: "" } : item
//           );
//           matchedVariant = findMatchingVariant(updated);
//           if (matchedVariant) break; // found valid variant after resets
//         }
//       }

//       setSelectedVariant(matchedVariant || null);
//       return updated;
//     });
//   };

//   if (!product) return <div>Loading...</div>;

//   return (
//     <div>
//       <h2>{product.name}</h2>

//       {product.attributes.map((attr) => {
//         const availableValues = getAvailableValues(attr.name, selectedAttributes);
//         const selectedValue =
//           selectedAttributes.find((a) => a.attrName === attr.name)?.value || "";

//         return (
//           <div key={attr.id} style={{ marginBottom: "15px" }}>
//             <h4>{attr.name}</h4>

//             {attr.values.map((val) => {
//               const isAvailable = availableValues.includes(val.value);

//               return (
//                 <button
//                   key={`${attr.id}-${val.id}`}
//                   style={{
//                     margin: "5px",
//                     padding: "8px 15px",
//                     border:
//                       selectedValue === val.value ? "2px solid blue" : "1px solid gray",
//                     borderRadius: "5px",
//                     backgroundColor: selectedValue === val.value ? "#e0f0ff" : "#fff",
//                     cursor: "pointer",
//                     color: isAvailable ? "black" : "#aaa",
//                     opacity: isAvailable ? 1 : 0.5,
//                   }}
//                   onClick={() => handleAttributeChange(attr.name, val.value)}
//                 >
//                   {val.value}
//                 </button>
//               );
//             })}
//           </div>
//         );
//       })}

//       {selectedVariant ? (
//         <div style={{ marginTop: "20px" }}>
//           <h3>Selected Variant</h3>
//           <p>Price: ₹{selectedVariant.price}</p>
//           <p>Stock: {selectedVariant.stock}</p>
//           {selectedVariant.image && (
//             <img
//               src={selectedVariant.image}
//               alt="variant"
//               style={{ maxWidth: "200px", marginTop: "10px" }}
//             />
//           )}
//         </div>
//       ) : (
//         selectedAttributes.every((a) => a.value) && (
//           <p style={{ color: "red" }}>No matching variant found.</p>
//         )
//       )}
//     </div>
//   );
// }

// export default ProductDetail;

// import React, { useState, useEffect } from "react";
// import API from "./api";

// function ProductDetail({ productId }) {
//   const [product, setProduct] = useState(null);
//   const [selectedAttributes, setSelectedAttributes] = useState([]); // [{ attrName, value }]
//   const [selectedVariant, setSelectedVariant] = useState(null);
//   const [imagesByColor, setImagesByColor] = useState([]);

//   useEffect(() => {
//     API.get(`admin/products/as/${1}`).then((res) => {
//       setProduct(res.data);
//       const initialSelected = res.data.attributes.map((attr) => ({
//         attrName: attr.name,
//         value: "",
//       }));
//       setSelectedAttributes(initialSelected);
//       setSelectedVariant(null);
//     });

//     API.get(`admin/products/${1}/images-by-color`).then((res) => {
//       setImagesByColor(res.data);
//     });
//   }, [productId]);

//   const findMatchingVariant = (selection) => {
//     if (!product) return null;
//     const lookup = {};
//     selection.forEach(({ attrName, value }) => {
//       if (value) lookup[attrName] = value.toLowerCase();
//     });
//     return product.variants.find((variant) =>
//       Object.entries(lookup).every(
//         ([name, val]) =>
//           variant.attributes[name] &&
//           variant.attributes[name].toLowerCase() === val
//       )
//     );
//   };

//   const getAvailableValues = (attrName, currentSelection) => {
//     if (!product) return [];
//     const filter = currentSelection.filter(
//       (a) => a.attrName !== attrName && a.value
//     );
//     const matchingVariants = product.variants.filter((variant) =>
//       filter.every(
//         (a) =>
//           variant.attributes[a.attrName] &&
//           variant.attributes[a.attrName].toLowerCase() === a.value.toLowerCase()
//       )
//     );
//     const valuesSet = new Set();
//     matchingVariants.forEach((variant) => {
//       const val = variant.attributes[attrName];
//       if (val) valuesSet.add(val);
//     });
//     if (filter.length === 0) {
//       return (
//         product.attributes.find((a) => a.name === attrName)?.values.map((v) => v.value) || []
//       );
//     }
//     return Array.from(valuesSet);
//   };

//   const handleAttributeChange = (attrName, value) => {
//     if (!product) return;
//     setSelectedAttributes((prevSelected) => {
//       let updated = prevSelected.map((item) =>
//         item.attrName === attrName ? { ...item, value } : item
//       );
//       let matchedVariant = findMatchingVariant(updated);
//       if (!matchedVariant) {
//         const attrOrder = updated.map((a) => a.attrName);
//         for (let resetAttr of attrOrder) {
//           if (resetAttr === attrName) continue;
//           updated = updated.map((item) =>
//             item.attrName === resetAttr ? { ...item, value: "" } : item
//           );
//           matchedVariant = findMatchingVariant(updated);
//           if (matchedVariant) break;
//         }
//       }
//       setSelectedVariant(matchedVariant || null);
//       return updated;
//     });
//   };

//   // Get selected color from attributes
//   const selectedColor = selectedAttributes.find(
//     (a) => a.attrName.toLowerCase() === "color"
//   )?.value;

//   // Find matching image for selected color
//   const currentImage = selectedColor
//     ? imagesByColor.find(
//         (img) => img.color.toLowerCase() === selectedColor.toLowerCase()
//       )?.imageUrl
//     : null;

//   if (!product) return <div>Loading...</div>;

//   return (
//     <div>
//       <h2>{product.name}</h2>

//       {/* Show image from selected color or variant fallback */}
//       {currentImage ? (
//         <img
//           src={currentImage}
//           alt={selectedColor}
//           style={{ maxWidth: "200px", marginBottom: "10px" }}
//         />
//       ) : selectedVariant?.image ? (
//         <img
//           src={selectedVariant.image}
//           alt="variant"
//           style={{ maxWidth: "200px", marginBottom: "10px" }}
//         />
//       ) : (
//         <p>Select a color to see image</p>
//       )}

//       {product.attributes.map((attr) => {
//         const availableValues = getAvailableValues(attr.name, selectedAttributes);
//         const selectedValue =
//           selectedAttributes.find((a) => a.attrName === attr.name)?.value || "";

//         return (
//           <div key={attr.id} style={{ marginBottom: "15px" }}>
//             <h4>{attr.name}</h4>
//             {attr.values.map((val) => {
//               const isAvailable = availableValues.includes(val.value);
//               return (
//                 <button
//                   key={`${attr.id}-${val.id}`}
//                   style={{
//                     margin: "5px",
//                     padding: "8px 15px",
//                     border:
//                       selectedValue === val.value ? "2px solid blue" : "1px solid gray",
//                     borderRadius: "5px",
//                     backgroundColor: selectedValue === val.value ? "#e0f0ff" : "#fff",
//                     cursor: "pointer",
//                     color: isAvailable ? "black" : "#aaa",
//                     opacity: isAvailable ? 1 : 0.5,
//                   }}
//                   onClick={() => handleAttributeChange(attr.name, val.value)}
//                 >
//                   {val.value}
//                 </button>
//               );
//             })}
//           </div>
//         );
//       })}

//       {selectedVariant ? (
//         <div style={{ marginTop: "20px" }}>
//           <h3>Selected Variant</h3>
//           <p>Price: ₹{selectedVariant.price}</p>
//           <p>Stock: {selectedVariant.stock}</p>
//         </div>
//       ) : (
//         selectedAttributes.every((a) => a.value) && (
//           <p style={{ color: "red" }}>No matching variant found.</p>
//         )
//       )}
//     </div>
//   );
// }

// export default ProductDetail;
import React, { useState, useEffect } from "react";
import API from "./api";

function ProductDetail({ productId }) {
  const [product, setProduct] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState([]); // [{ attrName, value }]
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [imagesByColor, setImagesByColor] = useState([]);

  useEffect(() => {
    API.get(`admin/products/as/${1}`).then((res) => {
      setProduct(res.data);
      const initialSelected = res.data.attributes.map((attr) => ({
        attrName: attr.name,
        value: "",
      }));
      setSelectedAttributes(initialSelected);
      setSelectedVariant(null);
    });

    API.get(`admin/products/${1}/images-by-color`).then((res) => {
      setImagesByColor(res.data);
    });
  }, [productId]);

  const findMatchingVariant = (selection) => {
    if (!product) return null;
    const lookup = {};
    selection.forEach(({ attrName, value }) => {
      if (value) lookup[attrName] = value.toLowerCase();
    });
    return product.variants.find((variant) =>
      Object.entries(lookup).every(
        ([name, val]) =>
          variant.attributes[name] &&
          variant.attributes[name].toLowerCase() === val
      )
    );
  };

  const getAvailableValues = (attrName, currentSelection) => {
    if (!product) return [];
    const filter = currentSelection.filter(
      (a) => a.attrName !== attrName && a.value
    );
    const matchingVariants = product.variants.filter((variant) =>
      filter.every(
        (a) =>
          variant.attributes[a.attrName] &&
          variant.attributes[a.attrName].toLowerCase() === a.value.toLowerCase()
      )
    );
    const valuesSet = new Set();
    matchingVariants.forEach((variant) => {
      const val = variant.attributes[attrName];
      if (val) valuesSet.add(val);
    });
    if (filter.length === 0) {
      return (
        product.attributes.find((a) => a.name === attrName)?.values.map((v) => v.value) || []
      );
    }
    return Array.from(valuesSet);
  };

  const handleAttributeChange = (attrName, value) => {
    if (!product) return;
    setSelectedAttributes((prevSelected) => {
      let updated = prevSelected.map((item) =>
        item.attrName === attrName ? { ...item, value } : item
      );
      let matchedVariant = findMatchingVariant(updated);
      if (!matchedVariant) {
        const attrOrder = updated.map((a) => a.attrName);
        for (let resetAttr of attrOrder) {
          if (resetAttr === attrName) continue;
          updated = updated.map((item) =>
            item.attrName === resetAttr ? { ...item, value: "" } : item
          );
          matchedVariant = findMatchingVariant(updated);
          if (matchedVariant) break;
        }
      }
      setSelectedVariant(matchedVariant || null);
      return updated;
    });
  };

  // === Added logic for default/general image ===
  const selectedColor = selectedAttributes.find(
    (a) => a.attrName.toLowerCase() === "color"
  )?.value;

  // If color selected, find that image, else use default image
  const currentImage = selectedColor
    ? imagesByColor.find(
        (img) => img.color.toLowerCase() === selectedColor.toLowerCase()
      )?.imageUrl
    : imagesByColor.find((img) => img.color === "default")?.imageUrl || null;
  // =========================================

  if (!product) return <div>Loading...</div>;

  return (
    <div>
      <h2>{product.name}</h2>

      {/* Show image from selected color or default or variant fallback */}
      {currentImage ? (
        <img
          src={currentImage}
          alt={selectedColor || "default"}
          style={{ maxWidth: "200px", marginBottom: "10px" }}
        />
      ) : selectedVariant?.image ? (
        <img
          src={selectedVariant.image}
          alt="variant"
          style={{ maxWidth: "200px", marginBottom: "10px" }}
        />
      ) : (
        <p>Select a color to see image</p>
      )}

      {product.attributes.map((attr) => {
        const availableValues = getAvailableValues(attr.name, selectedAttributes);
        const selectedValue =
          selectedAttributes.find((a) => a.attrName === attr.name)?.value || "";

        return (
          <div key={attr.id} style={{ marginBottom: "15px" }}>
            <h4>{attr.name}</h4>
            {attr.values.map((val) => {
              const isAvailable = availableValues.includes(val.value);
              return (
                <button
                  key={`${attr.id}-${val.id}`}
                  style={{
                    margin: "5px",
                    padding: "8px 15px",
                    border:
                      selectedValue === val.value ? "2px solid blue" : "1px solid gray",
                    borderRadius: "5px",
                    backgroundColor: selectedValue === val.value ? "#e0f0ff" : "#fff",
                    cursor: "pointer",
                    color: isAvailable ? "black" : "#aaa",
                    opacity: isAvailable ? 1 : 0.5,
                  }}
                  onClick={() => handleAttributeChange(attr.name, val.value)}
                >
                  {val.value}
                </button>
              );
            })}
          </div>
        );
      })}

      {selectedVariant ? (
        <div style={{ marginTop: "20px" }}>
          <h3>Selected Variant</h3>
          <p>Price: ₹{selectedVariant.price}</p>
          <p>Stock: {selectedVariant.stock}</p>
        </div>
      ) : (
        selectedAttributes.every((a) => a.value) && (
          <p style={{ color: "red" }}>No matching variant found.</p>
        )
      )}
    </div>
  );
}

export default ProductDetail;

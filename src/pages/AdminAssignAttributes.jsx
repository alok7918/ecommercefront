import React, { useState } from "react";
import API from "./api"; // your axios instance

export default function AttributeManager() {
  const [attributes, setAttributes] = useState([{ name: "", values: [""] }]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  function addAttribute() {
    setAttributes([...attributes, { name: "", values: [""] }]);
  }

  function removeAttribute(index) {
    setAttributes(attributes.filter((_, i) => i !== index));
  }

  function handleAttrNameChange(index, value) {
    const updated = [...attributes];
    updated[index].name = value;
    setAttributes(updated);
  }

  function addValueField(attrIndex) {
    const updated = [...attributes];
    updated[attrIndex].values.push("");
    setAttributes(updated);
  }

  function removeValueField(attrIndex, valueIndex) {
    const updated = [...attributes];
    updated[attrIndex].values = updated[attrIndex].values.filter(
      (_, i) => i !== valueIndex
    );
    setAttributes(updated);
  }

  function handleValueChange(attrIndex, valueIndex, value) {
    const updated = [...attributes];
    updated[attrIndex].values[valueIndex] = value;
    setAttributes(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const cleanedAttributes = attributes
      .filter((attr) => attr.name.trim())
      .map((attr) => ({
        name: attr.name.trim(),
        values: attr.values.map((v) => v.trim()).filter(Boolean),
      }))
      .filter((attr) => attr.values.length > 0);

    if (cleanedAttributes.length === 0) {
      setError("Add at least one attribute with values");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMsg(null);

      const res = await API.post("/api/attributes", cleanedAttributes); // call backend
      setMsg(res.data.message || "Attributes saved successfully");
      setAttributes([{ name: "", values: [""] }]);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data || "Failed to save attributes");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Create Attributes</h1>
      {error && <div className="text-red-600">{error}</div>}
      {msg && <div className="text-green-700">{msg}</div>}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-4 shadow rounded"
      >
        {attributes.map((attr, attrIndex) => (
          <div key={attrIndex} className="border p-3 rounded space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium">
                Attribute Name
              </label>
              {attributes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAttribute(attrIndex)}
                  className="text-red-500 text-sm"
                >
                  Remove Attribute
                </button>
              )}
            </div>
            <input
              className="border rounded px-2 py-1 w-full"
              value={attr.name}
              onChange={(e) =>
                handleAttrNameChange(attrIndex, e.target.value)
              }
            />

            <label className="block text-sm font-medium">Values</label>
            {attr.values.map((val, valIndex) => (
              <div key={valIndex} className="flex gap-2 items-center mt-1">
                <input
                  className="border rounded px-2 py-1 flex-1"
                  value={val}
                  onChange={(e) =>
                    handleValueChange(attrIndex, valIndex, e.target.value)
                  }
                />
                {attr.values.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeValueField(attrIndex, valIndex)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    –
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addValueField(attrIndex)}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
            >
              Add Value
            </button>
          </div>
        ))}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={addAttribute}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Add Attribute
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Save Attributes
          </button>
        </div>
      </form>

      {loading && <div className="text-sm text-gray-500">Working…</div>}
    </div>
  );
}

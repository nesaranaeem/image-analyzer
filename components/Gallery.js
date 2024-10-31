// components/Gallery.js
const Gallery = ({ images }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="my-6">
      <h2 className="text-xl font-semibold mb-4">Gallery</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((item, index) => (
          <div key={index} className="border p-2 rounded">
            <p className="mt-2 text-sm font-medium">
              File Name: {item.fileDetails?.name || "N/A"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Format: {item.fileDetails?.type || "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;

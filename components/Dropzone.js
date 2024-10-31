// components/Dropzone.js
import { useDropzone } from "react-dropzone";

const Dropzone = ({ onDrop }) => {
  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: "image/*",
      maxSize: 5000000, // Limit to 5MB
    });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed p-6 rounded cursor-pointer hover:border-blue-500 text-center
                 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-blue-500">Drop the image here...</p>
      ) : (
        <p className="text-gray-700 dark:text-gray-300">
          Drag and drop an image here, or click to select one
        </p>
      )}
      {fileRejections.length > 0 && (
        <p className="text-red-500 mt-2">
          Unsupported file type or file too large.
        </p>
      )}
    </div>
  );
};

export default Dropzone;

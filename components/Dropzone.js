// components/Dropzone.js
import { useDropzone } from "react-dropzone";
import { FaImage } from "react-icons/fa";

const Dropzone = ({ onDrop }) => {
  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: "image/*",
      maxSize: 9000000, // Limit to 9MB
    });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed p-6 rounded cursor-pointer hover:border-blue-600 text-center
                     border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 ${
                       isDragActive ? "border-blue-600" : ""
                     }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center">
        {/* Image Icon */}
        <FaImage className="text-gray-500 dark:text-gray-400 text-6xl mb-4" />
        {isDragActive ? (
          <p className="text-blue-600">Drop the image here...</p>
        ) : (
          <p className="text-gray-700 dark:text-gray-300">
            Drag and drop an image here, or click to select one
          </p>
        )}
        {/* Supported formats and max file size */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Supported formats: JPG, PNG, GIF | Max file size: 9MB
        </p>
        {fileRejections.length > 0 && (
          <p className="text-red-500 mt-2">
            Unsupported file type or file too large.
          </p>
        )}
      </div>
    </div>
  );
};

export default Dropzone;

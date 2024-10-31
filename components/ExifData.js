// components/ExifData.js
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { Buffer } from "buffer";
import PdfExporter from "./PdfExporter";
import AIDetector from "./AIDetector";

// Ensure Buffer is available
if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer;
}

// Dynamically import the react-leaflet components
const MapContainer = dynamic(
  () => import("react-leaflet").then((module) => module.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((module) => module.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((module) => module.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((module) => module.Popup),
  { ssr: false }
);

// Import marker images
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const ExifData = ({ exifData, fileDetails, colors, siteName, imageSrc }) => {
  const [locationName, setLocationName] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [L, setL] = useState(null);

  // Dynamically import Leaflet and fix the marker images
  useEffect(() => {
    (async () => {
      const leaflet = await import("leaflet");
      // Fix for broken marker images
      delete leaflet.Icon.Default.prototype._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x.src,
        iconUrl: markerIcon.src,
        shadowUrl: markerShadow.src,
      });
      setL(leaflet);
    })();
  }, []);

  // Convert DMS to Decimal
  const dmsToDecimal = (dms, ref) => {
    const [degrees, minutes, seconds] = dms;
    const decimal = degrees + minutes / 60 + seconds / 3600;
    return ref === "S" || ref === "W" ? -decimal : decimal;
  };

  // Format GPS coordinates
  const latitude = exifData?.GPSLatitude
    ? dmsToDecimal(exifData.GPSLatitude, exifData.GPSLatitudeRef)
    : null;
  const longitude = exifData?.GPSLongitude
    ? dmsToDecimal(exifData.GPSLongitude, exifData.GPSLongitudeRef)
    : null;

  // Fetch location name
  useEffect(() => {
    if (latitude && longitude) {
      setLocationLoading(true);
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      )
        .then((response) => response.json())
        .then((data) => {
          setLocationName(data.address?.city || data.display_name);
          setLocationLoading(false);
        })
        .catch(() => {
          setLocationName("Location not found");
          setLocationLoading(false);
        });
    }
  }, [latitude, longitude]);

  const formatBytes = (bytes) => {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const dm = 2;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  // Function to format date strings
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Function to format Camera Settings
  const formatCameraSettings = (settings) => {
    try {
      const parsedSettings = JSON.parse(settings);
      return Object.entries(parsedSettings)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    } catch {
      return settings || "N/A";
    }
  };

  // Function to format Unique Image ID
  const formatUniqueImageID = (id) => {
    if (typeof id === "object") {
      const byteArray = Object.values(id);
      const hexString = byteArray
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
      return `0x${hexString}`;
    }
    return id || "N/A";
  };

  // Function to format keys by inserting spaces before capital letters
  const formatKey = (key) => {
    return key.replace(/([a-z])([A-Z])/g, "$1 $2");
  };

  // Map numeric EXIF tag keys to human-readable names
  const exifTagNames = {
    34965: "Interoperability Index",
    34970: "GPS Info",
    39321: "Camera Settings",
    39424: "Camera Model",
    39594: "Unique Image ID",
    42593: "Image Unique ID",
    // Add more mappings as needed
  };

  // Filter and map exifData to an array of {key, value}
  const exifEntries = exifData
    ? Object.entries(exifData)
        .map(([key, value]) => {
          let displayKey = key;
          let displayValue = value;

          if (!isNaN(key)) {
            displayKey = exifTagNames[key] || `Unknown Tag (${key})`;
          }

          // Format the key to have spaces
          displayKey = formatKey(displayKey);

          if (
            key === "CreateDate" ||
            key === "DateTimeOriginal" ||
            key === "ModifyDate"
          ) {
            displayValue = value ? formatDate(value) : "N/A";
          } else if (key === "39321" || key === "Camera Settings") {
            displayValue = value ? formatCameraSettings(value) : "N/A";
          } else if (key === "39594" || key === "Unique Image ID") {
            displayValue = value ? formatUniqueImageID(value) : "N/A";
          } else if (typeof value === "object" && value !== null) {
            displayValue = JSON.stringify(value);
          } else if (value === null || value === undefined) {
            displayValue = "N/A";
          }

          return { key: displayKey, value: displayValue };
        })
        // Exclude items with large values
        .filter((item) => {
          const valueLength = item.value ? item.value.toString().length : 0;
          return valueLength < 100;
        })
    : [];

  // Prepare location data for PDF export
  const locationData = {
    latitude,
    longitude,
    locationName,
  };

  // Add formatted file size
  const fileDetailsWithSize = {
    ...fileDetails,
    sizeFormatted: formatBytes(fileDetails?.size),
  };

  // Function to convert RGB to Hex
  const rgbToHex = (rgbArray) => {
    return (
      "#" +
      rgbArray
        .map((value) => {
          const hex = value.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  return (
    <div className="my-6">
      {/* PDF Export Button */}
      <PdfExporter
        exifEntries={exifEntries}
        fileDetails={fileDetailsWithSize}
        colors={colors}
        siteName={siteName}
        imageSrc={imageSrc}
        locationData={locationData}
      />

      {/* Content */}
      <div
        id="report-content"
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
      >
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
          Image Details
        </h2>

        {/* Display the preview image inside a card */}
        {imageSrc && (
          <div className="mb-6 flex justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-4">
              <img
                src={imageSrc}
                alt="Uploaded Preview"
                className="max-w-full h-auto rounded-lg"
                style={{ maxHeight: "400px", backgroundColor: "#f9f9f9" }}
              />
            </div>
          </div>
        )}

        {/* Main Colors Card */}
        {colors && colors.length > 0 && (
          <div className="mb-6 flex justify-center">
            <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-4">
              <strong className="text-gray-800 dark:text-white block text-center">
                Main Colors:
              </strong>
              <div className="flex space-x-2 mt-2 justify-center">
                {colors.map((color, index) => {
                  const hexColor = rgbToHex(color);
                  return (
                    <div
                      key={index}
                      className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                      style={{
                        backgroundColor: hexColor,
                      }}
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(hexColor);
                          alert(`Copied: ${hexColor}`);
                        } catch (err) {
                          alert("Failed to copy color code.");
                        }
                      }}
                      title={`Click to copy ${hexColor}`}
                    ></div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Image Dimensions Card */}
        {fileDetails?.width && fileDetails?.height && (
          <div className="mb-6 flex justify-center">
            <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-4">
              <strong className="text-gray-800 dark:text-white block text-center">
                Image Dimensions:
              </strong>
              <div className="mt-2 text-gray-700 dark:text-gray-300 text-center">
                {fileDetails.width} x {fileDetails.height} pixels
              </div>
            </div>
          </div>
        )}

        {/* AI Detection Component */}
        <AIDetector imageSrc={imageSrc} />

        {/* Grid layout for info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fileDetails?.name && (
            <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-4">
              <strong className="text-gray-800 dark:text-white">
                File Name:
              </strong>{" "}
              <span className="text-gray-700 dark:text-gray-300">
                {fileDetails.name}
              </span>
            </div>
          )}
          {fileDetails?.size && (
            <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-4">
              <strong className="text-gray-800 dark:text-white">
                File Size:
              </strong>{" "}
              <span className="text-gray-700 dark:text-gray-300">
                {formatBytes(fileDetails.size)}
              </span>
            </div>
          )}
          {fileDetails?.type && (
            <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-4">
              <strong className="text-gray-800 dark:text-white">Format:</strong>{" "}
              <span className="text-gray-700 dark:text-gray-300">
                {fileDetails.type}
              </span>
            </div>
          )}
          {latitude && longitude && (
            <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-4">
              <strong className="text-gray-800 dark:text-white">
                Location:
              </strong>{" "}
              <span className="text-gray-700 dark:text-gray-300">
                {locationLoading
                  ? "Fetching location..."
                  : locationName || "N/A"}
              </span>
            </div>
          )}
        </div>

        {/* Map Container */}
        {latitude && longitude && L && typeof window !== "undefined" && (
          <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-4 my-6 flex justify-center">
            <div className="w-full md:w-3/4">
              <h3 className="text-xl font-semibold mb-2 text-center text-gray-800 dark:text-white">
                Location on Map
              </h3>
              <MapContainer
                center={[latitude, longitude]}
                zoom={13}
                style={{ height: "300px", width: "100%" }}
                className="rounded-lg shadow-lg"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <Marker position={[latitude, longitude]}>
                  <Popup>{locationName || "Location coordinates"}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* Remaining EXIF Data */}
        {exifEntries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {exifEntries.map(({ key, value }) => (
              <div
                className="bg-white dark:bg-gray-800 rounded shadow-lg p-4"
                key={key}
              >
                <strong className="text-gray-800 dark:text-white">
                  {key}:
                </strong>{" "}
                <span className="text-gray-700 dark:text-gray-300">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExifData;

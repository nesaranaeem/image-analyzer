// pages/index.js
import { useState, useEffect } from "react";
import Head from "next/head";
import exifr from "exifr";
import ExifData from "../components/ExifData";
import Loader from "../components/Loader";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Dropzone from "../components/Dropzone";
import ColorThief from "colorthief";
import InfoModal from "../components/InfoModal";

const IndexPage = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [exifData, setExifData] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageTitle, setPageTitle] = useState("Image Analyzer");
  const [showModal, setShowModal] = useState(false);
  const siteName = "Image Analyzer";

  // New function to reset the state
  const resetState = () => {
    setImageSrc(null);
    setExifData(null);
    setFileDetails(null);
    setColors([]);
    setPageTitle("Image Analyzer");
  };

  // Check if it's the user's first visit
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasVisited = localStorage.getItem("hasVisited");
      if (!hasVisited) {
        setShowModal(true);
        localStorage.setItem("hasVisited", "true");
      }
    }
  }, []);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    setLoading(true);
    setPageTitle("Loading...");

    reader.onload = async () => {
      const base64 = reader.result.toString();
      setImageSrc(base64);

      try {
        // Extract EXIF data with all tags
        const exif = await exifr.parse(file, { all: true });
        setExifData(exif);

        // Load image to get dimensions and extract colors
        const imageLoadPromise = new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.src = base64;
          img.onload = () => {
            const width = img.width;
            const height = img.height;

            // Extract colors using ColorThief
            const colorThief = new ColorThief();
            setTimeout(() => {
              try {
                const dominantColor = colorThief.getColor(img);
                const palette = colorThief.getPalette(img, 5);
                setColors([dominantColor, ...palette]);
              } catch (err) {
                console.error("Color extraction error:", err);
              }
            }, 500);

            resolve({ width, height });
          };
          img.onerror = reject;
        });

        const { width, height } = await imageLoadPromise;

        // Set file details after EXIF data and image dimensions are ready
        setFileDetails({
          name: file.name,
          size: file.size,
          type: file.type,
          width: width,
          height: height,
        });

        // Update page title
        setPageTitle(`Details for ${file.name}`);
      } catch (error) {
        alert(error.message || "Error processing image. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
        <Header />
        <main className="flex-grow p-4">
          {/* Show Dropzone if no image is uploaded */}
          {!imageSrc && <Dropzone onDrop={onDrop} />}

          {loading && <Loader />}

          {/* Show ExifData and Reset button if image is uploaded */}
          {imageSrc && (
            <>
              {/* Reset Button */}
              <div className="flex justify-center mt-2">
                <button
                  onClick={resetState}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                >
                  Reset
                </button>
              </div>

              <ExifData
                exifData={exifData}
                fileDetails={fileDetails}
                colors={colors}
                siteName={siteName}
                imageSrc={imageSrc}
              />
            </>
          )}
        </main>
        <Footer />

        {/* Info Modal */}
        {showModal && <InfoModal setShowModal={setShowModal} />}
      </div>
    </>
  );
};

export default IndexPage;

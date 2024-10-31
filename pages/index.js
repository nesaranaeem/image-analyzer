// pages/index.js
import { useState } from "react";
import Head from "next/head";
import exifr from "exifr";
import ExifData from "../components/ExifData";
import Loader from "../components/Loader";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Dropzone from "../components/Dropzone";
import ColorThief from "colorthief";

const IndexPage = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [exifData, setExifData] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageTitle, setPageTitle] = useState("Image Insight");
  const siteName = "Image Insight";

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

        // Set file details after EXIF data is ready
        setFileDetails({
          name: file.name,
          size: file.size,
          type: file.type,
        });

        // Extract colors using ColorThief
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = base64;
        img.onload = () => {
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
        };

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
          <Dropzone onDrop={onDrop} />

          {loading && <Loader />}

          {exifData && (
            <ExifData
              exifData={exifData}
              fileDetails={fileDetails}
              colors={colors}
              siteName={siteName}
              imageSrc={imageSrc}
            />
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default IndexPage;

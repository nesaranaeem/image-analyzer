// components/ColorAnalysis.js
import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

const ColorAnalysis = ({ imageSrc, colors }) => {
  const [colorData, setColorData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const analyzeColors = () => {
      if (!imageSrc) return;

      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imageSrc;

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          const colorCounts = {};
          const totalPixels = data.length / 4;

          // Count colors (simplified to get dominant colors)
          for (let i = 0; i < data.length; i += 4) {
            const rgb = `${data[i]},${data[i + 1]},${data[i + 2]}`;
            colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
          }

          const sortedColors = Object.entries(colorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 7);

          const labels = sortedColors.map((item) =>
            rgbToHex(item[0].split(",").map(Number))
          );
          const counts = sortedColors.map((item) =>
            ((item[1] / totalPixels) * 100).toFixed(2)
          );

          setColorData({
            labels,
            datasets: [
              {
                label: "Color Distribution (%)",
                data: counts,
                backgroundColor: labels,
              },
            ],
          });
        } catch (err) {
          console.error("Error during color analysis:", err);
          setError("Failed to analyze image colors.");
        }
      };

      img.onerror = () => {
        console.error("Failed to load image for color analysis.");
        setError("Failed to load image for color analysis.");
      };
    };

    analyzeColors();
  }, [imageSrc]);

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
    <div className="mb-6 flex flex-col items-center">
      {/* Color Graph */}
      {error ? (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-6 w-full md:w-3/4">
          {error}
        </div>
      ) : colorData ? (
        <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-4 w-full md:w-3/4 mb-6 max-w-md md:max-w-lg">
          <strong className="text-gray-800 dark:text-white block text-center mb-4">
            Color Distribution Graph
          </strong>
          <div className="w-3/4 mx-auto">
            {" "}
            {/* Set 75% width and center align */}
            <Pie
              data={colorData}
              options={{
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      boxWidth: 20,
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const label = context.label || "";
                        const value = context.parsed || 0;
                        return `${label}: ${value}%`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      ) : (
        <div className="text-gray-700 dark:text-gray-300">
          Loading color analysis...
        </div>
      )}

      {/* Main Colors Card */}
      {colors && colors.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-4 w-full md:w-3/4 max-w-md md:max-w-lg">
          <strong className="text-gray-800 dark:text-white block text-center">
            Main Colors
          </strong>
          <div className="flex flex-wrap space-x-2 mt-2 justify-center">
            {colors.map((color, index) => {
              const hexColor = rgbToHex(color);
              return (
                <div
                  key={index}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300 m-1"
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
      )}
    </div>
  );
};

export default ColorAnalysis;

// components/AIDetector.js
import { useEffect, useState } from "react";
import * as nsfwjs from "nsfwjs";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const AIDetector = ({ imageSrc }) => {
  const [prediction, setPrediction] = useState(null);
  const [probability, setProbability] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const analyzeImage = async () => {
      setLoading(true);

      try {
        // Load the NSFWJS model
        const model = await nsfwjs.load();

        // Create an image element
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageSrc;

        img.onload = async () => {
          // Classify the image
          const predictions = await model.classify(img);

          // Check if the image is likely AI-generated based on the 'Hentai' class
          // This is a placeholder; NSFWJS doesn't specifically detect AI images
          const aiPrediction = predictions.find(
            (p) => p.className === "Hentai"
          );

          if (aiPrediction) {
            const aiProbability = Math.round(aiPrediction.probability * 100);
            setPrediction("Possibly AI-generated");
            setProbability(aiProbability);
          } else {
            setPrediction("Not AI-generated");
            setProbability(0);
          }

          setLoading(false);
        };

        img.onerror = (error) => {
          console.error("Image failed to load:", error);
          setLoading(false);
          setPrediction(null);
          setProbability(0);
        };
      } catch (error) {
        console.error("Error in AI Detector:", error);
        setPrediction(null);
        setProbability(0);
        setLoading(false);
      }
    };

    if (imageSrc) {
      analyzeImage();
    }
  }, [imageSrc]);

  return (
    <div className="mb-6 flex justify-center">
      <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-4 w-full md:w-1/2">
        {/* Heading with Experimental/Beta Tag */}
        <div className="flex items-center justify-center mb-4">
          <strong className="text-gray-800 dark:text-white text-center mr-2">
            AI Generation Probability
          </strong>
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
            Experimental/Beta
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center">
            <div className="text-center text-gray-700 dark:text-gray-300">
              <strong>Detecting AI...</strong>
            </div>
          </div>
        ) : prediction ? (
          <div className="flex flex-col items-center">
            {/* Meter Component */}
            <div style={{ width: 150, height: 150 }}>
              <CircularProgressbar
                value={probability}
                text={`${probability}%`}
                styles={buildStyles({
                  textSize: "16px",
                  textColor: "#000",
                  pathColor:
                    prediction === "Possibly AI-generated"
                      ? "#f56565"
                      : "#48bb78",
                  trailColor: "#d9d9d9",
                  animationDuration: 1.5,
                  pathTransition: "stroke-dashoffset 1.5s ease 0s",
                })}
              />
            </div>
            <div className="text-center text-gray-700 dark:text-gray-300 mt-4">
              {probability}% chance this image is {prediction}.
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-700 dark:text-gray-300">
            Unable to analyze the image.
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDetector;

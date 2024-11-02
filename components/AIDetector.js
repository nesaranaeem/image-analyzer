// components/AIDetector.js
import { useEffect, useState } from "react";
import "react-circular-progressbar/dist/styles.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { FaInfoCircle } from "react-icons/fa"; // For the info icon
import Tooltip from "rc-tooltip"; // For the tooltip
import "rc-tooltip/assets/bootstrap.css";
import * as nsfwjs from "nsfwjs";

// Dynamically import Tesseract.js to use only on the client-side
const loadTesseract = () => import("tesseract.js");

const AIDetector = ({ imageSrc }) => {
  const [prediction, setPrediction] = useState(null);
  const [probability, setProbability] = useState(0);
  const [loading, setLoading] = useState(false);

  const [extractedText, setExtractedText] = useState("");
  const [textLoading, setTextLoading] = useState(false);
  const [ocrError, setOcrError] = useState(null);
  const [progress, setProgress] = useState(0); // For progress tracking
  const [textDetected, setTextDetected] = useState(null); // For Yes/No indicator

  // AI Detection using nsfwjs
  useEffect(() => {
    const analyzeImage = async () => {
      setLoading(true);

      try {
        const model = await nsfwjs.load();

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageSrc;

        img.onload = async () => {
          try {
            const predictions = await model.classify(img);

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
          } catch (error) {
            console.error("Error during AI classification:", error);
            setPrediction(null);
            setProbability(0);
          } finally {
            setLoading(false);
          }
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

  // Text extraction using Tesseract.js
  useEffect(() => {
    const extractText = async () => {
      setOcrError(null);
      setExtractedText("");
      setProgress(0);
      setTextLoading(true);
      setTextDetected(null);

      try {
        const Tesseract = await loadTesseract();
        const { createWorker } = Tesseract;

        const worker = createWorker({
          logger: (m) => {
            if (m.status === "recognizing text") {
              setProgress(Math.floor(m.progress * 100));
            }
          },
        });

        await worker.load();
        await worker.loadLanguage("eng+ben+ara+spa");
        await worker.initialize("eng+ben+ara+spa");

        const { data } = await worker.recognize(imageSrc);

        if (data && data.text) {
          const text = data.text.trim();
          const averageConfidence =
            data.words?.reduce((sum, word) => sum + word.confidence, 0) /
            (data.words?.length || 1);

          if (text.length >= 15 && averageConfidence >= 70) {
            setExtractedText(text);
            setTextDetected(true); // Text detected
          } else {
            setOcrError("No text found.");
            setTextDetected(false); // No text detected
          }
        } else {
          setOcrError("No text found.");
          setTextDetected(false); // No text detected
        }

        await worker.terminate();
      } catch (error) {
        console.error("Error during OCR processing:", error);
        setOcrError("Unable to extract text.");
        setTextDetected(false); // No text detected
      } finally {
        setTextLoading(false);
        setProgress(100);
      }
    };

    if (imageSrc) {
      extractText();
    }
  }, [imageSrc]);

  return (
    <div className="flex flex-col justify-center items-center mb-2 w-full">
      {/* AI Detection Component */}
      <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-4 w-full md:w-1/2 mb-4">
        <div className="flex items-center justify-center mb-4">
          <strong className="text-gray-800 dark:text-white text-center mr-2">
            AI Generation Probability
          </strong>
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center">
            Experimental/Beta
            <Tooltip
              placement="top"
              overlay={
                <span>
                  This is an experimental feature; accuracy not guaranteed.
                </span>
              }
            >
              <FaInfoCircle className="ml-1 cursor-pointer" />
            </Tooltip>
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center">
            <div className="text-center text-gray-700 dark:text-gray-300">
              <strong>Analyzing image...</strong>
            </div>
          </div>
        ) : prediction ? (
          <div className="flex flex-col items-center">
            <div style={{ width: 100, height: 100 }}>
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

      {/* Text Extraction Section */}
      <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-4 w-full md:w-1/2 mb-4">
        <div className="flex items-center justify-center mb-2">
          <strong className="text-gray-800 dark:text-white text-center mr-2">
            Is there any text?
          </strong>
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center">
            OCR
            <Tooltip
              placement="top"
              overlay={
                <span>
                  Upload clean, readable images to get more accurate results. We
                  are not responsible for any incorrect text.
                </span>
              }
            >
              <FaInfoCircle className="ml-1 cursor-pointer" />
            </Tooltip>
          </span>
        </div>

        {/* Yes/No Indicator */}
        {textDetected !== null && (
          <div className="flex justify-center mb-4">
            {textDetected ? (
              <span className="bg-green-500 text-white text-sm px-3 py-1 rounded">
                Yes
              </span>
            ) : (
              <span className="bg-red-500 text-white text-sm px-3 py-1 rounded">
                No
              </span>
            )}
          </div>
        )}

        {textLoading ? (
          <div className="flex flex-col items-center">
            <strong className="text-center text-gray-700 dark:text-gray-300 mb-2">
              Processing image...
            </strong>
            <div style={{ width: 100, height: 100 }}>
              <CircularProgressbar
                value={progress}
                text={`${progress}%`}
                styles={buildStyles({
                  textSize: "16px",
                  textColor: "#000",
                  pathColor: "#3490dc",
                  trailColor: "#d9d9d9",
                })}
              />
            </div>
          </div>
        ) : extractedText ? (
          <div
            className="text-center text-gray-700 dark:text-gray-300 whitespace-pre-wrap mt-4"
            style={{
              fontFamily:
                "'Noto Sans', 'Noto Sans Bengali', 'Noto Sans Arabic', sans-serif",
            }}
          >
            {extractedText}
          </div>
        ) : ocrError ? (
          <div className="text-center text-gray-700 dark:text-gray-300">
            {ocrError}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AIDetector;

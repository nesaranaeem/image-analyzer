// utils/analyzeImage.js
import axios from "axios";

export const analyzeImage = async (imageFile) => {
  try {
    const response = await axios({
      method: "post",
      url: "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
      data: imageFile,
      headers: {
        Authorization: `Bearer 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`,
        "Content-Type": "application/octet-stream",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error analyzing image:",
      error.response ? error.response.data : error
    );
    throw new Error(
      error.response?.data?.error || "Error analyzing image. Please try again."
    );
  }
};

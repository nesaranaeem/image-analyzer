// utils/extractColors.js
import ColorThief from "colorthief";

export const extractColors = (imageSrc) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;

    img.onload = () => {
      const colorThief = new ColorThief();
      const palette = colorThief.getPalette(img, 5);
      resolve(palette);
    };
  });
};

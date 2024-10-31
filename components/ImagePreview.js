// components/ImagePreview.js
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

const ImagePreview = ({ imageSrc }) => (
  <div className="my-4">
    <Zoom>
      <img
        src={imageSrc}
        alt="Uploaded"
        className="max-w-full h-auto rounded-md"
      />
    </Zoom>
  </div>
);

export default ImagePreview;

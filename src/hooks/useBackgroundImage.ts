import { useEffect, useState } from "react";
import backgroundImageSrc from "../assets/background.jpg";

export function useBackgroundImage() {
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = backgroundImageSrc;
    img.onload = () => {
      setBackgroundImage(img);
    };
  }, []);

  return backgroundImage;
}
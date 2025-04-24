import React from "react";
import { ScrollView, Image } from "react-native";
import imageMap from "@/data/imageMap";

const ImageCarousel = ({ imagePaths }) => {
  return (
    <ScrollView horizontal className="my-2">
      {imagePaths.map((img, idx) => {
        const localImage = imageMap[img];
        if (!localImage) return null; // optional fallback
        return (
          <Image
            key={idx}
            source={localImage}
            className="w-40 h-40 mr-2 rounded-2xl"
            resizeMode="cover"
          />
        );
      })}
    </ScrollView>
  );
};

export default ImageCarousel;

import { IKImage } from "imagekitio-react";

const Image = ({ src, className, w, h, alt }) => {
  if (!src) {
    return null;
  }

  // --- NEW LOGIC: Check if the src is a full URL ---
  if (src.startsWith("http")) {
    // If it's a full URL (like from Clerk), use a standard <img> tag
    return (
      <img
        src={src}
        className={className}
        width={w}
        height={h}
        alt={alt || "image"}
        loading="lazy"
      />
    );
  }

  // Otherwise, use the ImageKit component for internal uploads
  return (
    <IKImage
      urlEndpoint={import.meta.env.VITE_IK_URL_ENDPOINT}
      path={src}
      className={className}
      loading="lazy"
      lqip={{ active: true, quality: 20 }}
      alt={alt}
      width={w}
      height={h}
      transformation={[
        {
          width: w,
          height: h,
        },
      ]}
    />
  );
};

export default Image;
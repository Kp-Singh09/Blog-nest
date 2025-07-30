import { IKImage } from "imagekitio-react";

const Image = ({ src, className, w, h, alt }) => {
  if (!src) {
    return null;
  }

  // If the image is the logo, use a standard <img> tag to load it from the public folder.
  if (src === 'logo.png') {
    return (
      <img
        src={`/${src}`}
        className={className}
        width={w}
        height={h}
        alt={alt || ""}
      />
    );
  }

  // For all other images, use ImageKit.
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
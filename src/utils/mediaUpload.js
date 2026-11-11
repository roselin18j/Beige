const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const videoTypes = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
  "video/x-msvideo",
  "video/x-matroska",
  "video/3gpp",
]);

const videoExtensions = /\.(mp4|mov|webm|m4v|avi|mkv|3gp)$/i;
const imageExtensions = /\.(jpe?g|png|webp)$/i;

export const isVideoFile = (file) =>
  Boolean(file && (file.type.startsWith("video/") || videoExtensions.test(file.name)));

export const validateMediaFile = (file) => {
  if (!file) return "Choose an image or video to continue.";

  const isVideo = isVideoFile(file);
  const validType = isVideo
    ? videoTypes.has(file.type) || videoExtensions.test(file.name)
    : imageTypes.has(file.type) || imageExtensions.test(file.name);

  if (!validType) return "Use a JPG, PNG, WEBP image or MP4, MOV, WEBM, M4V, AVI or MKV video.";
  if (file.size > (isVideo ? 50 : 10) * 1024 * 1024) {
    return isVideo ? "Video must be 50 MB or smaller." : "Image must be 10 MB or smaller.";
  }

  return "";
};

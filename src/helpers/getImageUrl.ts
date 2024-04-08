const getImageUrl = (initialImage: string | null) => {
  return initialImage
    ? `${process.env.ASSETS_URL}${initialImage}`
    : initialImage;
};

export default getImageUrl;

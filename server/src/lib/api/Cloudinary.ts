import cloudinary from "cloudinary";

export const Cloudinary = {
  upload: async (image: string) => {
    try {
      const res = await cloudinary.v2.uploader.upload(image, {
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET,
        cloud_name: process.env.CLOUDINARY_NAME,
        folder: "stay-mock",
      });

      return res.secure_url;
    } catch (error) {
      throw new Error(`There was an error uploading to Cloudinary ${error}`);
    }
  },
};

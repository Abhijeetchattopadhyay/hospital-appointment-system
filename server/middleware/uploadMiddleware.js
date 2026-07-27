import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExts = /jpg|jpeg|png|webp|pdf/;
  const allowedMimeTypes = /image\/jpeg|image\/png|image\/webp|application\/pdf/;

  const extName = allowedExts.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimeType = allowedMimeTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, jpeg, png, webp) and PDF files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter
});

export default upload;
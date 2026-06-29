import multer from "multer";
import path from "path";
import crypto from "crypto";

const storage = multer.memoryStorage();

const upload = multer({
    storage,

    fileFilter: (req, file, cb) => {
       
        const allowed = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "application/pdf",
            "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("File type not supported"), false);
        }
    },

    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },
});

// Generate a unique Cloudinary public_id
export function generatePublicId(originalname) {
  const ext = path.extname(originalname);

  const baseName = path
    .basename(originalname, ext)
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "");

  const randomId = crypto.randomBytes(16).toString("hex");

  return `${baseName}_${randomId}`;
}

export default upload;
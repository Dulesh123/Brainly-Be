


import { DataModel } from "../db/db_schema.js";
import { generatePublicId } from "../middlewares/Multer.js";
import cloudinary from "../config/Cloudinaryconfig.js";
import path from "path";

export default async function Uploadfile(req, res) {
  try {
    const { title, datatype } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const publicId = generatePublicId(req.file.originalname);

    console.log({
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    let options = {
      public_id: publicId,
      overwrite: true,
    };

    // Images
    if (req.file.mimetype.startsWith("image/")) {
      options.resource_type = "image";
    }

    // PDF
    else if (req.file.mimetype === "application/pdf") {
      options.resource_type = "raw";
      options.filename_override = req.file.originalname;
      options.use_filename = true;
      options.unique_filename = false;
    }

    // Other files (docx, txt...)
    else {
      options.resource_type = "raw";
      options.filename_override = req.file.originalname;
      options.use_filename = true;
      options.unique_filename = false;
    }

    const cloudinaryResult = await new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      upload.end(req.file.buffer);
    });

    console.log(cloudinaryResult);

    const savedFile = await DataModel.create({
      userId: req.user.id,
      title,
      datatype,
      link: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
      resource_type: cloudinaryResult.resource_type,
    });

    return res.status(201).json({
      success: true,
      file: savedFile,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
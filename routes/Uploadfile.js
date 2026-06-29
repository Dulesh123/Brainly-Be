import { DataModel } from "../db/db_schema.js";
import { generatePublicId } from "../middlewares/Multer.js";
import cloudinary from "../config/Cloudinaryconfig.js";


export default async  function Uploadfile(req,res){
    const {title,datatype}=req.body;
     try {

        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }

        const publicId = generatePublicId(req.file.originalname);
        console.log(publicId)
const cloudinaryResult = await new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    {
      resource_type: "raw",
      type: "upload",
      access_mode: "public",
      public_id: publicId,
      format: "pdf",
    },
    (error, result) => {
      if (error) reject(error);
      else resolve(result);
    }
  );

  stream.end(req.file.buffer);
});

console.log({
  resource_type: cloudinaryResult.resource_type,
  format: cloudinaryResult.format,
  bytes: cloudinaryResult.bytes,
  secure_url: cloudinaryResult.secure_url,
  public_id: cloudinaryResult.public_id,
});

        // Save to MongoDB
        const savedFile = await DataModel.create({
            userId:req.user.id,
            title:title,
            datatype:datatype,
            link: cloudinaryResult.secure_url,
           
        });

        res.status(201).json({
            success: true,
            file: savedFile
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

}
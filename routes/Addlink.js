import {DataModel} from "../db/db_schema.js";

export default async function AddLink(req, res) {
  try {
    const { link,  title } = req.body;
    const { datatype } = req.body;

    const userId = req.user.id;

    if (!title || !link) {
      return res.status(400).json({
        message: "Title and link are required",
      });
    }

    if (datatype !== "link") {
        console.log(datatype.type)
      return res.status(400).json({
        message: "Invalid datatype",
      });
    }

    const data = await DataModel.create({
      userId,
      title: title.trim(),
      link: link.trim(),
      datatype,
    });

    return res.status(201).json({
      message: "Link added successfully",
      data,
    });
  } catch (error) {
    console.error("AddLink Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
import { DataModel } from "../db/db_schema.js";

export default async function GetAllData(req, res) {
  try {
    const userId = req.user.id;

    const data = await DataModel.find({
      userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("GetAllData Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
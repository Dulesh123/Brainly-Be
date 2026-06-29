import { DataModel } from "../db/db_schema.js";

export default async function Deleteitem(req, res) {
  try {
    const id = req.query.id;


    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    const response = await DataModel.deleteOne({ _id: id });

    if (response.deletedCount === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json({ message: "Item deleted successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
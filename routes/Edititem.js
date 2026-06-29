import { DataModel } from "../db/db_schema.js";

export default async function Edititem(req, res) {
  try {
    const id = req.query.id;
    const { title, link } = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    if (!title && !link) {
      return res.status(400).json({ message: "At least one field (title or link) is required" });
    }

    const response = await DataModel.updateOne(
      { _id: id },              // filter — which document to update
      { $set: { title, link } } // update — what to change
    );

    if (response.matchedCount === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json({ message: "Item updated successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
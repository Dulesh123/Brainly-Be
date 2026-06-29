import mongoose from "mongoose";
import { Schema } from "mongoose";

const UserSchema = new Schema({
  f_name:    { type: String, required: true },
  l_name:    { type: String, default: "" },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, default: null },   // null for Google users
  googleid:  { type: String, default: null },   // null for email users
  provider:  { type: String, enum: ["email", "google"], default: "email" },
  resettoken:{type:String,default:""},
  resettokenexpiry:{type:Date}
}, { timestamps: true }
);

const DataSchema = new Schema(
  {
    // Owner
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Basic Info
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // Resource Type
    datatype: {
      type: String,
      enum: ["pdf", "image", "link"],
      required: true,
    },

    // URL of cloud file or external link
    link: {
      type: String,
      required: true,
    },

  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);



 export const UserModel=mongoose.model('users',UserSchema);
 export const DataModel=mongoose.model("Data", DataSchema);



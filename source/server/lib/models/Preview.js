import mongoose, { Schema } from "mongoose";

mongoose.Promise = global.Promise;

const PreviewSchema = Schema({
  image: Object,
  creating: { type:Boolean, default:false }
});

const Preview = mongoose.model("previews", PreviewSchema, "previews");

export default Preview;

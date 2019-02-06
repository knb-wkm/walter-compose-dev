import mongoose, { Schema } from "mongoose";

mongoose.Promise = global.Promise;

const DirSchema = Schema({
  ancestor: [{ type:Schema.Types.ObjectId, ref:'files'}],
  descendant: Schema.Types.ObjectId,
  depth: Number
});

const Dir = mongoose.model("dirs", DirSchema, "dirs");

export default Dir;

import mongoose, { Schema } from "mongoose";

mongoose.Promise = global.Promise;

const ActionSchema = Schema({
  label: Schema.Types.String,
  name: Schema.Types.String
});

const Action = mongoose.model("actions", ActionSchema, "actions");

export default Action;

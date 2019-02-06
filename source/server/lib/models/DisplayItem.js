import mongoose, { Schema } from "mongoose";

mongoose.Promise = global.Promise;

const DisplayItemSchema = Schema({
  tenant_id: Schema.Types.ObjectId,
  meta_info_id: Schema.Types.ObjectId,
  label: String,
  name: String,
  value_type: String,
  is_display: Boolean,
  is_excel: Boolean,
  width: String,
  order: Number,
  default_sort: Schema.Types.Mixed
});

const DisplayItem = mongoose.model(
  "display_items", DisplayItemSchema, "display_items"
);

export default DisplayItem;

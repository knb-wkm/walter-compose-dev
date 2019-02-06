import mongoose, { Schema } from "mongoose";

mongoose.Promise = global.Promise;

const TenantSchema = Schema({
  name: String,
  home_dir_id: Schema.Types.ObjectId,
  trash_dir_id: Schema.Types.ObjectId,
  threshold: Schema.Types.Number
});

const Tenant = mongoose.model("tenants", TenantSchema, "tenants");
export default Tenant;

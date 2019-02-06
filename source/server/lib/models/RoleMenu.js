import mongoose, { Schema } from "mongoose";

mongoose.Promise = global.Promise;

const RoleMenuSchema = Schema({
  name: String,
  description: String,
  menus: Array,
  tenant_id: Schema.Types.ObjectId
});

const RoleMenu = mongoose.model("role_menus", RoleMenuSchema, "role_menus");

export default RoleMenu;

import mongoose, { Schema } from "mongoose";

mongoose.Promise = global.Promise;

const MenuSchema = Schema({
  label: Schema.Types.String,
  name: Schema.Types.String
});

const Menu = mongoose.model("menus", MenuSchema, "menus");

export default Menu;

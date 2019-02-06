import mongoose, { Schema } from "mongoose";

mongoose.Promise = global.Promise;

const NotificationSchema = Schema({
  users: { type:Schema.Types.ObjectId, ref:'users'},
  read: Boolean ,
  title: String ,
  body: String ,
  create: { type:Date, default: Date.now },
  modified: { type: Date, default: Date.now }

});

const Notification = mongoose.model("notifications", NotificationSchema, "notifications");

export default Notification;
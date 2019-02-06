import mongoose from "mongoose";
import co from "co";
import moment from "moment";

// models
import User from "../models/User";
import Notification from "../models/Notification";

// constants
import * as constants from "../configs/constants";

// etc
import { isEmpty } from "lodash";
import logger from "../logger";
import {
  ValidationError,
  RecordNotFoundException,
  PermisstionDeniedException
} from "../errors/AppError";

const { ObjectId } = mongoose.Types;

export const index = (req, res, next) => {
  co(function*(){
    try {

      const { tenant_id } = res.user;

      const notifications = yield User.aggregate([
        { $match: { tenant_id: tenant_id }},
        { $lookup: {
            from: "notifications",
            localField: "_id",
            foreignField: "users",
            as : "notifications"
        }},
        { $project: {
          notifications:1
        }}
      ]);

      res.json({
        status: { success: true },
        body: notifications
      });

    } catch (e) {
      let errors = {};
      switch (e) {
      default:
        errors.unknown = e;
      }
      logger.error(errors);
      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};

export const view = (req, res, next) => {
  co(function*(){
    try {

      const { _id:user_id } = res.user;
      let { page } = req.query;

      if(page === undefined || page === null || page === "") page = 0;
      const offset = page * constants.INFOMATION_LIMITS_PER_PAGE;



      const allNotifications = yield User.aggregate([
        { $match: { _id: ObjectId( user_id ) }},
        { $lookup: {
            from: "notifications",
            localField: "_id",
            foreignField: "users",
            as : "notifications"
        }},
        { $project: {
          notifications:1,
          _id: 0
        }},
        {
          $unwind: {
            path: "$notifications"
          }
        }
      ]);

      const readNotifications = allNotifications.filter(notification =>{
        return (notification.notifications.read === undefined || notification.notifications.read === false);
      });


      const notifications = yield User.aggregate([
        { $match: { _id: ObjectId( user_id ) }},
        { $lookup: {
            from: "notifications",
            localField: "_id",
            foreignField: "users",
            as : "notifications"
        }},
        { $project: {
          notifications:1,
          _id: 0
        }},
        {
          $unwind: {
            path: "$notifications"
          }
        },
        { $sort:{
          "notifications._id": -1
        }},
        { '$skip':offset },
        { '$limit': constants.INFOMATION_LIMITS_PER_PAGE }
      ]);

      res.json({
        status: {
          success: true ,
          unread:readNotifications.length,
          total:allNotifications.length,
          page: page
        },
        body: notifications
      });

    } catch (e) {
      let errors = {};
      switch (e) {
      default:
        errors.unknown = e;
      }
      logger.error(errors);
      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};

export const add = (req, res, next) => {
  co(function*(){
    try {

      if(req.body.notifications === undefined) throw new ValidationError("notifications is empty");

      const { title, body, users  } = req.body.notifications;

      if(title === undefined || title === null || title === "") throw new ValidationError("title is empty");
      if(body === undefined || body === null || body === "") throw new ValidationError("body is empty");
      if(users === undefined || users === null  || isEmpty(users)) throw  new ValidationError("users is empty");

      const modified = moment().format("YYYY-MM-DD HH:mm:ss");

      const user_ids = users.map(user_id => ObjectId(user_id) );
      const user = yield User.find({ _id:{$in: user_ids }});
      if(isEmpty(user)) throw new RecordNotFoundException("user is not find");

      const notifications = yield user.map(user => {
        const notification = new Notification();
        notification.title = title;
        notification.body = body;
        notification.modified = modified;
        notification.read = false;
        notification.users = user;
        return notification.save();
      });

      res.json({
        status: { success: true },
        body: notifications
      });

    } catch (e) {
      let errors = {};
      switch (e.message) {
        case "notifications is empty":
          errors.notifications = "お知らせが空のためお知らせの登録に失敗しました";
          break;
        case "title is empty":
          errors.title = "タイトルが空です";
          break;
        case "body is empty":
          errors.body  = "本文が空です";
          break;
        case "users is empty":
          errors.users = "ユーザーが空です";
          break;
        case "user is not find":
          errors.user = "指定されたユーザーが存在しないためお知らせの登録に失敗しました";
          break;
      default:
        errors.unknown = e;
      }
      logger.error(errors);
      res.status(400).json({
        status: {
          success: false,
          message: "お知らせの登録に失敗しました",
          errors
        }
      });
    }
  });
};

export const updateRead = (req, res, next) => {
  co(function*(){
    try {

      const user_id = res.user._id;
      const notifications = req.body.notifications;

      const notificationIds = notifications.map(notificationId => ObjectId(notificationId));
      const updateResult = yield Notification.update({
        _id : { $in: notificationIds},
      },{$set:{ read:true }}, { multi:true });

      const allNotifications = yield Notification.find({users: ObjectId(user_id) });

      const readNotifications = allNotifications.filter(notification =>{
        return (notification.read === undefined || notification.read === false);
      });

      res.json({
        status: {
          success: true,
          unread:readNotifications.length,
          total:allNotifications.length
        },
        body: updateResult
      });
    } catch (e) {
      let errors = {};
      switch (e.message) {
        default:
          errors.unknown = e;
      }
      logger.error(errors);
      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};


export const updateUnRead = (req, res, next) => {
  co(function*(){
    try {

      const user_id = res.user._id;
      const notifications = req.body.notifications;

      const notificationIds = notifications.map(notificationId => ObjectId(notificationId));
      const updateResult = yield Notification.update({
        _id : { $in: notificationIds},
      },{$set:{ read:false }}, { multi:true });

      const allNotifications = yield Notification.find({users: ObjectId(user_id) });

      const readNotifications = allNotifications.filter(notification =>{
        return (notification.read === undefined || notification.read === false);
      });

      res.json({
        status: {
          success: true,
          unread:readNotifications.length,
          total:allNotifications.length
        },
        body: updateResult
      });
    } catch (e) {
      let errors = {};
      switch (e.message) {
        default:
          errors.unknown = e;
      }
      logger.error(errors);
      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};

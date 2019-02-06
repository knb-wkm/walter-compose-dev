/* @flow */

import { Router } from "express";
import mongoose, { Schema } from "mongoose";
import multer from "multer";
import morgan from "morgan";
import co from "co";
import User from "../models/User";
import Group from "../models/Group";

import Test from "../models/Test";
const router = Router();

router.get("/", (req, res, next) => {
  function* main() {
    try {
      yield new Promise( (resolve, reject) => {
        setTimeout( () => resolve(), 1000);
      });
      const users = yield User.find();
      const groups = yield Group.find();
      res.json({users, groups});
    }
    catch (err) {
      res.json(err);
    }
  }

  co(main);
});

router.get("/1", (req, res, next) => {
  function* main() {
    const payloads = yield [
      User.find(),
      Group.find()
    ];

    res.json({
      users: payloads[0],
      groups: payloads[1]
    });
  }

  co(main);
});

router.get("/2", (req, res, next) => {
  function* main() {
    throw "runtime error";
    res.json("success");
  }

  co(main).catch( err => res.json(err));

});

router.get("/3", (req, res, next) => {
  const main = function*() {
    try {
      yield new Promise( r => setTimeout( () => r(), 1000) );
      res.json("success");
    }
    catch (err) {
      res.json(err);
    }
  };

  co(main);

});

router.get("/flow", (req, res, next) => {
  const add = (a: number, b: number): number => a + b;

  const result = add(1, 2);

  res.json(result);
});

router.get("/flow1", (req, res, next) => {
  const foo = (a: string): string => a + "!";

  const result = foo(1);
  res.json(result);
});
// const upload = multer({ dest: "uploads/" });

// router.post("/", upload.fields([ { name: "myFile" } ]), (req, res, next) => {
//   const myFile = req.files.myFile[0];
//   const dir_id = req.body.dir_id;
//   console.log(myFile, dir_id);
//   res.json(myFile);
// });

export default router;

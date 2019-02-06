import mongoose, { Schema } from "mongoose";

mongoose.Promise = global.Promise;

const TestSchema = Schema({
  name: String,
  age: Number
});


TestSchema.statics.test_method = () => {
  return "test_method is called";
};

// TestSchema.statics = {
//   test_method: () => {
//     return "test_method is called";
//   }
// };

const Test = mongoose.model("tests", TestSchema, "tests");

export default Test;

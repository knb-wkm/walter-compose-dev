import mongoose, { Schema } from "mongoose";

mongoose.Promise = global.Promise;

const AnalysisUseRateUserSchema = Schema({
  reported_at: Number,
  tenant_id: Schema.Types.ObjectId,
  name: String,
  label: String,
  user_id: Schema.Types.ObjectId,
  account_name: String,
  user_name: String,
  used: Number,
  used_total: Number,
  rate: Number,
  created_at: { type: Date, default: Date.now }
});

const AnalysisUseRateUser = mongoose.model(
  "analysis_use_rate_users",
  AnalysisUseRateUserSchema,
  "analysis_use_rate_users"
);

export default AnalysisUseRateUser;

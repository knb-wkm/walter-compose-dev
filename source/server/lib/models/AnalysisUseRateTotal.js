import mongoose, { Schema } from "mongoose";

mongoose.Promise = global.Promise;

const AnalysisUseRateTotalSchema = Schema({
  reported_at: Number,
  tenant_id: Schema.Types.ObjectId,
  name: String,
  label: String,
  threshold: Number,
  used: Number,
  free: Number,
  used_rate: Number,
  created_at: { type: Date, default: Date.now }
});

const AnalysisUseRateTotal = mongoose.model(
  "analysis_use_rate_totals",
  AnalysisUseRateTotalSchema,
  "analysis_use_rate_totals"
);

export default AnalysisUseRateTotal;

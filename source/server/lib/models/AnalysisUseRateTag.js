import mongoose, { Schema } from "mongoose";

mongoose.Promise = global.Promise;

const AnalysisUseRateTagSchema = Schema({
  reported_at: Number,
  tenant_id: Schema.Types.ObjectId,
  name: String,
  label: String,
  tag_id: Schema.Types.ObjectId,
  tag_label: String,
  used: Number,
  count: Number,
  used_total: Number,
  rate: Number,
  created_at: { type: Date, default: Date.now }
});

const AnalysisUseRateTag = mongoose.model(
  "analysis_use_rate_tags",
  AnalysisUseRateTagSchema,
  "analysis_use_rate_tags"  
);

export default AnalysisUseRateTag;

import mongoose, { Schema } from "mongoose";

mongoose.Promise = global.Promise;

const AnalysisUseRateMimeTypeSchema = Schema({
  reported_at: Number,
  tenant_id: Schema.Types.ObjectId,
  name: String,
  label: String,
  mime_type: String,
  used: Number,
  used_total: Number,
  count: Number,
  count_total: Number,
  rate: Number,
  created_at: { type: Date, default: Date.now }
});

const AnalysisUseRateMimeType = mongoose.model(
  "analysis_use_rate_mimetypes",
  AnalysisUseRateMimeTypeSchema,
  "analysis_use_rate_mimetypes"  
);

export default AnalysisUseRateMimeType;

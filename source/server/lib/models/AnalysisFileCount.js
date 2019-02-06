import mongoose, { Schema } from "mongoose";

mongoose.Promise = global.Promise;

const AnalysisFileCountSchema = Schema({
  reported_at: Number,
  tenant_id: Schema.Types.ObjectId,
  name: String,
  label: String,
  count: Number,
  created_at: { type: Date, default: Date.now }
});

const AnalysisFileCount = mongoose.model(
  "analysis_file_counts",
  AnalysisFileCountSchema,
  "analysis_file_counts"
);

export default AnalysisFileCount;

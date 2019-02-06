import mongoose, { Schema } from "mongoose";

mongoose.Promise = global.Promise;

const AnalysisFolderCountSchema = Schema({
  reported_at: Number,
  tenant_id: Schema.Types.ObjectId,
  name: String,
  label: String,
  count: Number,
  created_at: { type: Date, default: Date.now }
});

const AnalysisFolderCount = mongoose.model(
  "analysis_folder_counts",
  AnalysisFolderCountSchema,
  "analysis_folder_counts"
);

export default AnalysisFolderCount;

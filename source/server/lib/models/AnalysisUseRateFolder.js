import mongoose, { Schema } from "mongoose";

mongoose.Promise = global.Promise;

const AnalysisUseRateFolderSchema = Schema({
  reported_at: Number,
  tenant_id: Schema.Types.ObjectId,
  name: String,
  label: String,
  dir_name: String,
  used: Number,
  used_total: Number,
  rate: Number,
  created_at: { type: Date, default: Date.now }
});

const AnalysisUseRateFolder = mongoose.model(
  "analysis_use_rate_folders",
  AnalysisUseRateFolderSchema,
  "analysis_use_rate_folders"  
);

export default AnalysisUseRateFolder;

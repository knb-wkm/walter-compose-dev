import log4js from "log4js";
import * as constants from "../configs/constants";

log4js.configure(constants.LOGGER_CONFIG);
const mode = process.env.NODE_ENV;
export default log4js.getLogger(mode);

import { DEFAULT_API_TIMEOUT } from "../constants/index";

const errorParser = (e, default_message="" ) => {
  let errors = {};
  let message = default_message;
  if(e.response === undefined){
    switch (e.message) {
      case `timeout of ${DEFAULT_API_TIMEOUT}ms exceeded`:
        errors.unknown = "リクエストがタイムアウトしました。";
        break;
      default:
        errors = e.message;
        break;
    }
  }else{
    message = e.response.data.status.message;
    errors = e.response.data.status.errors;
  }
  return { message, errors };
};


export default errorParser;
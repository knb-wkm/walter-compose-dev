import * as moment from "moment";

import { find } from "lodash";

export const createFileName = (file,format) => {
  let rep = [];

  const { downloadinfo,extensionTarget } = format;
  const pattern = downloadinfo.value;

  for(var idx in file.meta_infos){
    rep[`{${file.meta_infos[idx]._id}}`] = file.meta_infos[idx].value;
  }

  // 置換用文字列を生成(拡張子)
  let _name = file.name.split(".");

  if( (extensionTarget !== undefined && extensionTarget !== null && extensionTarget !== "")
    && find(file.meta_infos, { _id:extensionTarget }) !== undefined
  ){
    // 指定されたメタ情報から.で分割して拡張子を取り出す
    _name = (find(file.meta_infos, { _id:extensionTarget })).value.split(".")
    ;
    // 指定されたメタ情報は拡張子なしのものに
    rep[`{${extensionTarget}}`] = _name[0];

  }

  rep["{extension}"] = _name.length > 1 ? ("." + _name[_name.length - 1]) : "";

  // ファイル名生成
  const replaced = pattern.replace(/(\{.*?\})/g, (str) => {
    let _str = str.match(/{(.*?):(.*?)}/);
    if(_str === null ){
      // フォーマット文字列なし
      return rep[str] === undefined ? "" : rep[str];
    }else{
      // フォーマット文字列あり
      const ret = rep[`{${_str[1]}}`];
      if(ret === undefined) return "";
      return moment(ret).isValid() ? moment(ret).format(_str[2]) : ret;
    }
  });


  return replaced === rep["{extension}"] ? file.name : replaced;　// 拡張子以外未定義の場合は元のファイル名を返す
};

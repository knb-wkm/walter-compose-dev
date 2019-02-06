// arrayBuffer形式のレスポンスをパースする
export const binaryParser = (res, callback) => {
  res.setEncoding("binary");
  res.data = "";
  res.on("data", chunk => {
    res.data += chunk;
  });

  res.on("end", () => {
    callback(null, new Buffer(res.data, "binary"));
  });
};

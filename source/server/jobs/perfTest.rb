# coding: utf-8
require "open3"
require "faraday"
require "json"
require "pp"
require "date"

# initdb
dbhost = "172.16.55.50" # host決め打ち
loadTestData = File.expand_path("loadTestData.js", File.dirname(__FILE__))
cmd = "/usr/local/bin/mongo #{dbhost}/walter #{loadTestData}"

o, e, s = Open3.capture3(cmd)
raise "mongo loadTestData error" if (e != "")

# 登録件数
DATA_LENGTH = 100000

# 1requestあたりに何秒waitするか
INTERVAL = 0.5

# 1requestあたりに添付するファイル数
POST_FILE_LENGTH = 50

# post対象のサーバ
API_SERVER = "http://localhost:3333"

# どのユーザでpostするか
ACCOUNT_INFO = {
  account_name: "taro",
  password: "test"
}

# tokkenを取得
conn = Faraday.new( url: API_SERVER )
payload = conn.post "/api/login", ACCOUNT_INFO
body = JSON.parse(payload.body)

token = body["body"]["token"]
user = body["body"]["user"]

# メタマスタを取得
payload = conn.get do |req|
  req.url "/api/v1/meta_infos"
  req.headers["x-auth-cloud-storage"] = token
end

metainfos = JSON.parse(payload.body)["body"].select do |item|
  ["receive_date_time", "send_company_name", "display_file_name"].include? item["name"]
end

# タグマスタを取得
payload = conn.get do |req|
  req.url "/api/v1/tags"
  req.headers["x-auth-cloud-storage"] = token
end

tag = JSON.parse(payload.body)["body"].first

# 日付の配列、文字列(random)の配列
date_range = (Date.parse("2017-01-01")..Date.parse("2017-12-01")).map{ |d| d.to_s }
str_range = ("a".."z").to_a

(1..(DATA_LENGTH / POST_FILE_LENGTH)).each do |i|

  files = POST_FILE_LENGTH.times.to_a.map do |j|
    file = {
      name: "test_#{i}_#{j}.txt",
      size: 4,
      mime_type: "text/plain",
      base64: "data:text/plain;base64,Zm9vCg==",
      checksum: "8f3bee6fbae63be812de5af39714824e"
    }

    metainfo = metainfos.map do |meta|
      if (meta["value_type"] == "Date")
        res = {
          "_id" => meta["_id"],
          "value" => date_range.shuffle.first
        }
      else
        res = {
          "_id" => meta["_id"],
          "value" => str_range.shuffle[0..20].join
        }
      end
      res
    end

    file[:meta_infos] = metainfo
    file[:tags] = [ tag["_id"] ] if [true,false].shuffle.first

    # symbolを文字列に変換
    file = file.map{ |k,v| [k.to_s, v] }.to_h
    file
  end                      

  body = { "files" => files }

  # upload
  res = conn.post do |req|
    req.url "/api/v1/files"
    req.headers["Content-Type"] = "application/json"
    req.headers["x-auth-cloud-storage"] = token
    req.body = body.to_json
  end

  sleep(INTERVAL)

end


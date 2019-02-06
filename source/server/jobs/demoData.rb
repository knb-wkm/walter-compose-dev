# coding: utf-8
require "open3"
require "faraday"
require "json"
require "pp"
require "date"

require "./base64_data"

# 登録件数
DATA_LENGTH = 100

# 1requestあたりに何秒waitするか
INTERVAL = 0.1

# 1requestあたりに添付するファイル数
POST_FILE_LENGTH = 20

# post対象のAPサーバ
API_SERVER = "http://10.30.88.70"

# init対象のdbサーバ
DB_SERVER = "mongos_1 "

# どのユーザでpostするか
ACCOUNT_INFO = {
  account_name: "taro",
  password: "test",
  tenant_name: "test"
}

# initdb
loadTestData = File.expand_path("loadTestData.js", File.dirname(__FILE__))
cmd = "/usr/bin/mongo #{DB_SERVER}/walter #{loadTestData}"

o, e, s = Open3.capture3(cmd)
raise "mongo loadTestData error" if (e != "")

sleep 30

# init elasticsearch
cmd = "cd /webapp/server && npm run init-elasticsearch"
o, e, s = Open3.capture3(cmd)
raise "elasticsearch error" if (e != "")

sleep 30

# tokenを取得
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
  needle = [
    "send_date_time",
    "receive_date_time",
    "send_company_name",
    "send_user_name",
    "receive_company_name",
    "receive_user_name",
    "display_file_name"
  ]
    
  needle.include? item["name"]
end

# タグマスタを取得
payload = conn.get do |req|
  req.url "/api/v1/tags"
  req.headers["x-auth-cloud-storage"] = token
end

tag = JSON.parse(payload.body)["body"].first

# 送受信日付の配列
send_date_range = (Date.parse("2013-01-01")..Date.parse("2017-12-01")).to_a

# 送信企業名の配列
send_company_names = [
  ("a".."c").to_a.map{|s| (s * 3) + "グループ" },
  ("d".."f").to_a.map{|s| (s * 3) + "ホールディングス"},
  ("g".."i").to_a.map{|s| (s * 3) + "ジャパン"}
].flatten

# 送信ユーザ名の配列
send_user_names = ["送信 太郎", "送信 次郎", "送信 花子"]

# 受信ユーザ名の配列
receive_user_names = ["受信 太郎", "受信 次郎", "受信 花子"]

# upload main
(1..(DATA_LENGTH / POST_FILE_LENGTH)).each do |i|

  files = POST_FILE_LENGTH.times.to_a.map do |j|
    data = get_data

    file = {
      name: "#{i}_#{j}.pdf",
      size: 167000,
      mime_type: data[:mime_type],
      base64: data[:base64],
      checksum: data[:checksum]
    }

    send_date = send_date_range.shuffle.first
    receive_date = send_date.next_day
    company_name = send_company_names.shuffle.first

    metainfo = metainfos.map do |meta|
      res = { "_id" => meta["_id"] }

      case meta["name"]
      when "send_date_time"
        res["value"] = send_date
      when "receive_date_time"
        res["value"] = send_date
      when "send_company_name"
        res["value"] = company_name
      when "send_user_name"
        res["value"] = send_user_names.shuffle.first
      when "receive_company_name"
        res["value"] = "AAA社"
      when "receive_user_name"
        res["value"] = receive_user_names.shuffle.first
      when "display_file_name"
        res["value"] = company_name + " " + send_date.strftime("%Y年%m月") + " 請求書"
      else
        raise "metainfo.name is invalid"
      end
      res
    end

    file[:meta_infos] = metainfo
    file[:tags] = [ tag["_id"] ] if (0..10).to_a.shuffle.first === 0

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

  pp JSON.parse(payload.body)["body"]
  sleep(INTERVAL)

end

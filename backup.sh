#!/bin/bash

nowdt=`date '+%Y%m%d'`

sudo elasticdump  --input=http://localhost:9200/ --output=$  | gzip > ./elastic/backup/backup.json.gz
sudo docker-compose exec mongo mongodump --port 27017 --out /data/backup

sudo tar czf  storagebk${nowdt}.tgz ./elastic/backup ./mongo/backup ./swift

aws s3 mv storagebk${nowdt}.tgz s3://clouds-work/backup/

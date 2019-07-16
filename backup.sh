#!/bin/bash

cd /home/ec2-user/glico/walter-compose-glico

nowdt=`date '+%Y%m%d'`
deldt=`date '+%Y%m%d' --date "3 days ago"`



echo ${nowdt}
sudo elasticdump  --input=http://localhost:9200/ --output=$  | gzip > ./elastic/backup/backup.json.gz
sudo docker-compose exec mongo rm -rf /data/backup/admin
sudo docker-compose exec mongo rm -rf /data/backup/walter

sudo docker-compose exec mongo mongodump --port 27017 --out /data/backup

sudo docker-compose exec swift /backup/backup.sh

sudo tar czf  storagebk${nowdt}.tgz ./elastic/backup ./mongo/backup ./swift/backup

aws s3 mv storagebk${nowdt}.tgz s3://cyber-cloudstorage/backup/
aws s3 rm s3://cyber-cloudstorage/backup/storagebk${deldt}.tgz


RESULT_MSG=`aws s3 ls s3://cyber-cloudstorage/backup/`

echo ${RESULT_MSG}

aws sns publish --topic-arn arn:aws:sns:ap-northeast-1:248716599680:cloudstorage_chk --message "${RESULT_MSG}"

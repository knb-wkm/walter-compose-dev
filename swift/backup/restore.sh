#!/bin/sh

for file in `ls`; do
  if [ ${file} != "restore.sh" ]; then
    swift -A http://127.0.0.1:8080/auth/v1.0 -U test:tester -K testing upload [tenant] ${file}
    echo ${file}
  fi

done

#!/bin/bash

cd /backup
swift -A http://127.0.0.1:8080/auth/v1.0 -U test:tester -K testing download --all

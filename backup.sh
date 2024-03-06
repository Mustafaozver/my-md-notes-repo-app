#!/bin/bash

DATE=$(date +'%d_%m_%Y')
TIME=$(date +'%H:%M')
CURRENT_TIMESTAMP=$(date +%s)

GIT_MSG="BACKUP"

COMMITMSG="$CURRENT_TIMESTAMP - SHPUSH ($GIT_MSG) - $TIME - $DATE"

git pull

git add .
git commit -m "$COMMITMSG"
##git push origin main
git push

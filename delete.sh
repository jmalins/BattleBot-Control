#! /bin/sh
BB_SERVER="${BB_SERVER:-battlebot.local}"
if [ -n "$1" ]; then
  curl -v -X DELETE -v  -F "path=/$1" http://$BB_SERVER/edit
else 
  echo "ERROR: specify a file name to delete"
fi

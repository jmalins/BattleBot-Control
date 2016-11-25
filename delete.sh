#! /bin/sh
if [ -n "$1" ]; then
  curl -X DELETE -v "http://battlebot.local/edit?file=/$1"
else 
  echo "ERROR: specify a file name to delete"
fi

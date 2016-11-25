#! /bin/sh
if [ -n "$1" ]; then
  for file in `find data/$1 -type f`; do curl -v -F "file=@$PWD/$file" battlebot.local/edit; done
else 
  for file in `find data -type f`; do curl -v -F "file=@$PWD/$file" battlebot.local/edit; done
fi

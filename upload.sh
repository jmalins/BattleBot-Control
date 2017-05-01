#! /bin/sh
BB_SERVER="${BB_SERVER:-battlebot.local}"
FPATH="data"
if [ -n "$1" ]; then
  FPATH="data/$1"
fi
for file in $(find $FPATH -type f); do \
  XFILE=${file#*/}
  curl -v -F "file=@$file;filename=/$XFILE" -F "path=/$XFILE" -X PUT $BB_SERVER/edit; \
done

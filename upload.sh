#! /bin/sh
FPATH="data"
if [ -n "$1" ]; then
  FPATH="data/$1"
fi
for file in $(find $FPATH -type f); do \
  XFILE=${file#*/}
  curl -v -F "file=@$file;filename=/$XFILE" -F "path=/$XFILE" -X PUT 192.168.0.143/edit; \
done

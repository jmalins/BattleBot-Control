for file in `ls -A1`; do curl -v -F "file=@$PWD/$file" esp8266.local/edit; done

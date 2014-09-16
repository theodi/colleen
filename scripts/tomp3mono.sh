#!/bin/bash
for i in *.aif
do
ffmpeg -i "$i" -ac 1 -ab 64k "${i%aif}mp3"
done


for i in *.wav
do
ffmpeg -i "$i" -ac 1 -ab 64k "${i%wav}mp3"
done

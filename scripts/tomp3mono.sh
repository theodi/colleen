#!/bin/bash
for i in $1/*.aif
do
ffmpeg -i "$i" -ac 1 -ab 64k "${i%aif}mp3" -y
done


for i in $1/*.wav
do
ffmpeg -i "$i" -ac 1 -ab 64k "${i%wav}mp3" -y
done

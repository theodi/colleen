#!/bin/bash
for i in $1/*.aif
do
ffmpeg -i "$i" -ab 128k "${i%aif}mp3" -y
done


for i in $1/*.wav
do
ffmpeg -i "$i" -ab 128k "${i%wav}mp3" -y
done

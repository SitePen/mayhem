#!/usr/bin/env bash
set -e

rm -rf dist
git clone --branch bower . dist
grunt build
cd dist
git add -A .
git commit -m "Update release"
git push
cd ..
git push origin bower

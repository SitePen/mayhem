#!/usr/bin/env bash
set -e

rm -rf dist
git clone -n --branch bower . dist
grunt build
cp bower.json LICENSE package.json README.md dist
cd dist
git add -A .
git commit -m "Update bower release"
git push
cd ..
git push origin bower

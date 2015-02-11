#!/usr/bin/env bash
set -e

COMMIT=$(git rev-parse HEAD)

rm -rf dist
git clone -n --branch bower . dist
grunt build
cd dist
git add -A .
git commit -m "Update bower release from commit $COMMIT"
git push
cd ..
git push origin bower

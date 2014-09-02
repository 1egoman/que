#!/bin/bash
# update.sh (https://github.com/1egoman/que)
# This file is run to update all dependencies, both for Que and for each plugin.

# in the root
echo "Installing dependencies in /"
npm install

# in each plugin
cd plugins
FILES=`ls`
for f in $FILES
do
  echo "Installing dependencies in /plugins/$f"
  cd $f
  npm install
  cd ..
done
echo "Done!"
exit 0

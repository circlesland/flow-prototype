#!/bin/bash

export DEPLOY_ENVIRONMENT=$1

echo "Installing build dependencies .."
npm i
npx --no-install yarn || exit

echo "Building 'shell' with dapps .."
cd shell || exit
npm run build
cd .. || exit

search='__TIMESTAMP__'
replace=`date +"%s"`
search_replace="s/$search/$replace/g"
cp -f ./shell/public/index.template.html ./shell/public/index.html
sed -i.bak "$search_replace" ./shell/public/index.html
rm -f ./shell/public/index.html.bak
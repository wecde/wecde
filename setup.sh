#!/usr/bin

echo "Installing dependencies for app..."
yarn install
cd ./resources
echo "Installing dependencies for resources..."
yarn install
cd ..
echo "Done"

exit 0
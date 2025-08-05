#!/bin/bash

echo "🧹 Pulizia node_modules, cache e Pods..."

rm -rf node_modules
rm -rf ios/Pods ios/Podfile.lock ios/build
rm -rf ~/Library/Caches/CocoaPods
rm -rf ~/Library/Developer/Xcode/DerivedData

npm install

cd ios
pod install --repo-update
cd ..

echo "✅ Pulizia completata"
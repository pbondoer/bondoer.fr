#!/bin/bash

# Remove directories
yarn clean

# Prettify sources
yarn prettier

# Build a new version
yarn build

# Add to git and commit
git add .
git commit -m "[release] New website build"

# Create a new version
yarn version

# Push to master
git push origin master

# Deploy to gh-pages
git subtree push --prefix dist origin gh-pages
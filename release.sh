#!/bin/bash

# Remove directories
yarn clean

# Prettify sources
yarn prettier

# Build a new version
yarn build

# Add to git and commit
git add .
git commit

# Create a new version
yarn version

# Deploy to gh-pages
git subtree push --prefix dist origin gh-pages
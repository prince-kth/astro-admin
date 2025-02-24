#!/bin/bash

# Run build and capture errors
npm run build 2> build_errors.log

# Check for missing module errors
grep -oP "Cannot find module '\K[^']+" build_errors.log | while read -r module; do
    echo "Installing missing package: $module"
    npm install "$module" --force
done

# Re-run build
npm run build

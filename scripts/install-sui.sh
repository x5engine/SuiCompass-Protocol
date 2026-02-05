#!/bin/bash
set -e

SUI_VERSION="v1.64.2"
PLATFORM="ubuntu-x86_64"
URL="https://github.com/MystenLabs/sui/releases/download/mainnet-${SUI_VERSION}/sui-mainnet-${SUI_VERSION}-${PLATFORM}.tgz"
DEST_DIR="$(pwd)/bin"

echo "🚀 Installing Sui CLI (${SUI_VERSION})..."
echo "📂 Destination: ${DEST_DIR}"

mkdir -p "$DEST_DIR"

echo "⬇️ Downloading from ${URL}..."
curl -L "$URL" -o sui.tgz

echo "📦 Extracting..."
tar -xzf sui.tgz -C "$DEST_DIR"
mv "$DEST_DIR/sui" "$DEST_DIR/sui-binary" # Assuming extraction might put it in a subfolder or direct, let's check
# The tarball usually contains the binary directly or in a folder. 
# Let's clean up:
if [ -f "$DEST_DIR/sui" ]; then
    echo "✅ Found binary at $DEST_DIR/sui"
else
    # Find it
    FOUND=$(find "$DEST_DIR" -name sui -type f | head -n 1)
    if [ -n "$FOUND" ]; then
        mv "$FOUND" "$DEST_DIR/sui"
        echo "✅ Moved binary to $DEST_DIR/sui"
    else
        echo "❌ Could not find 'sui' binary in extracted files."
        exit 1
    fi
fi

chmod +x "$DEST_DIR/sui"
rm sui.tgz

echo "🎉 Sui CLI installed successfully!"
echo "👉 You can now run the deployment script."

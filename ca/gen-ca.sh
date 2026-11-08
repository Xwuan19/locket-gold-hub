#!/bin/bash
# Generate Root CA for locket-proxy TLS MITM
# Output: ca/root-ca.key (KEEP SECRET), ca/root-ca.crt (commit OK)
# Run once. Store root-ca.key in Fly secret: fly secrets set ROOT_CA_KEY="$(cat ca/root-ca.key)"

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CA_DIR="$SCRIPT_DIR"

echo "==> Generating 4096-bit RSA Root CA..."

openssl genrsa -out "$CA_DIR/root-ca.key" 4096

openssl req -new -x509 \
  -key "$CA_DIR/root-ca.key" \
  -out "$CA_DIR/root-ca.crt" \
  -days 3650 \
  -subj "/C=US/O=Locket XVIP/CN=Locket XVIP Root CA" \
  -extensions v3_ca \
  -addext "basicConstraints=critical,CA:TRUE" \
  -addext "keyUsage=critical,keyCertSign,cRLSign"

echo "==> Root CA generated:"
echo "    Public:  $CA_DIR/root-ca.crt  (safe to distribute in .mobileconfig)"
echo "    Private: $CA_DIR/root-ca.key  (NEVER commit — store in Fly secrets)"
echo ""
echo "==> Next: fly secrets set ROOT_CA_KEY=\"\$(cat ca/root-ca.key)\" ROOT_CA_CRT=\"\$(cat ca/root-ca.crt)\""

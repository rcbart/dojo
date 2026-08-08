#!/usr/bin/env bash
# Generate a self-signed cert for the TLS lab (CN=localhost). Self-signed is fine for
# learning; browsers/curl will warn (use curl -k). Never use self-signed in production.
set -euo pipefail
cd "$(dirname "$0")"
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout key.pem -out cert.pem -days 365 \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost"
echo "Wrote cert.pem and key.pem"

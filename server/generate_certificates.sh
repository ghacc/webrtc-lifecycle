#!/usr/bin/env bash
echo '==== Generating key.pem...'
openssl genrsa -out key.pem 2048
echo '==== Initiating certificate signing...'
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem

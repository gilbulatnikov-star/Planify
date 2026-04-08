#!/usr/bin/env bash
export PATH="/usr/local/bin:$PATH"
cd "/Users/gilbulatnikov/Documents/Gil Productions/gil-crm" || exit 1
exec /usr/local/bin/node --max-http-header-size=65536 node_modules/next/dist/bin/next dev --turbopack

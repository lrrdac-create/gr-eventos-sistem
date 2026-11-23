#!/bin/bash
# Monta o index.html a partir dos pedaços.
cd "$(dirname "$0")"
cat p1_head.html p2_core.js p2a_sb.js p2b_content.js p3_shell.js p4_events.js \
    p5_tabs.js p6_org.js p7_fin.js p7b_dre.js p7c_period.js p7d_recurring.js p8_rest.js > index.html
node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');const m=h.match(/<script>([\s\S]*?)<\/script>/g);fs.writeFileSync('/tmp/main.js',m[m.length-1].replace(/<\/?script>/g,''))"
node --check /tmp/main.js && echo "BUILD OK -> index.html"

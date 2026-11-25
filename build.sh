#!/bin/bash
# Monta o index.html a partir dos pedaços.
cd "$(dirname "$0")"
cat p1_head.html p2_core.js p2a_sb.js p2b_content.js p3_shell.js p4_events.js \
    p5_tabs.js p6_org.js p7_fin.js p7b_dre.js p7c_period.js p7d_recurring.js p7e_signup.js p8_rest.js > index.html
# carimbo da versão (o sistema aberto avisa quando sai uma versão nova)
sed -i '' "s/const BUILD='__BUILD__'/const BUILD='$(date +%s)'/" index.html
# confere a sintaxe do JavaScript (usa o Node se tiver; senão, o JavaScript do próprio macOS)
if command -v node >/dev/null; then
  node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');const m=h.match(/<script>([\s\S]*?)<\/script>/g);fs.writeFileSync('/tmp/main.js',m[m.length-1].replace(/<\/?script>/g,''))"
  node --check /tmp/main.js && echo "BUILD OK -> index.html"
else
  osascript -l JavaScript -e '
    ObjC.import("Foundation");
    const h=$.NSString.stringWithContentsOfFileEncodingError("index.html",$.NSUTF8StringEncoding,null).js;
    const m=h.match(/<script>([\s\S]*?)<\/script>/g);
    try{new Function(m[m.length-1].replace(/<\/?script>/g,""));"BUILD OK -> index.html"}catch(e){"ERRO DE SINTAXE: "+e}' 
fi

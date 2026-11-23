cd /home/claude/gr && python3 - <<'P'
import hashlib,re
h=lambda p: hashlib.sha256(('gr-events:'+p).encode()).hexdigest()
out=open('p1_head.html').read()
for f in ['p2_core.js','p2b_content.js','p3_shell.js','p4_events.js','p5_tabs.js','p6_org.js','p7_fin.js','p7b_dre.js','p7c_period.js','p7d_recurring.js','p8_rest.js']: out+=open(f).read()
out=out.replace('__H1__',h('GR@Rafa2026')).replace('__H2__',h('GR@Mateus26')).replace('__H3__',h('GR@Muller26'))
open('index.html','w').write(out)
open('/tmp/main.js','w').write(re.findall(r'<script>([\s\S]*?)</script>',out)[-1])
P
node --check /tmp/main.js && echo BUILD_OK

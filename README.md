# GR Events Sistem

Sistema interno da GR Events: eventos, equipe, clientes, fornecedores, orçamentos,
fluxo de caixa, DRE, metas e organograma.

## Como funciona
- Página única em HTML, sem servidor próprio.
- Login, dados e arquivos ficam no Supabase (projeto `gr-events-sistema`).
- Perfis: **Administrador** (vê tudo) e **Produção** (sem valores financeiros).
  A separação é garantida por regras no banco, não só pela tela.

## Editar
Os arquivos `p*.html` e `p*.js` são os pedaços do sistema.
Depois de alterar qualquer um deles, rode:

```bash
./build.sh
```

Isso gera o `index.html`, que é o arquivo publicado.

## Agenda no Google Agenda
Na tela **Agenda**, o botão "Assinar no Google Agenda" gera um link pessoal e secreto.
O link é servido pela função `supabase/functions/agenda` (publicada no Supabase com
`verify_jwt = false`; o acesso é controlado pelo token da tabela `calendar_feeds`).
Mostra só eventos não cancelados e nenhum valor financeiro.

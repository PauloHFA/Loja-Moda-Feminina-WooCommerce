# Status real dos requisitos

Fonte: [requisitos-extraidos.txt](requisitos-extraidos.txt) (27 páginas do PDF do freelancer) e [PENDENCIAS.md](../PENDENCIAS.md).

**Resumo executivo:** A base técnica local da loja (tema filho Storefront completo, Docker Compose com montagem do tema, importador de catálogo para 300+ produtos variáveis e filtros de vitrine) está **implementada**. A publicação em produção e os serviços comerciais continuam **bloqueados por ativos e credenciais do cliente**.

## Matriz de Status (Requisitos do PDF)

| Área | Requisitos | Status |
| --- | --- | --- |
| Ambiente local Docker + WordPress + WooCommerce | seção 3 | Implementado localmente (`docker-compose.yml` monta `./frontend` no tema `moda-feminina`; `setup.ps1` automatiza o provisionamento) |
| Tema visual e responsividade | seção 4 | Implementado (`frontend/` — header, hero, coleções circulares, cards com hover, modal Espiar, mini-cart drawer, checkout BR) |
| Catálogo de 300+ produtos variáveis | RF-CAT-01, RF-CAT-02 | Importador `scripts/import-catalog.php` pronto + amostra validada de 300 pais / 900 variações; aguarda planilha e fotos reais do cliente |
| Página de produto (galeria, composição, medidas) | RF-CAT-03 | Implementado no template `frontend/woocommerce/single-product.php` |
| Filtros combináveis de tamanho, cor e preço | RF-FLT-01 | Implementado na loja e no infinite scroll AJAX |
| Carrinho, mini carrinho e checkout brasileiro | RF-CRT-01 a 03, RF-CHK-02 | Implementado localmente com *Extra Checkout Fields for Brazil* (CPF/CNPJ, CEP) |
| Mercado Pago: Pix, cartão e boleto + webhooks | RF-PAG-01 a 04 | Plugin instalado e desativado; aguarda credenciais verificadas do cliente |
| Frete Correios / Melhor Envio / Frenet | RF-FRT-01 | Pendente de contrato/token do cliente |
| Cupons e Painel / Estoque / Perfis | RF-CUP-01, RF-ADM-01 a 04 | Recursos nativos WooCommerce disponíveis; regras comerciais aguardam definição do cliente |
| E-mails transacionais via SMTP | RF-EML-01 | Aguarda servidor SMTP e domínio de envio do cliente |
| Páginas institucionais e legais (LGPD) | RF-DSG-02, RF-LGL-01 | Aguarda textos e revisão jurídica do cliente |
| SEO técnico, backups, 2FA e segurança | RF-SEO-01, RNF-03, RNF-05, RNF-13 | Backlog técnico para ambiente de homologação/produção |
| Instagram Shopping | RF-IGS-01 | Pendente de Meta Business Manager e domínio verificado do cliente |

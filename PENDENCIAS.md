# 📋 Pendências e Próximos Passos — Loja-Moda-Feminina-WooCommerce

> Documento de rastreabilidade do status técnico, validações automatizadas e entregas dependentes do cliente para o **E-commerce de Moda Feminina (WordPress + WooCommerce)**.

---

## ✅ 1. O que já está Concluído e Validado

- **Ambiente Containerizado (`docker-compose.yml` + `setup.ps1` + `scripts/bootstrap-store.sh`):**
  - Stack local WordPress (`php8.2-apache`) + MySQL 8.0 + WP-CLI com montagem direta do tema filho em `wp-content/themes/moda-feminina`.
  - Instalação automática de WooCommerce, tradução `pt_BR`, *Brazilian Market on WooCommerce* (CPF/CNPJ/CEP) e plugin Mercado Pago (pré-instalado e desativado até chegada das credenciais).
- **Tema Filho Storefront (`frontend/`):**
  - Design system completo (`style.css`), header/nav/anúncio, homepage (`front-page.php`), templates WooCommerce (`archive-product.php`, `content-product.php`, `single-product.php`, `cart/mini-cart.php`), segunda foto no hover, modal *Espiar* (Quick View), mini-cart drawer AJAX, wishlist e infinite scroll (`js/custom.js` + `functions.php`).
  - Melhorias de acessibilidade WCAG 2.1 AA aplicadas em links de loop e blocos Gutenberg WooCommerce.
- **Importador de Catálogo (`scripts/import-catalog.php` + `scripts/generate-sample-catalog.py`):**
  - Upsert idempotente por SKU compatível com `docs/modelo-planilha-produtos.csv`.
  - Amostra validada (`scripts/catalogo-amostra.csv`) com **300 produtos pai e 900 variações** (tamanhos, cores, estoque, medidas e preços).
- **Esteira CI/CD (`.github/workflows/ci.yml`):**
  - Validação automatizada de sintaxe PHP (`php -l`), sintaxe JavaScript (`node --check`), linter Python (`ruff`) e testes estruturais de catálogo e tema (`pytest tests`).

---

## 🚀 2. Melhorias Futuras Opcionais (Backlog de Engenharia)
- [ ] **SEO Técnico & Schema.org:** Configurar plugin de SEO (Rank Math / Yoast) com sitemap XML e dados estruturados `Product` / `Offer` após inserção dos textos reais.
- [ ] **Performance & Cache:** Configurar plugin de cache/otimização de imagens WebP em homologação/produção e rodar auditoria Lighthouse completa contra o ambiente publicado (`accessibility-test.js`).
- [ ] **Segurança de Produção:** Habilitar 2FA no painel WordPress, políticas de backup automático em nuvem e endurecimento (`DISALLOW_FILE_EDIT`, headers HTTP de segurança).

---

## 🛠️ 3. Dependências Externas (Dados e Credenciais do Cliente)
- [ ] **Planilha Oficial e Fotos da Marca:** Receber e importar a planilha real de produtos (substituindo `scripts/catalogo-amostra.csv`) e as fotos reais de hero, categorias, produtos e Instagram.
- [ ] **Credenciais Mercado Pago:** Ativar o plugin `woocommerce-mercadopago` com tokens de produção/sandbox e URL de webhook para Pix, cartão e boleto.
- [ ] **Contrato de Frete:** Configurar plugin Correios / Melhor Envio / Frenet com CEP de origem, dimensões das embalagens e token da conta do cliente.
- [ ] **Conteúdo Institucional, Jurídico e E-mail:** Inserir Política de Privacidade (LGPD), Termos de Uso, Política de Trocas e Devoluções, configurar SMTP transacional e domínio final.
- [ ] **Instagram Shopping:** Vincular catálogo ao Meta Business Manager e domínio verificado.

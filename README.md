# Madeira 2026 — Proposta da viagem (Família Simões)

Site mobile estático com palavra-passe para apresentar a proposta da viagem.

## Pôr online no GitHub Pages

O site vai ficar em: **https://adrianoapmartins.github.io/simoesmadeira2026**

### Passo a passo

1. Cria (ou abre) o repositório `simoesmadeira2026` na tua conta GitHub.
2. Coloca **todos os ficheiros desta pasta na raiz do repositório**
   (index.html, styles.css, app.js, as imagens, o .nojekyll e a pasta docs/).
   - Via web: "Add file" → "Upload files" → arrasta tudo → "Commit".
   - Via git:
     ```
     git clone https://github.com/adrianoapmartins/simoesmadeira2026.git
     cd simoesmadeira2026
     # copiar os ficheiros para aqui
     git add .
     git commit -m "Site da viagem"
     git push
     ```
3. No repositório: **Settings → Pages**.
4. Em "Build and deployment" → Source: **Deploy from a branch**.
5. Branch: **main** (ou master) · pasta: **/ (root)** → Save.
6. Aguarda 1-2 minutos. O site fica em
   https://adrianoapmartins.github.io/simoesmadeira2026

### Importante

- O ficheiro **.nojekyll** (vazio) já está incluído — não o apagues. Garante que
  o GitHub serve a pasta `docs/` com os recibos PDF sem interferência do Jekyll.
- Mantém **todos os ficheiros na raiz** do repositório, incluindo a pasta `docs/`.

## Palavra-passe

A palavra-passe é **`bonitos`** (em minúsculas).

⚠️ É um gate cosmético, não segurança real (está no JavaScript). Para uma viagem
em família privada está bem; não uses para nada confidencial.

## Preview no WhatsApp

As meta tags Open Graph já apontam para o URL absoluto do GitHub Pages
(https://adrianoapmartins.github.io/simoesmadeira2026/social-card.jpg).
Ao partilhar o link, aparece a foto do hotel + título "Sol, mar e levadas".

Se o preview não aparecer logo:
- Abre o site uma vez no browser (para a imagem ficar em cache)
- Valida em https://www.opengraph.xyz/ (colas o URL)
- Se o WhatsApp mostrar preview antigo, partilha com `?v=2` no fim do URL

## Recibos de pagamento

Os recibos easyJet (PDF) estão na pasta `docs/` e abrem a partir da tab Pagamentos:
- docs/voos-grupo1-KCL63HT.pdf
- docs/voos-grupo2-KCL63SQ.pdf

## Marcar pagamentos como pagos

Quando uma família acertar contas, edita o `app.js`:
procura `const reembolsos` e muda `paga: false` → `paga: true` na linha dessa família.
Depois faz commit/push (ou re-upload) e o GitHub Pages atualiza sozinho.

## Estrutura

- `index.html` — estrutura e meta tags
- `styles.css` — design (verde-Madeira, Fraunces + Manrope)
- `app.js` — gate de password, tabs, dados, pagamentos
- `hotel-hero.jpg` — fundo do hero
- `social-card.jpg` — preview de partilha (Open Graph 1200×630)
- `docs/` — recibos PDF dos voos
- `.nojekyll` — desativa o Jekyll no GitHub Pages

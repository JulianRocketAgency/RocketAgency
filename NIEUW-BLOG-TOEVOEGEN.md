# Nieuw blogartikel toevoegen — Rocket Agency

## Mapstructuur blogs

```
rocket-agency/
└── blog/
    ├── ai-agents-2025.html              ← AI Oplossingen
    ├── llm-code-generatie-python.html   ← Automatisering
    ├── rag-kennisbanken-praktijk.html   ← AI Oplossingen
    └── jouw-nieuwe-artikel.html         ← jij voegt toe
```

---

## Stap 1 — Maak het HTML bestand aan

Kopieer een bestaand artikel als basis, bijv:
```bash
cp blog/ai-agents-2025.html blog/jouw-artikel-slug.html
```

Naamgeving: altijd **kleine letters, koppeltekens, geen spaties**
- ✓ `ai-trends-2025.html`
- ✓ `python-api-integratie.html`
- ✗ `Mijn Artikel.html`

---

## Stap 2 — Pas het HTML bestand aan

Verander bovenaan:
- `<title>` → jouw artikel titel
- `<meta name="description">` → korte samenvatting
- `.artikel-cat` → categorie (zie categorieën hieronder)
- `.artikel-datum` → publicatiedatum
- `.artikel-leestijd` → aantal minuten
- `<h1>` → artikel titel
- `.artikel-intro` → inleiding
- `.artikel-body` → de inhoud zelf

---

## Stap 3 — Voeg toe aan blog-engine.js

Open `js/blog-engine.js` en voeg bovenaan in `BLOG_POSTS = [` toe:

```javascript
{
  id: 'uniek-id',                          // zelfde als bestandsnaam zonder .html
  title: 'Jouw artikel titel',
  excerpt: 'Korte samenvatting, max 180 tekens.',
  content: '',
  category: 'AI Oplossingen',              // zie categorieën hieronder
  tags: ['Tag1', 'Tag2', 'Tag3'],
  date: '2025-04-01',                      // YYYY-MM-DD
  readTime: 6,                             // geschat aantal minuten
  featured: false,                         // true = groot blok op homepage
  slug: 'jouw-artikel-slug',              // zelfde als bestandsnaam zonder .html
  author: 'Julian van Beek'
},
```

---

## Categorieën

Gebruik exact één van deze vier:
- `AI Oplossingen`
- `Automatisering`
- `Social Media`
- `Digitale Marketing`

---

## Stap 4 — Push naar GitHub

```bash
cd ~/Agency/rocket-agency
git add .
git commit -m "Nieuw artikel: jouw artikel titel"
git push
```

Vercel deployt automatisch. Het artikel is live op:
`rocketagency.vercel.app/blog/jouw-artikel-slug`

En staat automatisch in het overzicht op `/blog`.

---

## Featured artikel

Wil je een artikel als groot featured blok op de homepage en blog?
Zet `featured: true` in blog-engine.js. Zet alle andere op `false` —
er hoort maar één featured artikel te zijn tegelijk.

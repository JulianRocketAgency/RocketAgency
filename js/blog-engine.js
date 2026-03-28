/* ═══════════════════════════════════════════════════════
   ROCKET AGENCY — BLOG ENGINE
   
   Bevat:
   1. BLOG_POSTS   — statische seed-data (vervang later door DB)
   2. renderBlog() — rendert grid / lijstweergave
   3. BlogWriter   — geautomatiseerd schrijven via Anthropic API
   4. BlogStorage  — opslaan/laden via localStorage (later: Supabase)
═══════════════════════════════════════════════════════ */

/* ── 1. SEED DATA ──────────────────────────────────── */
const BLOG_POSTS = [
    id: 'agents-2025',
    title: 'AI Agents: waarom 2025 het jaar van autonome software wordt',
    excerpt: 'Van simpele chatbots naar agents die zelfstandig taken uitvoeren, code schrijven en beslissingen nemen. Wat betekent dit voor jouw bedrijf?',
    content: '',
    category: 'AI Oplossingen',
    tags: ['AI Agents', 'Autonome AI', 'LLM'],
    date: '2026-03-25',
    readTime: 7,
    featured: true,
    slug: 'ai-agents-2025',
    author: 'Julian van Beek'
  },
  {
    id: 'llm-code-generation',
    title: 'Code generatie met LLMs: hoe wij Python-automatiseringen 10× sneller bouwen',
    excerpt: 'Grote taalmodellen veranderen hoe software gebouwd wordt. Wij laten zien hoe we LLMs inzetten om complexe automatiseringen razendsnel te ontwikkelen — en wat de valkuilen zijn.',
    content: '',
    category: 'Automatisering',
    tags: ['Python', 'LLM', 'Code Generatie'],
    date: '2026-03-20',
    readTime: 6,
    featured: false,
    slug: 'llm-code-generatie-python',
    author: 'Julian van Beek'
  },
  {
    id: 'rag-kennisbanken',
    title: 'RAG in de praktijk: een AI die écht jouw bedrijfsdocumenten begrijpt',
    excerpt: 'Retrieval-Augmented Generation is de technologie achter AI die antwoord geeft op basis van jouw eigen data. Geen hallucinaties, geen vage antwoorden — alleen relevante informatie uit jouw kennisbank.',
    content: '',
    category: 'AI Oplossingen',
    tags: ['RAG', 'Vector Database', 'Python'],
    date: '2026-03-15',
    readTime: 8,
    featured: false,
    slug: 'rag-kennisbanken-praktijk',
    author: 'Julian van Beek'
  },
];

/* ── 2. RENDER FUNCTIES ────────────────────────────── */

/**
 * Formatteer datum naar NL
 */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

/**
 * Render blog-kaarten in een grid (homepage / blog-overzicht)
 * @param {HTMLElement} container
 * @param {Array} posts
 * @param {string} layout  'grid-featured' | 'grid-uniform' | 'list'
 */
function renderBlogGrid(container, posts = BLOG_POSTS, layout = 'grid-featured') {
  if (!container) return;

  if (layout === 'grid-featured') {
    // Eerste post groot, rest klein
    container.innerHTML = posts.map((post, i) => `
      <article class="blog-card ${i === 0 ? 'featured' : ''}" style="cursor:pointer;"
               onclick="window.location.href='/blog/' + post.slug">
        <div class="blog-card-img">
          <div class="blog-card-img-bg" style="background:linear-gradient(135deg,var(--black3),rgba(201,168,76,${i===0?.08:.04}))">
            <div class="blog-img-icon">${getCategoryIcon(post.category)}</div>
          </div>
        </div>
        <div class="blog-card-body">
          <div class="blog-cat">${post.category}</div>
          <h3 class="blog-title">${post.title}</h3>
          ${i === 0 ? `<p class="blog-excerpt">${post.excerpt}</p>` : ''}
          <div class="blog-meta">
            <span>${formatDate(post.date)}</span>
            <span>${post.readTime} min leestijd</span>
          </div>
        </div>
      </article>
    `).join('');
  }

  if (layout === 'grid-uniform') {
    const catColors = {
      'AI Oplossingen':    'rgba(201,168,76,.12)',
      'Automatisering':    'rgba(100,180,255,.08)',
      'Social Media':      'rgba(180,100,255,.08)',
      'Digitale Marketing':'rgba(100,220,150,.08)'
    };
    container.innerHTML = posts.map((post, i) => `
      <article class="blog-card-uni" style="cursor:pointer;" onclick="window.location.href='/blog/' + '${post.slug}'">
        <div class="bcu-img" style="background:linear-gradient(145deg,var(--black3),${catColors[post.category]||'rgba(201,168,76,.06)'})">
          <div class="bcu-icon">${getCategoryIcon(post.category)}</div>
          <span class="bcu-cat">${post.category}</span>
        </div>
        <div class="bcu-body">
          <h3 class="bcu-title">${post.title}</h3>
          <p class="bcu-excerpt">${post.excerpt}</p>
          <div class="bcu-meta">
            <span>${formatDate(post.date)}</span>
            <span>${post.readTime} min leestijd</span>
          </div>
          <div class="bcu-link">
            Lees artikel
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </article>
    `).join('');
  }

  if (layout === 'list') {
    container.innerHTML = posts.map((post, i) => `
      <article class="blog-list-item"
               onclick="location.href='/blog/' + post.slug">
        <div class="bli-num">${String(i+1).padStart(2,'0')}</div>
        <div class="bli-body">
          <div class="bli-cat">${post.category}</div>
          <h3 class="bli-title">${post.title}</h3>
          <p class="bli-excerpt">${post.excerpt}</p>
        </div>
        <div class="bli-meta">
          <span class="bli-date">${formatDate(post.date)}</span>
          <span class="bli-read">${post.readTime} min</span>
          <div class="bli-arrow">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </article>
    `).join('');
  }

  // Re-observe
  if (window._revealObserver) {
    container.querySelectorAll('.reveal').forEach(el => window._revealObserver.observe(el));
  }
}

/**
 * Haal SVG icon op per categorie
 */
function getCategoryIcon(category) {
  const icons = {
    'AI Oplossingen': `<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="5" y="5" width="30" height="30" rx="3" stroke="currentColor" stroke-width="1.2"/><circle cx="20" cy="20" r="5" stroke="currentColor" stroke-width="1.2"/><path d="M20 5V15M20 25V35M5 20H15M25 20H35" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    'Automatisering': `<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M7 20C7 12.82 12.82 7 20 7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M33 20C33 27.18 27.18 33 20 33" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M20 7L16.5 3.5M20 7L16.5 10.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 33L23.5 36.5M20 33L23.5 29.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="20" r="4" stroke="currentColor" stroke-width="1.2"/></svg>`,
    'Social Media':   `<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="10" cy="20" r="4" stroke="currentColor" stroke-width="1.2"/><circle cx="30" cy="10" r="4" stroke="currentColor" stroke-width="1.2"/><circle cx="30" cy="30" r="4" stroke="currentColor" stroke-width="1.2"/><path d="M14 17.5L26 12.5M14 22.5L26 27.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    'Digitale Marketing': `<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M6 30L14 20L22 25L30 14L38 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="38" cy="8" r="2.5" fill="currentColor"/><path d="M6 36H38" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`
  };
  return icons[category] || icons['AI Oplossingen'];
}

/**
 * Filter posts op categorie
 */
function filterByCategory(category) {
  return category === 'Alle'
    ? BLOG_POSTS
    : BLOG_POSTS.filter(p => p.category === category);
}

/**
 * Zoek posts op keyword
 */
function searchPosts(query) {
  const q = query.toLowerCase();
  return BLOG_POSTS.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.excerpt.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q))
  );
}

/**
 * Haal post op via slug
 */
function getPostBySlug(slug) {
  return BLOG_POSTS.find(p => p.slug === slug) || null;
}

/* ── 3. BLOG WRITER (Anthropic API) ─────────────────
   Schrijft automatisch nieuwe blogartikelen via Claude.
   Gebruik: await BlogWriter.generate({ topic, category, tone })
──────────────────────────────────────────────────── */
const BlogWriter = {

  /**
   * Genereer een compleet blogartikel via Anthropic API
   * @param {Object} opts
   * @param {string} opts.topic      — bijv. "AI chatbots voor e-commerce"
   * @param {string} opts.category   — bijv. "AI Oplossingen"
   * @param {string} opts.tone       — "professioneel" | "toegankelijk" | "provocerend"
   * @param {number} opts.wordCount  — doelaantal woorden (default: 800)
   * @returns {Promise<Object>}      — post-object klaar voor BlogStorage.save()
   */
  async generate({ topic, category = 'AI Oplossingen', tone = 'professioneel', wordCount = 800 } = {}) {

    const systemPrompt = `
Je bent de contentstrateeg van Rocket Agency, een premium AI & digitale marketing bureau in Nederland.
Je schrijft gezaghebbende, diepgaande blogartikelen die:
- Echt waarde bieden (geen oppervlakkige content)
- Doelgroep: ondernemers en marketing managers in het MKB
- Toon: ${tone}, direct, resultaatgericht
- Altijd onderbouwd met concrete voorbeelden en cijfers
- Afsluit met een sterke CTA richting Rocket Agency

Geef altijd JSON terug in dit exact formaat (geen markdown code blocks):
{
  "title": "...",
  "excerpt": "...(max 180 tekens)",
  "content": "...(volledige HTML artikel body, gebruik <h2>, <p>, <ul> tags)",
  "tags": ["tag1", "tag2", "tag3"],
  "readTime": number
}
    `.trim();

    const userPrompt = `
Schrijf een blogartikel voor Rocket Agency over: "${topic}"
Categorie: ${category}
Doellengte: ~${wordCount} woorden
Toon: ${tone}

Verwerk praktische voorbeelden en concrete resultaten. 
Eindig met een subtiele maar overtuigende CTA om contact op te nemen met Rocket Agency.
    `.trim();

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2500,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const text = data.content.map(b => b.text || '').join('');

      let parsed;
      try {
        parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch {
        throw new Error('Kon JSON niet parsen uit API response');
      }

      const slug = parsed.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 60);

      return {
        id: `auto-${Date.now()}`,
        title: parsed.title,
        excerpt: parsed.excerpt,
        content: parsed.content,
        category,
        tags: parsed.tags || [],
        date: new Date().toISOString().split('T')[0],
        readTime: parsed.readTime || Math.ceil(wordCount / 200),
        featured: false,
        slug,
        author: 'Julian van Beek',
        auto_generated: true
      };

    } catch (err) {
      console.error('[BlogWriter] Fout bij genereren:', err);
      throw err;
    }
  },

  /**
   * Genereer en sla direct op
   */
  async generateAndSave(opts) {
    const post = await this.generate(opts);
    BlogStorage.save(post);
    return post;
  }
};

/* ── 4. BLOG STORAGE ─────────────────────────────────
   Tijdelijk: localStorage
   Later: vervang door Supabase (zie comments)
──────────────────────────────────────────────────── */
const BlogStorage = {
  KEY: 'rocket_blog_posts',

  /** Alle posts (seed + opgeslagen) */
  getAll() {
    const saved = this._load();
    const existingIds = new Set(saved.map(p => p.id));
    return [...BLOG_POSTS.filter(p => !existingIds.has(p.id)), ...saved]
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  /** Sla nieuwe post op */
  save(post) {
    const posts = this._load();
    const idx = posts.findIndex(p => p.id === post.id);
    if (idx >= 0) posts[idx] = post;
    else posts.unshift(post);
    localStorage.setItem(this.KEY, JSON.stringify(posts));
    return post;
  },

  /** Verwijder post */
  remove(id) {
    const posts = this._load().filter(p => p.id !== id);
    localStorage.setItem(this.KEY, JSON.stringify(posts));
  },

  _load() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
    catch { return []; }
  }

  /*
  ── SUPABASE UPGRADE (vervang bovenstaande methodes) ──
  
  async getAll() {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('date', { ascending: false });
    return [...BLOG_POSTS, ...(data || [])];
  },

  async save(post) {
    await supabase.from('blog_posts').upsert(post);
    return post;
  },

  async remove(id) {
    await supabase.from('blog_posts').delete().eq('id', id);
  }
  */
};

/* ── EXPORTS (voor gebruik in pagina's) ─────────────── */
window.RocketBlog = {
  posts: BLOG_POSTS,
  render: renderBlogGrid,
  filter: filterByCategory,
  search: searchPosts,
  getBySlug: getPostBySlug,
  formatDate,
  getCategoryIcon,
  writer: BlogWriter,
  storage: BlogStorage
};

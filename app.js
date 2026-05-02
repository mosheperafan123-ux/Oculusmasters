document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Scroll Reveal (Intersection Observer)
    initScrollReveal();

    // 2. Initialize Mobile Menu
    initMobileMenu();

    // 3. Fetch and Parse Catalog Data
    await loadCatalogData();

    // 4. Initialize Delight Elements (CTA Micro-interactions)
    initDelightInteractions();
});

function initDelightInteractions() {
    const finalCta = document.getElementById('final-cta');
    if (finalCta) {
        finalCta.addEventListener('click', function(e) {
            e.preventDefault();
            const originalText = this.querySelector('.cta-text').innerText;
            const originalIcon = this.querySelector('.icon-wrapper').innerHTML;
            
            // Loading state
            this.querySelector('.cta-text').innerText = 'Preparando acceso...';
            this.querySelector('.icon-wrapper').innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin-anim"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';
            this.style.pointerEvents = 'none';
            this.style.opacity = '0.9';
            
            setTimeout(() => {
                // Success state
                this.querySelector('.cta-text').innerText = '¡Redirigiendo!';
                this.querySelector('.icon-wrapper').innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00FFFF" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
                
                setTimeout(() => {
                    window.open(this.href, '_blank');
                    // Reset
                    this.querySelector('.cta-text').innerText = originalText;
                    this.querySelector('.icon-wrapper').innerHTML = originalIcon;
                    this.style.pointerEvents = 'auto';
                    this.style.opacity = '1';
                }, 800);
            }, 1000);
        });
    }
}

function initScrollReveal() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
}

function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const overlay = document.getElementById('mobile-menu');
    const links = document.querySelectorAll('.mobile-link');
    
    if (btn && overlay) {
        btn.addEventListener('click', () => {
            overlay.classList.toggle('open');
            btn.classList.toggle('open');
        });
        
        links.forEach(link => {
            link.addEventListener('click', () => {
                overlay.classList.remove('open');
                btn.classList.remove('open');
            });
        });
    }
}

async function loadCatalogData() {
    try {
        processAndRenderCatalog(vrCatalogData);
    } catch (error) {
        console.error('Error loading catalog data:', error);
    }
}

function processAndRenderCatalog(data) {
    let totalGames = 0;
    let totalValueUSD = 0;
    let categoryData = [];
    let allGames = [];

    // Analyze data
    for (const [categoryName, games] of Object.entries(data.categories)) {
        if (categoryName === 'Utilidades' || categoryName.toLowerCase().includes('utilidades')) continue;

        let catGamesCount = games.length;
        let catValue = games.reduce((sum, game) => sum + (game.estimated_price_usd || 0), 0);
        
        totalGames += catGamesCount;
        totalValueUSD += catValue;

        let catValueCOP = catValue * 4000;

        // Get top 5 games for this category
        let top5 = [...games].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5).map(g => g.name);

        categoryData.push({
            name: categoryName,
            count: catGamesCount,
            valueCOP: catValueCOP,
            topGames: top5
        });

        allGames = allGames.concat(games);
    }

    // Sort categories by game count (descending)
    categoryData.sort((a, b) => b.count - a.count);

    // Update Global Stats
    // Convert USD to COP (approx 4000)
    const totalValueCOP = totalValueUSD * 4000;
    const valueInMillions = (totalValueCOP / 1000000).toFixed(1);

    const statsContainer = document.getElementById('global-stats');
    if(statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-item">
                <div class="stat-value">+${Math.floor(totalGames/100)*100}</div>
                <div class="stat-label">Juegos y Apps Premium</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" style="text-decoration: line-through; color: var(--text-secondary); font-size: 1.5rem;">Normal: $400.000 COP</div>
                <div class="stat-value" style="color: var(--accent-purple);">$200.000 COP</div>
                <div class="stat-label">Pago Único (Cero Mensualidades)</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">∞</div>
                <div class="stat-label">Horas de Diversión</div>
            </div>
        `;
    }

    // Render Category List (Premium Cards)
    renderCategoryList(categoryData);

    // Render Top 15 Marquee
    renderTopGamesMarquee(allGames);
}

function renderCategoryList(categories) {
    const container = document.getElementById('category-list');
    if (!container) return;

    let html = '';
    
    // Copywriting descriptions for categories
    const categoryCopy = {
        'Deportes': 'Golf, boxeo, ping pong y más. Quema calorías mientras compites en los mejores simuladores.',
        'Casual y Otros': 'Experiencias para toda la familia. Rompecabezas, aventuras y diversión sin límites.',
        'Acción y Disparos': 'Adrenalina pura. Supervivencia zombie, shooters tácticos y combate cuerpo a cuerpo.',
        'Carreras': 'Siente la velocidad en circuitos épicos. Desde karts hasta simuladores profesionales.',
        'Terror': 'No apto para cardíacos. Sobrevive a pesadillas donde el miedo se siente completamente real.',
        'RPG y Aventura': 'Explora mundos mágicos, forja tu destino y vive historias épicas inolvidables.',
        'Fitness': 'Entrena mientras juegas. Rutinas disfrazadas de diversión que te ponen en forma.',
        'Puzles y Lógica': 'Ejercita tu mente en 3D. Acertijos envolventes que desafían tu ingenio espacial.',
        'Música y Ritmo': 'Beat Saber, Pistol Whip y más. Ritmo, luces y diversión en cada sesión.',
        'Simulación': 'Pilota aviones, conduce autos o construye ciudades enteras con tus propias manos.',
        'Adultos (18+)': 'Contenido exclusivo para mayores de edad. Experiencias inmersivas sin restricciones.'
    };

    // Asymmetrical Bento Pattern
    const bentoSpans = ['col-span-8', 'col-span-4', 'col-span-4', 'col-span-8', 'col-span-12', 'col-span-6', 'col-span-6'];

    categories.forEach((cat, index) => {
        const delay = (index % 3) * 100;
        const valueInMillions = (cat.valueCOP / 1000000).toFixed(1);
        const description = categoryCopy[cat.name] || 'Las mejores experiencias inmersivas diseñadas para llevar tu visor al límite.';
        const spanClass = bentoSpans[index % bentoSpans.length];
        
        let topGamesHtml = cat.topGames.map(g => `<div class="art-game-pill">${g}</div>`).join('');

        html += `
            <div class="art-card bento-item ${spanClass} reveal delay-${delay}">
                <div class="glass-panel-outer h-full" style="height: 100%;">
                    <div class="art-card-inner glass-panel-inner" style="height: 100%;">
                        <div class="art-card-header">
                            <h3 class="art-card-title">${cat.name}</h3>
                            <p class="art-card-desc">${description}</p>
                        </div>
                        
                        <div class="art-card-value-box">
                            <div class="art-value-label">VALOR EN TIENDA</div>
                            <div class="art-value-price">$${valueInMillions} Millones COP</div>
                            <div class="art-value-count">${cat.count} Juegos Incluidos</div>
                        </div>
                        
                        <div class="art-card-games" style="margin-top: auto;">
                            <div class="art-games-label">Juegos Destacados:</div>
                            <div class="art-games-list">
                                ${topGamesHtml}
                                <span class="art-game-pill art-game-pill-more">+ ${cat.count - 5} más</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    setTimeout(() => initScrollReveal(), 100);
}



function renderTopGamesMarquee(allGames) {
    const marqueeContainer = document.getElementById('marquee-track');
    if (!marqueeContainer) return;

    // Sort by rating desc, take top 15
    const topGames = allGames.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 15);

    let html = '';
    topGames.forEach((game, index) => {
        html += `
            <div class="marquee-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent-cyan)" stroke="var(--accent-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span class="marquee-game-name">${game.name}</span>
            </div>
        `;
    });

    // Duplicate for infinite scrolling effect
    marqueeContainer.innerHTML = html + html;
}

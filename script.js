/* ================================= */
/* GALERÍA CARRUSEL */
/* ================================= */

const gallerySlides = document.querySelectorAll('.gallery-slide');
const galleryPrevBtn = document.querySelector('.gallery-btn--prev');
const galleryNextBtn = document.querySelector('.gallery-btn--next');
const galleryDotsContainer = document.querySelector('.gallery-dots');

const galleryLightbox = document.getElementById('galleryLightbox');
const galleryLightboxImg = document.querySelector('.gallery-lightbox-img');
const galleryLightboxClose = document.querySelector('.gallery-lightbox-close');

let currentGallerySlide = 0;
let galleryAutoplay = null;

function getCircularIndex(index, total){
    return (index + total) % total;
}

function showGallerySlide(index){

    if(!gallerySlides.length) return;

    const total = gallerySlides.length;

    currentGallerySlide = getCircularIndex(index, total);

    gallerySlides.forEach((slide, slideIndex) => {

        slide.classList.remove(
            'is-active',
            'is-prev',
            'is-next',
            'is-far-prev',
            'is-far-next'
        );

        if(slideIndex === currentGallerySlide){
            slide.classList.add('is-active');
        }

        if(slideIndex === getCircularIndex(currentGallerySlide - 1, total)){
            slide.classList.add('is-prev');
        }

        if(slideIndex === getCircularIndex(currentGallerySlide + 1, total)){
            slide.classList.add('is-next');
        }

        if(slideIndex === getCircularIndex(currentGallerySlide - 2, total)){
            slide.classList.add('is-far-prev');
        }

        if(slideIndex === getCircularIndex(currentGallerySlide + 2, total)){
            slide.classList.add('is-far-next');
        }

    });

    updateGalleryDots();
}

function createGalleryDots(){

    if(!galleryDotsContainer || !gallerySlides.length) return;

    galleryDotsContainer.innerHTML = '';

    gallerySlides.forEach((_, index) => {

        const dot = document.createElement('button');

        dot.classList.add('gallery-dot');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Ver imagen ${index + 1}`);

        dot.addEventListener('click', () => {
            showGallerySlide(index);
            restartGalleryAutoplay();
        });

        galleryDotsContainer.appendChild(dot);

    });

}

function updateGalleryDots(){

    if(!galleryDotsContainer) return;

    const dots = galleryDotsContainer.querySelectorAll('.gallery-dot');

    dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === currentGallerySlide);
    });

}

function startGalleryAutoplay(){

    stopGalleryAutoplay();

    galleryAutoplay = setInterval(() => {
        showGallerySlide(currentGallerySlide + 1);
    }, 3800);

}

function stopGalleryAutoplay(){

    if(galleryAutoplay){
        clearInterval(galleryAutoplay);
        galleryAutoplay = null;
    }

}

function restartGalleryAutoplay(){

    stopGalleryAutoplay();
    startGalleryAutoplay();

}

function openGalleryLightbox(slide){

    if(!galleryLightbox || !galleryLightboxImg) return;

    const image = slide.querySelector('img');

    if(!image) return;

    stopGalleryAutoplay();

    galleryLightboxImg.src = image.src;
    galleryLightboxImg.alt = image.alt;

    galleryLightbox.classList.add('is-open');
    galleryLightbox.setAttribute('aria-hidden', 'false');

}

function closeGalleryLightbox(){

    if(!galleryLightbox || !galleryLightboxImg) return;

    galleryLightbox.classList.remove('is-open');
    galleryLightbox.setAttribute('aria-hidden', 'true');

    galleryLightboxImg.src = '';
    galleryLightboxImg.alt = '';

    startGalleryAutoplay();

}

if(gallerySlides.length){

    createGalleryDots();
    showGallerySlide(0);
    startGalleryAutoplay();

    gallerySlides.forEach((slide, index) => {

        slide.addEventListener('click', () => {

            const wasActive = index === currentGallerySlide;

            if(wasActive){
                openGalleryLightbox(slide);
                return;
            }

            showGallerySlide(index);
            restartGalleryAutoplay();

        });

    });

}

if(galleryPrevBtn){

    galleryPrevBtn.addEventListener('click', () => {
        showGallerySlide(currentGallerySlide - 1);
        restartGalleryAutoplay();
    });

}

if(galleryNextBtn){

    galleryNextBtn.addEventListener('click', () => {
        showGallerySlide(currentGallerySlide + 1);
        restartGalleryAutoplay();
    });

}

if(galleryLightbox){

    galleryLightbox.addEventListener('click', (event) => {

        if(event.target === galleryLightbox){
            closeGalleryLightbox();
        }

    });

}

if(galleryLightboxClose){

    galleryLightboxClose.addEventListener('click', closeGalleryLightbox);

}

document.addEventListener('keydown', (event) => {

    if(event.key === 'Escape' && galleryLightbox && galleryLightbox.classList.contains('is-open')){
        closeGalleryLightbox();
    }

});

/* ================================= */
/* APARICIÓN DE SECCIONES */
/* ================================= */

const sections = document.querySelectorAll('.section');

const observer = new IntersectionObserver(

    entries => {

        entries.forEach(entry => {

            if(entry.isIntersecting){

                entry.target.classList.add('visible');

            }

        });

    },

    {
        threshold:0.15
    }

);

sections.forEach(section=>{

    section.classList.add('hidden');

    observer.observe(section);

});

/* ================================= */
/* HERO PATTERN REVEAL */
/* ================================= */

const hero = document.querySelector('.hero');
const heroPattern = document.getElementById('heroPattern');
const heroLogoButton = document.getElementById('heroLogoButton');

const topNav = document.getElementById('topNav'); /* para quu aparezca la barra superior después del Hero */

const patternColors = {
    yellow:'#FFDD0E',
    blue:'#008FB8',
    green:'#6AAA2C',
    red:'#D62416',
    dots:'#222222',
    bg:'#ECECEC'
};

const HERO_VISUAL_SCALE = 0.75;
const HERO_PATTERN_SCALE = 1 / HERO_VISUAL_SCALE;

let revealPoints = [];
let revealAnimationFrame = null;

/* ================================= */
/* UTILIDADES */
/* ================================= */

function rand(min, max){
    return Math.random() * (max - min) + min;
}

function pickWeighted(items){
    const total = items.reduce((acc, item) => acc + item.weight, 0);
    let r = Math.random() * total;

    for(const item of items){
        r -= item.weight;
        if(r <= 0) return item.value;
    }

    return items[items.length - 1].value;
}

function octagonPoints(cx, cy, r){
    const points = [];

    for(let i = 0; i < 8; i++){
        const angle = (Math.PI / 4) * i + Math.PI / 8;
        points.push([
            cx + Math.cos(angle) * r,
            cy + Math.sin(angle) * r
        ]);
    }

    return points.map(point => point.join(',')).join(' ');
}

function starPoints(cx, cy, outerR, innerR, spikes = 8){
    const points = [];

    for(let i = 0; i < spikes * 2; i++){
        const angle = -Math.PI / 2 + (Math.PI / spikes) * i;
        const r = i % 2 === 0 ? outerR : innerR;

        points.push([
            cx + Math.cos(angle) * r,
            cy + Math.sin(angle) * r
        ]);
    }

    return points.map(point => point.join(',')).join(' ');
}

/* ================================= */
/* CASILLAS */
/* ================================= */

function drawSmallOctagon(cx, cy, size, color){
    return `
        <polygon points="${octagonPoints(cx, cy, size)}" fill="${color}" />
        <circle cx="${cx}" cy="${cy}" r="${size * 0.34}" fill="${patternColors.bg}" />
    `;
}

function drawRedStar(cx, cy, size){
    return `
        <polygon points="${starPoints(cx, cy, size, size * 0.62)}" fill="${patternColors.red}" />
        <circle cx="${cx}" cy="${cy}" r="${size * 0.30}" fill="${patternColors.bg}" />
    `;
}

function drawLargeGreenBonus(cx, cy, size){
    return `
        <polygon points="${octagonPoints(cx, cy, size)}" fill="${patternColors.green}" />
        <polygon points="${octagonPoints(cx, cy, size * 0.72)}" fill="none" stroke="${patternColors.bg}" stroke-width="3" />
        <circle cx="${cx}" cy="${cy}" r="${size * 0.30}" fill="${patternColors.bg}" />
    `;
}

function drawLargeYellowGoal(cx, cy, size){
    return `
        <polygon points="${octagonPoints(cx, cy, size)}" fill="${patternColors.yellow}" />
        <polygon points="${starPoints(cx, cy, size * 0.58, size * 0.38)}" fill="none" stroke="${patternColors.bg}" stroke-width="3" />
        <circle cx="${cx}" cy="${cy}" r="${size * 0.28}" fill="${patternColors.bg}" />
    `;
}

function drawNode(node){
    switch(node.type){
        case 'blue':
            return drawSmallOctagon(node.x, node.y, 21, patternColors.blue);

        case 'green':
            return drawSmallOctagon(node.x, node.y, 21, patternColors.green);

        case 'yellow':
            return drawSmallOctagon(node.x, node.y, 21, patternColors.yellow);

        case 'red':
            return drawRedStar(node.x, node.y, 20);

        case 'green-large':
            return drawLargeGreenBonus(node.x, node.y, 30);

        case 'yellow-large':
            return drawLargeYellowGoal(node.x, node.y, 30);

        default:
            return drawSmallOctagon(node.x, node.y, 21, patternColors.blue);
    }
}

function getNodeRadius(type){
    if(type === 'red') return 20;
    if(type === 'green-large' || type === 'yellow-large') return 30;
    return 21;
}

/* ================================= */
/* CAMINOS */
/* ================================= */

function drawDottedLine(nodeA, nodeB){

    const x1 = nodeA.x;
    const y1 = nodeA.y;
    const x2 = nodeB.x;
    const y2 = nodeB.y;

    const r1 = getNodeRadius(nodeA.type);
    const r2 = getNodeRadius(nodeB.type);

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if(dist < 65) return '';

    const ux = dx / dist;
    const uy = dy / dist;

    /*
        Menor margen desde la casilla:
        permite que los 3 puntos respiren mejor.
    */
    const startInset = r1 + 8;
    const endInset = r2 + 8;

    const sx = x1 + ux * startInset;
    const sy = y1 + uy * startInset;

    const ex = x2 - ux * endInset;
    const ey = y2 - uy * endInset;

    const positions = [0.25, 0.5, 0.75];

    return positions.map(t => {

        const px = sx + (ex - sx) * t;
        const py = sy + (ey - sy) * t;

        return `<circle cx="${px}" cy="${py}" r="4" fill="${patternColors.dots}" />`;

    }).join('');
}

/* ================================= */
/* MÓDULO DE PATRÓN */
/* Generador por recorridos con colisión */
/* ================================= */

function randomNodeType(){

    return pickWeighted([
        { value:'blue', weight:5 },
        { value:'green', weight:5 },
        { value:'yellow', weight:5 },
        { value:'red', weight:2.4 },

        /*
        Las casillas grandes aparecen poco,
        para que no dominen el fondo.
        */
        { value:'green-large', weight:0.35 },
        { value:'yellow-large', weight:0.25 }
    ]);

}

function getNodeCollisionRadius(node){

    return getNodeRadius(node.type) + 18;

}

function rectsIntersect(a, b){

    return !(
        a.x + a.w < b.x ||
        a.x > b.x + b.w ||
        a.y + a.h < b.y ||
        a.y > b.y + b.h
    );

}

function pointInsideZone(x, y, zone){

    return (
        x >= zone.x &&
        x <= zone.x + zone.w &&
        y >= zone.y &&
        y <= zone.y + zone.h
    );

}

function nodeInsideZone(node, zone){

    const r = getNodeCollisionRadius(node);

    const nodeBox = {
        x:node.x - r,
        y:node.y - r,
        w:r * 2,
        h:r * 2
    };

    return rectsIntersect(nodeBox, zone);

}

function segmentTouchesZone(a, b, zones){

    /*
    Revisa varios puntos del camino para evitar
    que los puntos negros atraviesen zonas protegidas.
    */
    for(let i = 0; i <= 8; i++){

        const t = i / 8;

        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;

        const touches = zones.some(zone => pointInsideZone(x, y, zone));

        if(touches) return true;

    }

    return false;

}

function getExclusionZones(width, height, scale = 1){

    const zones = [];

    const heroRect = hero.getBoundingClientRect();
    const content = document.querySelector('.hero-content');
    const nav = document.querySelector('.hero-section-nav');

    /*
    Zona protegida del logo + subtítulo.
    Se calcula desde el elemento real, no desde medidas inventadas.
    */

    if(content){

        const rect = content.getBoundingClientRect();

        zones.push({
            x:(rect.left - heroRect.left - 150) * scale,
            y:(rect.top - heroRect.top - 85) * scale,
            w:(rect.width + 300) * scale,
            h:(rect.height + 170) * scale
        });
    }

    /*
    Zona protegida de casillas navegables.
    Más amplia para evitar casillas decorativas cerca.
    */
    if(nav){

        const rect = nav.getBoundingClientRect();

        zones.push({
            x:(rect.left - heroRect.left - 170) * scale,
            y:(rect.top - heroRect.top - 110) * scale,
            w:(rect.width + 340) * scale,
            h:(rect.height + 220) * scale
        });

    }

    /*
    Respaldo por si el navegador calcula tarde los elementos.
    */
    if(zones.length === 0){

        zones.push({
            x:width / 2 - 560,
            y:height * 0.42 - 240,
            w:1120,
            h:430
        });

        zones.push({
            x:width / 2 - 560,
            y:height * 0.68 - 170,
            w:1120,
            h:300
        });

    }

    return zones;

}

function canPlaceNode(node, existingNodes, exclusionZones, width, height){

    const r = getNodeCollisionRadius(node);
    const margin = 35;

    if(node.x - r < margin) return false;
    if(node.x + r > width - margin) return false;
    if(node.y - r < margin) return false;
    if(node.y + r > height - margin) return false;

    const blockedByZone = exclusionZones.some(zone => nodeInsideZone(node, zone));

    if(blockedByZone) return false;

    const overlaps = existingNodes.some(other => {

        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        return dist < getNodeCollisionRadius(node) + getNodeCollisionRadius(other);

    });

    return !overlaps;

}

function createRandomStart(existingNodes, exclusionZones, width, height){

    const bands = [
        /* Superior */
        {
            kind:'top',
            x:40,
            y:40,
            w:width - 80,
            h:height * 0.24
        },
        {
            kind:'top',
            x:40,
            y:40,
            w:width - 80,
            h:height * 0.24
        },

        /* Lateral izquierdo */
        {
            kind:'left',
            x:40,
            y:height * 0.18,
            w:width * 0.24,
            h:height * 0.58
        },

        /* Lateral derecho */
        {
            kind:'right',
            x:width * 0.76,
            y:height * 0.18,
            w:width * 0.20,
            h:height * 0.58
        },

        /* Inferior dentro del Hero */
        {
            kind:'bottom',
            x:40,
            y:height * 0.72,
            w:width - 80,
            h:height * 0.18
        },

        /* Franja entre Hero e introducción */
        {
            kind:'bottom',
            x:40,
            y:height * 0.86,
            w:width - 80,
            h:height * 0.12
        }
    ];

    for(let i = 0; i < 160; i++){

        const band = bands[Math.floor(rand(0, bands.length))];

        const node = {
            x:rand(band.x, band.x + band.w),
            y:rand(band.y, band.y + band.h),
            type:randomNodeType(),
            startBand:band.kind
        };

        if(canPlaceNode(node, existingNodes, exclusionZones, width, height)){
            return node;
        }
    }

    return null;
}

function ccw(A, B, C){
    return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
}

function segmentsIntersect(A, B, C, D){
    return ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D);
}

function linkCrossesExisting(a, b, existingLinks){

    for(const [p1, p2] of existingLinks){

        // si comparten punto, no lo consideramos cruce
        if(
            (a.x === p1.x && a.y === p1.y) ||
            (a.x === p2.x && a.y === p2.y) ||
            (b.x === p1.x && b.y === p1.y) ||
            (b.x === p2.x && b.y === p2.y)
        ){
            continue;
        }

        if(segmentsIntersect(a, b, p1, p2)){
            return true;
        }
    }

    return false;
}

function getNodeDegree(node, links){

    let degree = 0;

    for(const [a, b] of links){
        if(
            (a.x === node.x && a.y === node.y) ||
            (b.x === node.x && b.y === node.y)
        ){
            degree++;
        }
    }

    return degree;
}

function getInitialRouteAngle(startBand){

    let angles;

    if(startBand === 'top' || startBand === 'bottom'){

        angles = [
            0,
            Math.PI,
            Math.PI / 8,
            -Math.PI / 8,
            Math.PI - Math.PI / 8,
            Math.PI + Math.PI / 8,
            Math.PI / 6,
            -Math.PI / 6,
            Math.PI - Math.PI / 6,
            Math.PI + Math.PI / 6
        ];

    }else{

        angles = [
            Math.PI / 2,
            Math.PI * 3 / 2,
            Math.PI / 4,
            Math.PI * 3 / 4,
            Math.PI * 5 / 4,
            Math.PI * 7 / 4,
            0,
            Math.PI
        ];

    }

    return angles[Math.floor(rand(0, angles.length))];
}

function createRoute(graph, exclusionZones, width, height){

    const tempNodes = [];
    const tempLinks = [];

    const routeStep = 132;
    const routeLength = Math.floor(rand(6, 11));

    let current = createRandomStart(graph.nodes, exclusionZones, width, height);

    if(!current) return;

    tempNodes.push(current);

    let currentAngle = getInitialRouteAngle(current.startBand);

    for(let i = 1; i < routeLength; i++){

        let nextNode = null;
        let selectedAngle = currentAngle;

        for(let attempt = 0; attempt < 30; attempt++){

            const turnOptions = current.startBand === 'top' || current.startBand === 'bottom'
                ? [
                    -Math.PI / 6,
                    -Math.PI / 8,
                    0,
                    Math.PI / 8,
                    Math.PI / 6
                ]
                : [
                    -Math.PI / 2,
                    -Math.PI / 4,
                    -Math.PI / 6,
                    0,
                    Math.PI / 6,
                    Math.PI / 4,
                    Math.PI / 2
                ];

            const turn = turnOptions[Math.floor(rand(0, turnOptions.length))];
            selectedAngle = currentAngle + turn + rand(-0.12, 0.12);

            const candidate = {
                x:current.x + Math.cos(selectedAngle) * routeStep,
                y:current.y + Math.sin(selectedAngle) * routeStep,
                type:randomNodeType()
            };

            const testNodes = graph.nodes.concat(tempNodes);
            const allLinks = graph.links.concat(tempLinks);

            const canPlace = canPlaceNode(
                candidate,
                testNodes,
                exclusionZones,
                width,
                height
            );

            const segmentBlocked = segmentTouchesZone(current, candidate, exclusionZones);
            const segmentCrosses = linkCrossesExisting(current, candidate, allLinks);

            if(canPlace && !segmentBlocked && !segmentCrosses){
                nextNode = candidate;
                break;
            }
        }

        if(!nextNode) break;

        tempNodes.push(nextNode);
        tempLinks.push([current, nextNode]);

        current = nextNode;
        currentAngle = selectedAngle;
    }

    if(tempNodes.length < 3) return;

    graph.nodes.push(...tempNodes);
    graph.links.push(...tempLinks);

    /*
        Ramificaciones:
        nacen desde nodos intermedios y no desde todos.
    */
    const branchCandidates = tempNodes.slice(1, -1);

    branchCandidates.forEach(origin => {

        if(Math.random() > 0.38) return;

        const degree = getNodeDegree(origin, graph.links);
        if(degree >= 3) return;

        let branchLength = Math.floor(rand(2, 4));
        let branchCurrent = origin;

        let baseBranchAngle = rand(0, Math.PI * 2);

        for(let j = 0; j < branchLength; j++){

            let branchNode = null;
            let branchAngle = baseBranchAngle;

            for(let attempt = 0; attempt < 24; attempt++){

                const turnOptions = [
                    -Math.PI / 3,
                    -Math.PI / 4,
                    -Math.PI / 6,
                    Math.PI / 6,
                    Math.PI / 4,
                    Math.PI / 3
                ];

                const turn = turnOptions[Math.floor(rand(0, turnOptions.length))];
                branchAngle = baseBranchAngle + turn + rand(-0.12, 0.12);

                const candidate = {
                    x:branchCurrent.x + Math.cos(branchAngle) * routeStep,
                    y:branchCurrent.y + Math.sin(branchAngle) * routeStep,
                    type:randomNodeType()
                };

                const canPlace = canPlaceNode(
                    candidate,
                    graph.nodes,
                    exclusionZones,
                    width,
                    height
                );

                const segmentBlocked = segmentTouchesZone(branchCurrent, candidate, exclusionZones);
                const segmentCrosses = linkCrossesExisting(branchCurrent, candidate, graph.links);

                if(canPlace && !segmentBlocked && !segmentCrosses){
                    branchNode = candidate;
                    break;
                }
            }

            if(!branchNode) break;

            graph.nodes.push(branchNode);
            graph.links.push([branchCurrent, branchNode]);

            branchCurrent = branchNode;
            baseBranchAngle = branchAngle;
        }
    });
}

/* ================================= */
/* GENERAR PATRÓN */
/* ================================= */

function generateHeroPattern(){

    if(!hero || !heroPattern) return;

    const width = hero.offsetWidth * HERO_PATTERN_SCALE;
    const height = hero.offsetHeight * HERO_PATTERN_SCALE;

    const exclusionZones = getExclusionZones(width, height, HERO_PATTERN_SCALE);

    const graph = {
        nodes:[],
        links:[]
    };

    const targetNodes = Math.min(
        260,
        Math.max(150, Math.floor((width * height) / 6500))
    );

    let attempts = 0;

    while(graph.nodes.length < targetNodes && attempts < 220){

        createRoute(graph, exclusionZones, width, height);
        attempts++;

    }

    const pathsMarkup = graph.links
        .map(([a, b]) => drawDottedLine(a, b))
        .join('');

    const nodesMarkup = graph.nodes
        .map(node => drawNode(node))
        .join('');

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <rect width="100%" height="100%" fill="${patternColors.bg}" />
            ${pathsMarkup}
            ${nodesMarkup}
        </svg>
    `;

    const encodedSvg = encodeURIComponent(svg)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');

    const patternUrl = `url("data:image/svg+xml;charset=utf-8,${encodedSvg}")`;

    heroPattern.style.backgroundImage = patternUrl;
}

/* ================================= */
/* REVEAL CON ESTELA */
/* ================================= */

function applyRevealMask(){
    if(!heroPattern) return;

    const now = performance.now();
    const duration = 900;

    revealPoints = revealPoints.filter(point => now - point.time < duration);

    if(revealPoints.length === 0){
        heroPattern.style.webkitMaskImage = 'none';
        heroPattern.style.maskImage = 'none';
        hero.classList.remove('is-revealing');
        revealAnimationFrame = null;
        return;
    }

    hero.classList.add('is-revealing');

    const gradients = revealPoints.map(point => {
        const age = (now - point.time) / duration;
        const inner = 42 + (age * 10);
        const outer = 140 + (age * 25);

        return `radial-gradient(circle ${outer}px at ${point.x}px ${point.y}px,
            rgba(0,0,0,1) 0px,
            rgba(0,0,0,0.92) ${inner * 0.35}px,
            rgba(0,0,0,0.55) ${inner * 0.70}px,
            rgba(0,0,0,0.0) ${outer}px)`;
    }).join(',');

    heroPattern.style.webkitMaskImage = gradients;
    heroPattern.style.maskImage = gradients;

    revealAnimationFrame = requestAnimationFrame(applyRevealMask);
}

function addRevealPoint(x, y){
    const last = revealPoints[revealPoints.length - 1];

    if(last){
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if(dist < 18) return;
    }

    revealPoints.push({
        x,
        y,
        time: performance.now()
    });

    if(!revealAnimationFrame){
        applyRevealMask();
    }
}

function updateRevealPosition(event){
    if(!hero) return;

    const rect = hero.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    addRevealPoint(x, y);
}

/* ================================= */
/* FLASH */
/* ================================= */

function flashPattern(){

    if(!hero) return;

    hero.classList.add('is-flashing');

    setTimeout(() => {
        hero.classList.remove('is-flashing');

    }, 1000);

}

function regeneratePatternWithTransition(){

    if(!hero || !heroPattern) return;

    /*
        Limpia la estela actual para que el cambio no se mezcle
        con el patrón anterior.
    */
    revealPoints = [];

    hero.classList.remove('is-revealing');
    hero.classList.add('is-changing');

    setTimeout(() => {

        generateHeroPattern();

        hero.classList.remove('is-changing');
        hero.classList.add('is-flashing');

    }, 260);

    setTimeout(() => {

        hero.classList.remove('is-flashing');

    }, 1500);

}

/* ================================= */
/* EVENTOS */
/* ================================= */

document.addEventListener('mousemove', (event) => {

    if(hero){

        const heroRect = hero.getBoundingClientRect();

        const mouseInsideHero =
            event.clientX >= heroRect.left &&
            event.clientX <= heroRect.right &&
            event.clientY >= heroRect.top &&
            event.clientY <= heroRect.bottom;

        if(mouseInsideHero){
            updateRevealPosition(event);
        }
    }
});

if(heroLogoButton){
    heroLogoButton.addEventListener('click', () => {
        regeneratePatternWithTransition();
    });
}

window.addEventListener('load', () => {
    generateHeroPattern();
    flashPattern();
});

window.addEventListener('resize', () => {
    generateHeroPattern();
});

/* ================================= */
/* BARRA SUPERIOR AL SALIR DEL HERO */
/* ================================= */

if(hero && topNav){

    const topNavObserver = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if(entry.isIntersecting){
                    topNav.classList.remove('is-visible');
                }else{
                    topNav.classList.add('is-visible');
                }

            });

        },
        {
            threshold:0.15
        }
    );

    topNavObserver.observe(hero);

}

/*  =================================
    =================================

         EXPERIMENTACIÓN DIGITAL

    =================================
    ================================= */

(function(){

    const experimentPage = document.body.classList.contains('experimentacion-page');

    if(!experimentPage) return;

    const root = document.getElementById('expRoot');
    const enterButton = document.querySelector('[data-exp-enter]');
    const backEntryButton = document.querySelector('[data-exp-back-entry]');
    const resetButton = document.querySelector('[data-exp-reset]');

    const characterButtons = document.querySelectorAll('[data-exp-character]');

    const boardWrap = document.querySelector('.exp-board-wrap');
    const boardSvg = document.getElementById('expBoardSvg');

    const layerRingsGroup = document.getElementById('expLayerRings');
    const baseEdgesGroup = document.getElementById('expBaseEdges');
    const trailLayer = document.getElementById('expTrailLayer');
    const cellsLayer = document.getElementById('expCellsLayer');
    const fogLayer = document.getElementById('expFogLayer');
    const playerLayer = document.getElementById('expPlayerLayer');

    const progressFill = document.getElementById('expProgressFill');
    const progressLabel = document.getElementById('expProgressLabel');

    const atmosphereLayer = document.getElementById('expAtmosphereLayer');
    const finalOverlay = document.getElementById('expFinalOverlay');
    const finalLabel = document.getElementById('expFinalLabel');
    const comboRows = document.querySelectorAll('[data-exp-combo]');

    if(!root || !boardSvg || !cellsLayer || !playerLayer) return;

    const NS = 'http://www.w3.org/2000/svg';

    const characterColors = {
        violet:'#7C4DFF',
        pink:'#FF4FA3',
        orange:'#FF8A00',
        cyan:'#2EC8D3'
    };

    const trailPalettes = {
        violet:['#4C2BBF', '#7C4DFF', '#B49CFF', '#5F43D6'],
        pink:['#B51663', '#FF4FA3', '#FFC1DD', '#E4418D'],
        orange:['#C75C00', '#FF8A00', '#FFD166', '#F4A261'],
        cyan:['#078D9B', '#2EC8D3', '#A7F3F6', '#16A8B8']
    };

    const transformFinals = {
        bbbbb:{
            className:'fx-ghost',
            label:'Efecto fantasma'
        },
        rrrrr:{
            className:'fx-blackhole',
            label:'Agujero negro'
        },
        ggggg:{
            className:'fx-ferro',
            label:'Topografía ferrofluida'
        },
        rrrbg:{
            className:'fx-impact',
            label:'Dispersión por impacto'
        },
        grbgb:{
            className:'fx-matrix',
            label:'Pulso de escaneo'
        },
        bgrbr:{
            className:'fx-glitch',
            label:'Glitch'
        }
    };

const INTERFERENCE_CLASSES = [
    'fx-ghost',
    'fx-blackhole',
    'fx-ferro',
    'fx-impact',
    'fx-matrix',
    'fx-glitch'
];

    const colorKeys = {
        red:'r',
        green:'g',
        blue:'b'
    };

    const atmosphereColors = [
        'rgba(255,221,14,.42)',
        'rgba(106,170,44,.36)',
        'rgba(0,143,184,.34)',
        'rgba(214,36,22,.24)',
        'rgba(255,138,0,.28)'
    ];

    const RING_COUNT = 16;
    const PLAYABLE_RING_LIMIT = 3;

    const FIRST_RADIUS = 190;
    const RING_GAP = 145;

    const INITIAL_VIEW_SCALE = 0.50;

    const MIN_VIEW_SCALE = 0.28;
    const MAX_VIEW_SCALE = INITIAL_VIEW_SCALE;

    let viewScale = INITIAL_VIEW_SCALE;

    let boardWidth = 1000;
    let boardHeight = 1000;
    let boardCenterX = 500;
    let boardCenterY = 500;

    let viewOffsetX = 0;
    let viewOffsetY = 0;

    let isHoldingH = false;
    let isPanning = false;

    let panStart = {
        x:0,
        y:0,
        offsetX:0,
        offsetY:0
    };

    let interferenceTimer = null;
    let interferenceLoadingTimer = null;
    let waveFrame = null;
    let activeInterference = null;

    let nodes = [];
    let edges = [];
    let fogElements = [];

    let selectedCharacter = null;
    let selectedPlayerColor = '#7C4DFF';
    let selectedTrailColor = '#4C2BBF';

    let currentNodeId = null;
    let startNodeId = null;
    let checkpointNodeId = null;

    let routeIndex = 0;
    let currentRouteLines = [];
    let currentRouteNodeIds = [];
    let discoveredSequences = new Set();
    let blackholeGuideLines = [];

    let transformSequence = [];
    let isComplete = false;

    function createSvgElement(tag, attributes = {}){

        const element = document.createElementNS(NS, tag);

        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });

        return element;

    }

    function clamp(value, min, max){
        return Math.min(Math.max(value, min), max);
    }

    function makeNodeId(ring, index){
        return `r${ring}-n${index}`;
    }

    function getNode(id){
        return nodes.find(node => node.id === id);
    }

    function getRouteColor(){

        if(!selectedCharacter){
            return '#4C2BBF';
        }

        const palette = trailPalettes[selectedCharacter];

        return palette[routeIndex % palette.length];

    }

    function getDepthClass(ring){

        if(ring <= 2) return 'is-depth-near';
        if(ring <= 5) return 'is-depth-mid';
        if(ring <= 7) return 'is-depth-far';

        return 'is-depth-fog';

    }

    function updateSvgViewBox(){

        const width = boardWidth * viewScale;
        const height = boardHeight * viewScale;

        const baseX = boardCenterX - width / 2;
        const baseY = boardCenterY - height / 2;

        let x = baseX + viewOffsetX;
        let y = baseY + viewOffsetY;

        if(width <= boardWidth){
            x = clamp(x, 0, boardWidth - width);
        }else{
            x = (boardWidth - width) / 2;
        }

        if(height <= boardHeight){
            y = clamp(y, 0, boardHeight - height);
        }else{
            y = (boardHeight - height) / 2;
        }

        viewOffsetX = x - baseX;
        viewOffsetY = y - baseY;

        boardSvg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);

    }

    function updateBoardMetrics(){

        const maxRadius = FIRST_RADIUS + (RING_COUNT - 1) * RING_GAP;

        boardWidth = Math.max(window.innerWidth * 1.35, maxRadius * 2 + 360);
        boardHeight = Math.max(window.innerHeight * 1.35, maxRadius * 2 + 360);

        boardCenterX = boardWidth / 2;
        boardCenterY = boardHeight / 2;

        updateSvgViewBox();

    }

    function buildNodes(){

        updateBoardMetrics();

        const colorPattern = [
            'blue','green','red',
            'green','red','blue',
            'red','blue','green'
        ];

        nodes = [];

        nodes.push({
            id:makeNodeId(0, 0),
            ring:0,
            index:0,
            count:1,
            radius:0,
            x:boardCenterX,
            y:boardCenterY,
            size:82,
            color:'yellow',
            revealed:true,
            playable:true,
            element:null
        });

        for(let ring = 1; ring <= RING_COUNT; ring++){

            const radius = FIRST_RADIUS + (ring - 1) * RING_GAP;
            const playable = ring <= PLAYABLE_RING_LIMIT;

            let count;

            if(playable){
                if(ring === 1){
                    count = 10;
                }else if(ring === 2){
                    count = 14;
                }else{
                    count = 18;
                }
            }else{
                count = Math.max(
                    18 + ring * 4,
                    Math.round((Math.PI * 2 * radius) / 175)
                );
            }

            let baseSize;

            if(ring === 1){
                baseSize = 66;
            }else if(ring === 2){
                baseSize = 64;
            }else if(ring === 3){
                baseSize = 62;
            }else{
                baseSize = Math.max(28, 68 - ring * 3);
            }

            for(let i = 0; i < count; i++){

                const angle = (
                    -90 +
                    (360 / count) * i +
                    ring * 7
                ) * Math.PI / 180;

                const color = colorPattern[(i + ring) % colorPattern.length];

                nodes.push({
                    id:makeNodeId(ring, i),
                    ring,
                    index:i,
                    count,
                    radius,
                    x:boardCenterX + Math.cos(angle) * radius,
                    y:boardCenterY + Math.sin(angle) * radius,
                    size:playable ? baseSize : Math.max(22, baseSize * .52),
                    color,
                    revealed:true,
                    playable,
                    element:null
                });

            }

        }

    }

    function addEdge(a, b, dynamic = false){

        const edgeId = [a, b].sort().join('__');

        const existing = edges.find(edge => edge.id === edgeId);

        if(existing){
            if(dynamic) existing.dynamic = true;
            return;
        }

        edges.push({
            id:edgeId,
            a,
            b,
            dynamic
        });

    }

    function getConnectedNodeIds(id){

        return edges
            .filter(edge => edge.a === id || edge.b === id)
            .map(edge => edge.a === id ? edge.b : edge.a);

    }

    function buildEdges(){

        edges = [];

        for(let ring = 1; ring <= RING_COUNT; ring++){

            const ringNodes = nodes.filter(node => node.ring === ring);

            ringNodes.forEach((node, index) => {

                const nextNode = ringNodes[(index + 1) % ringNodes.length];

                addEdge(node.id, nextNode.id);

                if(index % 4 === 0){
                    const farNode = ringNodes[(index + 2) % ringNodes.length];
                    addEdge(node.id, farNode.id);
                }

            });

        }

        const center = getNode(makeNodeId(0, 0));
        const firstRingNodes = nodes.filter(node => node.ring === 1);

        firstRingNodes.forEach(node => {
            addEdge(center.id, node.id);
        });

        nodes.forEach(node => {

            if(node.ring <= 0 || node.ring >= RING_COUNT) return;

            const nextRingNodes = nodes.filter(otherNode => otherNode.ring === node.ring + 1);

            const nearest = nextRingNodes
                .map(otherNode => {
                    return {
                        node:otherNode,
                        distance:Math.hypot(otherNode.x - node.x, otherNode.y - node.y)
                    };
                })
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 2);

            nearest.forEach(item => {
                addEdge(node.id, item.node.id);
            });

        });

    }

    function renderLayerRings(){

        if(!layerRingsGroup) return;

        layerRingsGroup.innerHTML = '';

        for(let ring = 1; ring <= RING_COUNT; ring++){

            const radius = FIRST_RADIUS + (ring - 1) * RING_GAP;

            const ringPlayableClass = ring <= PLAYABLE_RING_LIMIT
                ? 'is-playable-ring'
                : 'is-filler-ring';

            const circle = createSvgElement('circle', {
                class:`exp-layer-ring ${getDepthClass(ring)} ${ringPlayableClass}`,
                cx:boardCenterX,
                cy:boardCenterY,
                r:radius
            });
            
            circle.style.setProperty('--wave-delay', `${ring * .09}s`);
            layerRingsGroup.appendChild(circle);

        }

    }

    function renderBaseEdges(){

        if(!baseEdgesGroup) return;

        baseEdgesGroup.innerHTML = '';

        edges.forEach(edge => {

            const a = getNode(edge.a);
            const b = getNode(edge.b);

            if(!a || !b) return;

            const edgeRing = Math.max(a.ring, b.ring);
            const depthClass = getDepthClass(edgeRing);
            const dynamicClass = edge.dynamic ? 'is-dynamic' : '';

            const edgePlayableClass = edgeRing <= PLAYABLE_RING_LIMIT
                ? 'is-playable-edge'
                : 'is-filler-edge';

            const line = createSvgElement('line', {
                class:`exp-base-edge ${depthClass} ${dynamicClass} ${edgePlayableClass}`,
                x1:a.x,
                y1:a.y,
                x2:b.x,
                y2:b.y
            });
            line.style.setProperty(
                '--wave-delay',
                `${Math.max(a.ring, b.ring) * .09}s`
            );
            line.__edgeA = edge.a;
            line.__edgeB = edge.b;
            baseEdgesGroup.appendChild(line);

        });

    }

    function renderFog(){

        if(!fogLayer) return;

        fogLayer.innerHTML = '';
        fogElements = [];

        for(let ring = 4; ring <= RING_COUNT; ring++){

            const fog = createSvgElement('circle', {
                class:`exp-fog ${getDepthClass(ring)}`,
                cx:boardCenterX,
                cy:boardCenterY,
                r:FIRST_RADIUS + (ring - 1) * RING_GAP
            });

            fogElements.push(fog);
            fogLayer.appendChild(fog);

        }

    }

    function getCellPoints(node){

        const radius = node.size / 2;
        const points = [];

        for(let i = 0; i < 8; i++){

            const angle = Math.PI / 8 + i * Math.PI / 4;

            points.push([
                node.x + Math.cos(angle) * radius,
                node.y + Math.sin(angle) * radius
            ]);

        }

        return points.map(point => point.join(',')).join(' ');

    }

    function renderCells(){

        cellsLayer.innerHTML = '';

        nodes.forEach(node => {

            const cell = createSvgElement('polygon', {
                class:`exp-cell is-visible ${getDepthClass(node.ring)} ${node.playable ? 'is-playable' : 'is-filler'}`,
                points:getCellPoints(node),
                'data-node-id':node.id,
                'data-color':node.color
            });

            cell.style.setProperty('--wave-delay', `${node.ring * .12}s`);

            if(node.playable){
                cell.addEventListener('click', () => {
                    moveToNode(node.id);
                });
            }

            node.element = cell;

            cellsLayer.appendChild(cell);

        });

    }

    function renderPlayer(){

        playerLayer.innerHTML = '';

        const startNode = getNode(startNodeId);

        if(!startNode) return;

        const player = createSvgElement('circle', {
            class:'exp-player',
            id:'expPlayer',
            cx:startNode.x,
            cy:startNode.y,
            r:22
        });

        player.style.fill = selectedPlayerColor;

        playerLayer.appendChild(player);

    }

    function updatePlayerPosition(){

        const player = document.getElementById('expPlayer');
        const node = getNode(currentNodeId);

        if(!player || !node) return;

        player.setAttribute('cx', node.x);
        player.setAttribute('cy', node.y);

    }

    function updatePlayerColor(){

        const player = document.getElementById('expPlayer');

        if(player){
            player.style.fill = selectedPlayerColor;
        }

    }

    function getAvailableNodeIds(){

        if(!currentNodeId) return [];

        return getConnectedNodeIds(currentNodeId).filter(id => {

            const node = getNode(id);

            if(!node) return false;
            if(!node.playable) return false;
            if(id === currentNodeId) return false;

            /*
                No permite volver hacia una casilla ya recorrida
                dentro de la ruta actual.
            */
            if(currentRouteNodeIds.includes(id)) return false;

            return true;

        });

    }

    function updateCells(){

        const availableIds = getAvailableNodeIds();

        nodes.forEach(node => {

            if(!node.element) return;

            node.element.classList.toggle('is-current', node.id === currentNodeId);
            node.element.classList.toggle('is-available', availableIds.includes(node.id) && !isComplete);

        });
        updateBlackholeGuides();
    }

    function clearBlackholeGuides(){

        blackholeGuideLines.forEach(line => {
            line.remove();
        });

        blackholeGuideLines = [];

    }

    function updateBlackholeGuides(){

        clearBlackholeGuides();

        if(!root.classList.contains('fx-blackhole')) return;
        if(!baseEdgesGroup || !currentNodeId) return;

        const currentNode = getNode(currentNodeId);

        if(!currentNode) return;

        const availableIds = getAvailableNodeIds();

        availableIds.forEach((id, index) => {

            const targetNode = getNode(id);

            if(!targetNode) return;

            const guide = createSvgElement('line', {
                class:'exp-blackhole-guide',
                x1:currentNode.x,
                y1:currentNode.y,
                x2:targetNode.x,
                y2:targetNode.y
            });

            guide.style.setProperty('--guide-delay', `${index * .12}s`);

            baseEdgesGroup.appendChild(guide);
            blackholeGuideLines.push(guide);

        });

    }
    
    function updateCursorReveal(event){

        if(!boardSvg || !nodes.length) return;

        const screenMatrix = boardSvg.getScreenCTM();

        if(!screenMatrix) return;

        const point = boardSvg.createSVGPoint();

        point.x = event.clientX;
        point.y = event.clientY;

        const svgPoint = point.matrixTransform(screenMatrix.inverse());

        const mouseX = svgPoint.x;
        const mouseY = svgPoint.y;

        nodes.forEach(node => {

            if(!node.element) return;

            const distance = Math.hypot(
                node.x - mouseX,
                node.y - mouseY
            );

            /*
                Area de revelado. Mayor n° variable > mayor área de revelado.
            */
            const cellRadius = node.size * .56;
            const revealMargin = node.playable ? 72 : 62;

            const nearCursor = distance < cellRadius + revealMargin;

            node.element.classList.toggle('is-near-cursor', nearCursor);

        });

    }

    function drawTrail(fromId, toId){

        const from = getNode(fromId);
        const to = getNode(toId);

        if(!from || !to || !trailLayer) return;

        const line = createSvgElement('line', {
            class:'exp-trail is-active',
            x1:from.x,
            y1:from.y,
            x2:to.x,
            y2:to.y,
            stroke:selectedTrailColor
        });

        currentRouteLines.push(line);
        trailLayer.appendChild(line);

    }

    function finishCurrentRoute(){

        currentRouteLines.forEach(line => {
            line.classList.remove('is-active');
            line.classList.add('is-past');
        });

        currentRouteLines = [];

        routeIndex++;
        selectedTrailColor = getRouteColor();

    }

    function createAtmosphereBlob(node){

        if(!atmosphereLayer) return;

        const blob = document.createElement('i');

        const color = atmosphereColors[Math.floor(Math.random() * atmosphereColors.length)];

        blob.className = 'exp-atmosphere-blob';
        blob.style.left = `${(node.x / boardWidth) * 100}%`;
        blob.style.top = `${(node.y / boardHeight) * 100}%`;
        blob.style.background = `radial-gradient(circle, ${color}, transparent 68%)`;

        atmosphereLayer.appendChild(blob);

        setTimeout(() => {
            blob.remove();
        }, 5600);

    }

    function weaveNewPaths(node){

        const connected = getConnectedNodeIds(node.id);

        const candidates = nodes
            .filter(candidate => {
                if(candidate.id === node.id) return false;
                if(candidate.ring === 0) return false;
                if(!candidate.playable) return false;
                if(connected.includes(candidate.id)) return false;

                return Math.abs(candidate.ring - node.ring) <= 2;
            })
            .map(candidate => {
                return {
                    node:candidate,
                    distance:Math.hypot(candidate.x - node.x, candidate.y - node.y)
                };
            })
            .sort((a, b) => a.distance - b.distance)
            .slice(1, 5);

        candidates.forEach(item => {
            addEdge(node.id, item.node.id, true);
        });

        renderBaseEdges();
        updateCells();

    }

    function distortSpace(){

        if(!boardWrap) return;

        const tiltX = `${Math.random() * 12 - 6}deg`;
        const tiltY = `${Math.random() * 14 - 7}deg`;

        boardWrap.style.setProperty('--exp-tilt-x', tiltX);
        boardWrap.style.setProperty('--exp-tilt-y', tiltY);

        boardWrap.classList.add('is-spatial');

        setTimeout(() => {
            boardWrap.classList.remove('is-spatial');
        }, 1500);

    }

    function registerTransformation(color){

        const key = colorKeys[color];

        if(!key || isComplete) return;

        transformSequence.push(key);

        if(transformSequence.length > 5){
            transformSequence.shift();
        }

        updateSequencePanel();

        const sequenceKey = transformSequence.join('');

        if(transformSequence.length === 5 && transformFinals[sequenceKey]){
            triggerInterference(sequenceKey);
        }

    }

    function updateSequencePanel(){

        const sequenceKey = transformSequence.join('');

        comboRows.forEach(row => {

            const combo = row.getAttribute('data-exp-combo');

            row.classList.toggle(
                'is-current',
                sequenceKey.length > 0 && combo.startsWith(sequenceKey)
            );

            row.classList.toggle(
                'is-complete',
                sequenceKey.length === 5 && combo === sequenceKey
            );

            row.classList.toggle(
                'is-discovered',
                discoveredSequences.has(combo)
            );

        });

        if(progressFill){
            progressFill.style.width = `${(transformSequence.length / 5) * 100}%`;
        }

        if(progressLabel){

            if(transformSequence.length === 0){
                progressLabel.textContent = 'Encadena 5 transformaciones';
            }else{
                progressLabel.textContent = `Serie: ${transformSequence.join(' + ').toUpperCase()}`;
            }

        }

    }

    function stopWaveEffect(){
        /*
            No se limpian estilos por frame porque el wave
            ya no modifica elementos directamente con JS.
        */
    }

    function startWaveEffect(){
        /*
            El efecto wave ahora se ejecuta por CSS,
            no por requestAnimationFrame.
        */
    }

    function returnCharacterToCenter(){

        finishCurrentRoute();

        currentNodeId = checkpointNodeId;
        currentRouteNodeIds = [checkpointNodeId];

        updatePlayerPosition();
        updatePlayerColor();
        updateCells();

    }

    function triggerInterference(sequenceKey){

        const finalData = transformFinals[sequenceKey];

        if(!finalData) return;

        discoveredSequences.add(sequenceKey);
        updateSequencePanel();

        clearTimeout(interferenceTimer);
        clearTimeout(interferenceLoadingTimer);

        if(finalOverlay){
            finalOverlay.setAttribute('aria-hidden', 'false');
            finalOverlay.setAttribute('data-state', 'loading');
        }

        if(finalLabel){
            finalLabel.textContent = `Cargando ${finalData.label}...`;
        }

        root.classList.remove(...INTERFERENCE_CLASSES);
        root.classList.add('is-interference-loading');

        interferenceLoadingTimer = setTimeout(() => {

            root.classList.remove('is-interference-loading');
            root.classList.add(finalData.className);
            root.classList.add('is-final');

            if(finalOverlay){
                finalOverlay.setAttribute('data-state', 'active');
            }

            if(finalLabel){
                finalLabel.textContent = finalData.label;
            }

            if(trailLayer){
                trailLayer.querySelectorAll('.exp-trail').forEach(line => {
                    line.classList.add('is-final');
                });
            }

            returnCharacterToCenter();

            interferenceTimer = setTimeout(() => {

                transformSequence = [];
                updateSequencePanel();

                if(finalOverlay){
                    finalOverlay.setAttribute('aria-hidden', 'true');
                    finalOverlay.removeAttribute('data-state');
                }

                root.classList.remove('is-final');

            }, 950);

        }, 320);
    }

    function scatterCells(){

        nodes.forEach(node => {

            if(!node.element || node.ring === 0) return;

            const angle = Math.atan2(
                node.y - boardCenterY,
                node.x - boardCenterX
            );

            const force = 34 + node.ring * 12;
            const rotate = Math.random() * 80 - 40;

            node.element.classList.add('is-scattered');

            node.element.style.transform = `
                translate(${Math.cos(angle) * force}px, ${Math.sin(angle) * force}px)
                rotate(${rotate}deg)
            `;

        });

        setTimeout(() => {

            nodes.forEach(node => {

                if(!node.element) return;

                node.element.style.transform = '';
                node.element.classList.remove('is-scattered');

            });

        }, 1600);

    }

    function applyColorEvent(node){

        if(!node || node.color === 'yellow') return;

        registerTransformation(node.color);

        if(node.color === 'green'){
            createAtmosphereBlob(node);
        }

        if(node.color === 'blue'){
            weaveNewPaths(node);
        }

        if(node.color === 'red'){
            distortSpace();
        }

    }

    function moveToNode(nodeId){

        if(!selectedCharacter) return;

        const availableIds = getAvailableNodeIds();

        if(!availableIds.includes(nodeId)) return;

        const previousNodeId = currentNodeId;

        currentNodeId = nodeId;

        drawTrail(previousNodeId, currentNodeId);

        if(!currentRouteNodeIds.includes(previousNodeId)){
            currentRouteNodeIds.push(previousNodeId);
        }

        if(!currentRouteNodeIds.includes(currentNodeId)){
            currentRouteNodeIds.push(currentNodeId);
        }

        const currentNode = getNode(currentNodeId);

        applyColorEvent(currentNode);

        updatePlayerPosition();
        updatePlayerColor();
        updateCells();

        const hasOptions = getAvailableNodeIds().length > 0;

        if(!hasOptions){
            setTimeout(() => {
                returnCharacterToCenter();
            }, 450);
        }

    }

    function selectCharacter(character){

        if(!characterColors[character]) return;

        selectedCharacter = character;
        selectedPlayerColor = characterColors[character];

        routeIndex = 0;
        selectedTrailColor = getRouteColor();

        root.style.setProperty('--exp-player-color', selectedPlayerColor);

        characterButtons.forEach(button => {
            button.classList.toggle(
                'is-selected',
                button.getAttribute('data-exp-character') === character
            );
        });

        if(enterButton){
            enterButton.disabled = false;
        }

        renderPlayer();
        updateCells();

    }

    function startBoard(){

        if(!selectedCharacter) return;

        root.classList.add('is-board-active');

        currentNodeId = checkpointNodeId;
        currentRouteNodeIds = [checkpointNodeId];

        updatePlayerPosition();
        updateCells();

    }

    function goBackToEntry(){

        root.classList.remove('is-board-active');

    }

    function resetExperiment(){

        root.classList.remove(
            'is-final',
            ...INTERFERENCE_CLASSES
        );

        clearBlackholeGuides();
        
        discoveredSequences.clear();
        stopWaveEffect();
        activeInterference = null;

        if(finalOverlay){
            finalOverlay.setAttribute('aria-hidden', 'true');
        }

        if(boardWrap){
            boardWrap.classList.remove('is-spatial');
        }

        if(trailLayer){
            trailLayer.innerHTML = '';
        }

        if(atmosphereLayer){
            atmosphereLayer.innerHTML = '';
        }

        transformSequence = [];
        isComplete = false;

        routeIndex = 0;
        selectedTrailColor = getRouteColor();
        currentRouteLines = [];

        currentNodeId = checkpointNodeId;
        currentRouteNodeIds = [checkpointNodeId];

        viewScale = INITIAL_VIEW_SCALE;
        viewOffsetX = 0;
        viewOffsetY = 0;
        updateSvgViewBox();

        updatePlayerPosition();
        updatePlayerColor();
        updateSequencePanel();
        updateCells();

    }

    function initBoard(){

        buildNodes();
        buildEdges();

        startNodeId = makeNodeId(0, 0);
        checkpointNodeId = startNodeId;
        currentNodeId = startNodeId;
        currentRouteNodeIds = [checkpointNodeId];

        renderLayerRings();
        renderBaseEdges();
        renderFog();
        renderCells();
        renderPlayer();

        transformSequence = [];
        isComplete = false;

        updateSequencePanel();
        updateCells();

    }

    characterButtons.forEach(button => {

        button.addEventListener('click', () => {

            const character = button.getAttribute('data-exp-character');

            selectCharacter(character);

        });

    });

    if(enterButton){
        enterButton.addEventListener('click', startBoard);
    }

    if(backEntryButton){
        backEntryButton.addEventListener('click', goBackToEntry);
    }

    if(resetButton){
        resetButton.addEventListener('click', resetExperiment);
    }

    if(boardWrap){

        boardWrap.addEventListener('wheel', event => {

            boardWrap.addEventListener('mousemove', updateCursorReveal);

            boardWrap.addEventListener('mouseleave', () => {

                nodes.forEach(node => {

                    if(node.element){
                        node.element.classList.remove('is-near-cursor');
                    }

                });

            });

            event.preventDefault();

            const direction = event.deltaY > 0 ? 1 : -1;

            viewScale = clamp(
                viewScale + direction * .08,
                MIN_VIEW_SCALE,
                MAX_VIEW_SCALE
            );

            updateSvgViewBox();

        }, { passive:false });

        boardWrap.addEventListener('pointerdown', event => {

            if(!isHoldingH) return;

            isPanning = true;

            panStart = {
                x:event.clientX,
                y:event.clientY,
                offsetX:viewOffsetX,
                offsetY:viewOffsetY
            };

            boardWrap.setPointerCapture(event.pointerId);

        });

        boardWrap.addEventListener('pointermove', event => {

            if(!isPanning) return;

            const visibleWidth = boardWidth * viewScale;
            const visibleHeight = boardHeight * viewScale;

            const ratioX = visibleWidth / window.innerWidth;
            const ratioY = visibleHeight / window.innerHeight;

            const dx = event.clientX - panStart.x;
            const dy = event.clientY - panStart.y;

            viewOffsetX = panStart.offsetX - dx * ratioX;
            viewOffsetY = panStart.offsetY - dy * ratioY;

            updateSvgViewBox();

        });

        boardWrap.addEventListener('pointerup', event => {

            isPanning = false;

            if(boardWrap.hasPointerCapture(event.pointerId)){
                boardWrap.releasePointerCapture(event.pointerId);
            }

        });

        boardWrap.addEventListener('mousemove', updateCursorReveal);

        boardWrap.addEventListener('mouseleave', () => {

            nodes.forEach(node => {

                if(node.element){
                    node.element.classList.remove('is-near-cursor');
                }

            });

        });

    }

    window.addEventListener('keydown', event => {

        if(event.key.toLowerCase() !== 'h') return;

        isHoldingH = true;
        root.classList.add('is-pan-mode');

    });

    window.addEventListener('keyup', event => {

        if(event.key.toLowerCase() !== 'h') return;

        isHoldingH = false;
        isPanning = false;
        root.classList.remove('is-pan-mode');

    });

    window.addEventListener('resize', () => {
        initBoard();
    });

    initBoard();

})();
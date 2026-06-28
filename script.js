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
    const comboPanel = document.querySelector('.exp-combo-panel');

    const endingEl = document.getElementById('expEnding');
    const endingRoutesLayer = document.getElementById('expEndingRoutes');
    const endingNodesLayer = document.getElementById('expEndingNodes');
    const endingResetButton = document.querySelector('[data-exp-ending-reset]');

    const endingCard = document.querySelector('.exp-ending-card');
    const endingActions = document.querySelector('.exp-ending-actions');
    const endingQrBox = document.getElementById('expEndingQrBox');

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
            className:'fx-transport',
            label:'Traslado'
        },
        rrrbg:{
            className:'fx-impact',
            label:'Dispersión por impacto'
        },
        grbgb:{
            className:'fx-matrix',
            label:'Escaneo'
        },
        bgrbr:{
            className:'fx-glitch',
            label:'Glitch'
        }
    };

    const INTERFERENCE_CLASSES = [
        'fx-ghost',
        'fx-blackhole',
        'fx-transport',
        'fx-impact',
        'fx-matrix',
        'fx-glitch'
    ];

    const colorKeys = {
        red:'r',
        green:'g',
        blue:'b'
    };

    const progressColorNames = {
        r:'red',
        g:'green',
        b:'blue'
    };

    const progressColorLabels = {
        r:'roja',
        g:'verde',
        b:'azul'
    };

    function getProgressCellMarkup(key){

        const colorName = progressColorNames[key];

        if(!colorName) return '';

        return `
            <i 
                class="exp-progress-cell exp-progress-cell--${colorName}" 
                aria-label="Casilla ${progressColorLabels[key]}"
            ></i>
        `;

    }

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

    const INITIAL_VIEW_SCALE = 0.35;

    const MIN_VIEW_SCALE = 0.28;
    const MAX_VIEW_SCALE = 0.50;

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
    let blackholeGuideSourceId = null;
    let blackholeGuidesVisible = false;

    let cursorRevealFrame = null;
    let latestCursorEvent = null;

    let transformSequence = [];

    const BLACKHOLE_ACTIVE_RINGS = [1, 2, 3];

    const BLACKHOLE_RING_SPEED = {
        1: 0.000138,
        2: -0.000118,
        3: 0.000096
    };

    const BLACKHOLE_FILLER_SPEED = 0.000060;

    let blackholeFrame = null;
    let blackholeLastTime = null;

    let transportTimer = null;
    let transportPrepareTimer = null;
    let transportLandingTimer = null;
    let transportResetTimer = null;
    let transportFrame = null;
    let transportLastTime = null;
    let transportCandidateIds = [];

    let impactFrame = null;
    let impactEntryFrame = null;
    let impactLastTime = null;
    let impactOriginalViewBox = null;
    let impactNodeIds = [];

    let glitchTimer = null;
    let glitchShakeTimer = null;
    let glitchAngle = 0;

    let matrixTimer = null;
    let matrixActiveColor = null;
    let matrixColorIndex = 0;

    const MATRIX_COLORS = ['green', 'red', 'blue'];
    const TRANSPORT_COLORS = ['blue', 'green', 'red'];

    const TRANSPORT_ACTIVE_COUNT = 24;
    const TRANSPORT_CELL_SIZE = 66;
    const TRANSPORT_EXPANDED_SIZE = 96;

    const TRANSPORT_SPEED_MIN = .08;
    const TRANSPORT_SPEED_MAX = .20;
    const TRANSPORT_MAX_DELTA = 28;

    const TRANSPORT_WARNING_DURATION = 1150;
    const TRANSPORT_SHRINK_DURATION = 920;
    const TRANSPORT_RESET_WAVE_DURATION = 820;

    const TRANSPORT_CYCLE_MIN = 1000;
    const TRANSPORT_CYCLE_MAX = 3000;

    const TRANSPORT_INITIAL_STAGGER_MAX = 2400;


    const IMPACT_VISIBLE_COUNT = 36;

    const IMPACT_WALL_BOUNCE = 1.08;
    const IMPACT_COLLISION_BOUNCE = 1.05;
    const IMPACT_COLLISION_PUSH = 0.56;
    const IMPACT_COLLISION_RADIUS_SCALE = .82;
    const IMPACT_MAX_DELTA = 28;
    const IMPACT_CELL_SIZE = 66;

    const ENDING_TOTAL_SERIES = Object.keys(transformFinals).length;
    const ENDING_WAVE_DURATION = 1850;
    const ENDING_QUIET_DELAY = 520;

    let endingStarted = false;
    let endingStartTimer = null;
    let endingRevealTimer = null;
    let endingQuietTimer = null;

    let routeHistory = [];
    let routeStepCounter = 0;

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

        const screenRatio = boardSvg.clientWidth && boardSvg.clientHeight
            ? boardSvg.clientWidth / boardSvg.clientHeight
            : window.innerWidth / window.innerHeight;

        const height = boardHeight * viewScale;
        const width = height * screenRatio;

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

        const baseSize = Math.max(
            window.innerWidth * 1.35,
            window.innerHeight * 1.35,
            maxRadius * 2 + 360
        );

        boardWidth = baseSize;
        boardHeight = baseSize;

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

                let color = colorPattern[(i + ring) % colorPattern.length];

                if(ring === 2 && i >= 3 && i <= 4){
                    color = 'green';
                }

                nodes.push({
                    id:makeNodeId(ring, i),
                    ring,
                    index:i,
                    count,
                    radius,
                    angle,
                    renderAngle:angle,
                    x:boardCenterX + Math.cos(angle) * radius,
                    y:boardCenterY + Math.sin(angle) * radius,
                    renderX:boardCenterX + Math.cos(angle) * radius,
                    renderY:boardCenterY + Math.sin(angle) * radius,
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

        const centerX = node.renderX ?? node.x;
        const centerY = node.renderY ?? node.y;

        const visualSize = node.renderSize ?? node.size;
        const radius = visualSize / 2;

        const points = [];

        for(let i = 0; i < 8; i++){

            const angle = Math.PI / 8 + i * Math.PI / 4;

            points.push([
                centerX + Math.cos(angle) * radius,
                centerY + Math.sin(angle) * radius
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

            const direction = node.index % 2 === 0 ? 1 : -1;
            const intensity = node.playable ? 18 : 8;
            const blackholeX = direction * node.ring * intensity;

            cell.style.setProperty('--blackhole-x', `${blackholeX}px`);
            
            const ringDepthDelay = node.playable
                ? (node.ring - 1) * .72
                : node.ring * .10;

            const zNearScale = node.ring === 1
                ? 1.26
                : node.ring === 2
                    ? 1.20
                    : node.ring === 3
                        ? 1.14
                        : 1.04;

            const zFarScale = node.ring === 1
                ? .78
                : node.ring === 2
                    ? .84
                    : node.ring === 3
                        ? .90
                        : .96;

            cell.style.setProperty('--blackhole-delay', `${ringDepthDelay}s`);
            cell.style.setProperty('--z-near-scale', zNearScale);
            cell.style.setProperty('--z-far-scale', zFarScale);

            cell.style.setProperty('--wave-delay', `${node.ring * .12}s`);

            cell.addEventListener('click', () => {
                moveToNode(node.id);
            });

            const core = createSvgElement('circle', {
                class:`exp-cell-core ${node.playable ? 'is-playable-core' : 'is-filler-core'}`,
                cx:node.renderX ?? node.x,
                cy:node.renderY ?? node.y,
                r:Math.max(5, node.size * .18),
                'data-node-id':node.id,
                'data-color':node.color
            });

            node.element = cell;
            node.coreElement = core;

            cellsLayer.appendChild(cell);
            cellsLayer.appendChild(core);

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

        const x = node.renderX ?? node.x;
        const y = node.renderY ?? node.y;

        player.setAttribute('cx', x);
        player.setAttribute('cy', y);

    }

    function updatePlayerColor(){

        const player = document.getElementById('expPlayer');

        if(player){
            player.style.fill = selectedPlayerColor;
        }

    }

    function getAvailableNodeIds(){

        if(!currentNodeId) return [];

        if(root.classList.contains('fx-matrix') && matrixActiveColor){
            return getMatrixColorOptions(matrixActiveColor);
        }

        if(root.classList.contains('fx-impact') && impactNodeIds.length){
            return impactNodeIds.filter(id => id !== currentNodeId);
        }

        if(root.classList.contains('fx-transport')){
            return transportCandidateIds.filter(id => id !== currentNodeId);
        }

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

            const isCurrent = node.id === currentNodeId;
            const isAvailable = availableIds.includes(node.id);

            const targets = [
                node.element,
                node.coreElement
            ].filter(Boolean);

            targets.forEach(element => {

                element.classList.toggle('is-current', isCurrent);
                element.classList.toggle('is-available', isAvailable);

                element.classList.toggle(
                    'is-transport-current',
                    root.classList.contains('fx-transport') && isCurrent
                );

                element.classList.toggle(
                    'is-transport-option',
                    root.classList.contains('fx-transport') && isAvailable
                );

                const isMatrix = root.classList.contains('fx-matrix');
                const isMatrixNode = isMatrix && node.ring > 0;
                const isMatrixActive = isMatrixNode && node.color === matrixActiveColor;
                const isMatrixLocked = isMatrixNode && node.color !== matrixActiveColor && !isCurrent;

                element.classList.toggle('is-matrix-active', isMatrixActive);
                element.classList.toggle('is-matrix-locked', isMatrixLocked);

            });

        });

    }

    function clearBlackholeGuides(){

        blackholeGuideLines.forEach(line => {
            line.remove();
        });

        blackholeGuideLines = [];
        blackholeGuideSourceId = null;
        blackholeGuidesVisible = false;

    }

    function setBlackholeGuidesVisible(isVisible){

        if(blackholeGuidesVisible === isVisible) return;

        blackholeGuidesVisible = isVisible;

        blackholeGuideLines.forEach(line => {
            line.classList.toggle('is-visible', isVisible);
        });

    }

    function buildBlackholeGuides(){

        clearBlackholeGuides();

        if(!root.classList.contains('fx-blackhole')) return;
        if(!baseEdgesGroup || !currentNodeId) return;

        const currentNode = getNode(currentNodeId);

        if(!currentNode) return;

        const currentX = currentNode.renderX ?? currentNode.x;
        const currentY = currentNode.renderY ?? currentNode.y;

        const availableIds = getAvailableNodeIds();

        availableIds.forEach((id, index) => {

            const targetNode = getNode(id);

            if(!targetNode) return;

            const targetX = targetNode.renderX ?? targetNode.x;
            const targetY = targetNode.renderY ?? targetNode.y;

            const guide = createSvgElement('line', {
                class:'exp-blackhole-guide',
                x1:currentX,
                y1:currentY,
                x2:targetX,
                y2:targetY
            });

            guide.__fromId = currentNodeId;
            guide.__toId = id;

            guide.style.setProperty('--guide-delay', `${index * .06}s`);

            baseEdgesGroup.appendChild(guide);
            blackholeGuideLines.push(guide);

        });

        blackholeGuideSourceId = currentNodeId;
        setBlackholeGuidesVisible(false);

    }

    function updateBlackholeGuides(mouseX = null, mouseY = null){

        if(!root.classList.contains('fx-blackhole')){
            clearBlackholeGuides();
            return;
        }

        if(!currentNodeId) return;

        const currentNode = getNode(currentNodeId);

        if(!currentNode) return;

        if(blackholeGuideSourceId !== currentNodeId || !blackholeGuideLines.length){
            buildBlackholeGuides();
        }

        const currentX = currentNode.renderX ?? currentNode.x;
        const currentY = currentNode.renderY ?? currentNode.y;

        if(mouseX === null || mouseY === null){
            setBlackholeGuidesVisible(false);
            return;
        }

        const distanceToCurrent = Math.hypot(
            currentX - mouseX,
            currentY - mouseY
        );

        const activationRadius = currentNode.size * 1.65;

        setBlackholeGuidesVisible(distanceToCurrent <= activationRadius);

    }

    function randomizeBlackholeZDepth(){

        nodes.forEach(node => {

            if(!node.element) return;

            const ringBaseDelay = node.playable
                ? node.ring * .14
                : node.ring * .055;

            const randomDelay = Math.random() * .85;
            const randomDuration = 2.45 + Math.random() * 1.25;

            const nearBase = node.ring === 1
                ? 1.30
                : node.ring === 2
                    ? 1.22
                    : node.ring === 3
                        ? 1.16
                        : 1.06;

            const farBase = node.ring === 1
                ? .76
                : node.ring === 2
                    ? .84
                    : node.ring === 3
                        ? .90
                        : .96;

            const randomNear = nearBase + Math.random() * .10;
            const randomFar = farBase - Math.random() * .06;

            node.element.style.setProperty('--blackhole-delay', `${ringBaseDelay + randomDelay}s`);
            node.element.style.setProperty('--blackhole-duration', `${randomDuration}s`);
            node.element.style.setProperty('--z-near-scale', randomNear);
            node.element.style.setProperty('--z-far-scale', randomFar);

        });

    }

    function startBlackholeMotion(){

        stopBlackholeMotion();

        prepareBlackholeNodes();
        randomizeBlackholeZDepth();

        blackholeLastTime = performance.now();

        function animateBlackhole(now){

            const delta = now - blackholeLastTime;
            blackholeLastTime = now;

            updateBlackholeNodePositions(delta);
            updateRenderedNodePositions();
            updateBlackholeGuidePositions();

            blackholeFrame = requestAnimationFrame(animateBlackhole);

        }

        blackholeFrame = requestAnimationFrame(animateBlackhole);

    }

    function stopBlackholeMotion(){

        if(blackholeFrame){
            cancelAnimationFrame(blackholeFrame);
            blackholeFrame = null;
        }

        blackholeLastTime = null;

        restoreBlackholeNodes();
        updateRenderedNodePositions();
        clearBlackholeGuides();

    }

    function clearTransportCandidates(){

        transportCandidateIds = [];

        nodes.forEach(node => {

            clearTransportStateClasses(node);

            node.transportState = null;
            node.transportVX = 0;
            node.transportVY = 0;
            node.transportNextShiftAt = null;
            node.transportWarningStart = null;
            node.transportShrinkStart = null;

            if(!node.element) return;

            node.element.classList.remove(
                'is-transport-option',
                'is-transport-current'
            );

            if(node.coreElement){
                node.coreElement.classList.remove(
                    'is-transport-option',
                    'is-transport-current'
                );
            }

        });

    }

    function flashTransportLanding(node){

        if(!root.classList.contains('fx-transport') || !node) return;

        const viewBox = boardSvg
            .getAttribute('viewBox')
            .split(' ')
            .map(Number);

        const [x, y, width, height] = viewBox;

        const nodeX = node.renderX ?? node.x;
        const nodeY = node.renderY ?? node.y;

        const landX = ((nodeX - x) / width) * 100;
        const landY = ((nodeY - y) / height) * 100;

        root.style.setProperty('--transport-land-x', `${clamp(landX, 0, 100)}%`);
        root.style.setProperty('--transport-land-y', `${clamp(landY, 0, 100)}%`);

        root.classList.remove('is-transport-landing');

        if(boardWrap){
            void boardWrap.offsetWidth;
        }

        root.classList.add('is-transport-landing');

        if(transportLandingTimer){
            clearTimeout(transportLandingTimer);
        }

        transportLandingTimer = setTimeout(() => {
            root.classList.remove('is-transport-landing');
        }, 760);

    }

    function getTransportBounds(){

        const viewBox = boardSvg
            .getAttribute('viewBox')
            .split(' ')
            .map(Number);

        const [x, y, width, height] = viewBox;

        const margin = 92;

        return {
            minX:x + margin,
            maxX:x + width - margin,
            minY:y + margin,
            maxY:y + height - margin
        };

    }

    function getRandomTransportPosition(node, bounds){

        const radius = (node.renderSize ?? TRANSPORT_CELL_SIZE) / 2;

        return {
            x:rand(bounds.minX + radius, bounds.maxX - radius),
            y:rand(bounds.minY + radius, bounds.maxY - radius)
        };

    }

    function getRandomTransportVelocity(){

        const angle = rand(0, Math.PI * 2);
        const speed = rand(TRANSPORT_SPEED_MIN, TRANSPORT_SPEED_MAX);

        return {
            vx:Math.cos(angle) * speed,
            vy:Math.sin(angle) * speed
        };

    }

    function getDifferentTransportColor(currentColor){

        const options = TRANSPORT_COLORS.filter(color => color !== currentColor);

        return options[Math.floor(rand(0, options.length))] || currentColor;

    }

    function setTransportNodeColor(node, color){

        node.color = color;

        if(node.element){
            node.element.setAttribute('data-color', color);
        }

        if(node.coreElement){
            node.coreElement.setAttribute('data-color', color);
        }

    }

    function clearTransportStateClasses(node){

        const targets = [
            node.element,
            node.coreElement
        ].filter(Boolean);

        targets.forEach(element => {
            element.classList.remove(
                'is-transport-warning',
                'is-transport-expanded',
                'is-transport-shrinking',
                'is-transport-resetting'
            );
        });

    }

    function setTransportStateClass(node, state){

        clearTransportStateClasses(node);

        const targets = [
            node.element,
            node.coreElement
        ].filter(Boolean);

        targets.forEach(element => {

            if(state === 'warning'){
                element.classList.add('is-transport-warning');
            }

            if(state === 'expanded'){
                element.classList.add('is-transport-expanded');
            }

            if(state === 'shrinking'){
                element.classList.add('is-transport-shrinking');
            }

            if(state === 'resetting'){
                element.classList.add('is-transport-resetting');
            }

        });

    }

    function prepareTransportNode(node, bounds){

        if(!node || node.ring === 0) return;

        const position = getRandomTransportPosition(node, bounds);
        const velocity = getRandomTransportVelocity();

        node.renderX = position.x;
        node.renderY = position.y;
        node.renderSize = TRANSPORT_CELL_SIZE;

        node.transportVX = velocity.vx;
        node.transportVY = velocity.vy;

        node.transportState = 'moving';
        const now = performance.now();

        node.transportNextShiftAt = now +
            rand(TRANSPORT_CYCLE_MIN, TRANSPORT_CYCLE_MAX) +
            rand(0, TRANSPORT_INITIAL_STAGGER_MAX);

        node.transportWarningStart = null;
        node.transportShrinkStart = null;

        clearTransportStateClasses(node);

    }

    function moveTransportNode(node, delta, bounds){

        let x = node.renderX ?? node.x;
        let y = node.renderY ?? node.y;

        let vx = node.transportVX ?? 0;
        let vy = node.transportVY ?? 0;

        x += vx * delta;
        y += vy * delta;

        const radius = (node.renderSize ?? TRANSPORT_CELL_SIZE) / 2;

        if(x - radius < bounds.minX){
            x = bounds.minX + radius;
            vx = Math.abs(vx);
        }

        if(x + radius > bounds.maxX){
            x = bounds.maxX - radius;
            vx = -Math.abs(vx);
        }

        if(y - radius < bounds.minY){
            y = bounds.minY + radius;
            vy = Math.abs(vy);
        }

        if(y + radius > bounds.maxY){
            y = bounds.maxY - radius;
            vy = -Math.abs(vy);
        }

        node.renderX = x;
        node.renderY = y;

        node.transportVX = vx;
        node.transportVY = vy;

    }

    function teleportTransportNode(node, bounds){

        const position = getRandomTransportPosition(node, bounds);
        const velocity = getRandomTransportVelocity();

        node.renderX = position.x;
        node.renderY = position.y;
        node.renderSize = TRANSPORT_EXPANDED_SIZE;

        node.transportVX = velocity.vx;
        node.transportVY = velocity.vy;

        node.transportState = 'shrinking';
        node.transportShrinkStart = performance.now();

        setTransportStateClass(node, 'expanded');

    }

    function updateTransportMotion(delta){

        if(!root.classList.contains('fx-transport')) return;
        if(!transportCandidateIds.length) return;

        const now = performance.now();
        const bounds = getTransportBounds();
        const safeDelta = Math.min(delta, TRANSPORT_MAX_DELTA);

        transportCandidateIds.forEach(id => {

            const node = getNode(id);

            if(!node || node.ring === 0) return;

            if(node.id === currentNodeId){

                node.renderSize = TRANSPORT_CELL_SIZE;

                setTransportStateClass(node, null);

                return;

            }

            if(!node.transportState){
                prepareTransportNode(node, bounds);
            }

            if(node.transportState === 'moving'){

                moveTransportNode(node, safeDelta, bounds);

                if(now >= node.transportNextShiftAt){

                    node.transportState = 'warning';
                    node.transportWarningStart = now;

                    node.transportPauseVX = node.transportVX;
                    node.transportPauseVY = node.transportVY;

                    node.transportVX = 0;
                    node.transportVY = 0;

                    setTransportStateClass(node, 'warning');

                }

                return;

            }

            if(node.transportState === 'warning'){

                if(now - node.transportWarningStart >= TRANSPORT_WARNING_DURATION){
                    teleportTransportNode(node, bounds);
                }

                return;

            }

            if(node.transportState === 'shrinking'){

                moveTransportNode(node, safeDelta, bounds);

                const progress = Math.min(
                    (now - node.transportShrinkStart) / TRANSPORT_SHRINK_DURATION,
                    1
                );

                const eased = 1 - Math.pow(1 - progress, 3);

                node.renderSize = TRANSPORT_EXPANDED_SIZE +
                    (TRANSPORT_CELL_SIZE - TRANSPORT_EXPANDED_SIZE) * eased;

                if(progress >= 1){

                    node.renderSize = TRANSPORT_CELL_SIZE;
                    node.transportState = 'moving';

                    node.transportNextShiftAt = now + rand(
                        TRANSPORT_CYCLE_MIN,
                        TRANSPORT_CYCLE_MAX
                    );

                    setTransportStateClass(node, null);

                }else{
                    setTransportStateClass(node, 'shrinking');
                }

            }

        });

        updateRenderedNodePositions();

    }

    function triggerTransportResetWave(){

        if(!root.classList.contains('fx-transport')) return;

        if(transportResetTimer){
            clearTimeout(transportResetTimer);
            transportResetTimer = null;
        }

        const now = performance.now();

        transportCandidateIds.forEach(id => {

            const node = getNode(id);

            if(!node || node.ring === 0) return;

            /*
                La casilla donde está el personaje no participa
                del reinicio grupal.
            */
            if(node.id === currentNodeId){

                node.renderSize = TRANSPORT_CELL_SIZE;

                setTransportStateClass(node, null);

                return;

            }

            /*
                Usamos el mismo estado del teletransporte individual.
                No agrandamos aquí.
                Solo avisamos.
            */
            node.transportState = 'warning';
            node.transportWarningStart = now;

            node.transportVX = 0;
            node.transportVY = 0;

            node.renderSize = TRANSPORT_CELL_SIZE;

            setTransportStateClass(node, 'warning');

        });

        updateRenderedNodePositions();
        updateCells();

    }

    function pickTransportCandidates(){

        if(!root.classList.contains('fx-transport')) return;

        clearTransportCandidates();

        const bounds = getTransportBounds();

        const candidatePool = nodes.filter(node => {
            if(node.ring === 0) return false;
            if(node.id === currentNodeId) return false;

            return true;
        });

        const shuffled = candidatePool
            .map(node => ({
                node,
                value:Math.random()
            }))
            .sort((a, b) => a.value - b.value)
            .map(item => item.node);

        transportCandidateIds = shuffled
            .slice(0, TRANSPORT_ACTIVE_COUNT)
            .map(node => node.id);

        transportCandidateIds.forEach(id => {

            const node = getNode(id);

            if(!node) return;

            prepareTransportNode(node, bounds);

        });

        updateRenderedNodePositions();
        updateCells();

    }

    function startTransportMotion(){

        stopTransportMotion();

        transportLastTime = performance.now();

        function animateTransport(now){

            const delta = now - transportLastTime;

            transportLastTime = now;

            updateTransportMotion(delta);

            transportFrame = requestAnimationFrame(animateTransport);

        }

        transportFrame = requestAnimationFrame(animateTransport);

    }

    function stopTransportMotion(){

        if(transportFrame){
            cancelAnimationFrame(transportFrame);
            transportFrame = null;
        }

        transportLastTime = null;

    }

    function startTransportEffect(){

        stopTransportEffect();

        clearBlackholeGuides();

        root.classList.add('is-transport-preparing');

        /*
            Primero: las casillas no jugables crecen hasta un tamaño
            similar al de las casillas jugables.
        */
        nodes.forEach(node => {

            if(!node.playable && node.ring > 0){
                node.renderSize = TRANSPORT_CELL_SIZE;
            }else{
                node.renderSize = node.size;
            }

        });

        updateRenderedNodePositions();

        /*
            Luego de una pausa breve, desaparece la estructura
            y comienza el sistema de traslado.
        */
        transportPrepareTimer = setTimeout(() => {

            root.classList.remove('is-transport-preparing');
            root.classList.add('is-transport-ready');

            pickTransportCandidates();
            startTransportMotion();

        }, 850);

    }

    function stopTransportEffect(){

        stopTransportMotion();

        if(transportTimer){
            clearInterval(transportTimer);
            transportTimer = null;
        }

        if(transportPrepareTimer){
            clearTimeout(transportPrepareTimer);
            transportPrepareTimer = null;
        }

        if(transportLandingTimer){
            clearTimeout(transportLandingTimer);
            transportLandingTimer = null;
        }

        if(transportResetTimer){
            clearTimeout(transportResetTimer);
            transportResetTimer = null;
        }

        root.classList.remove(
            'is-transport-warning',
            'is-transport-expanded',
            'is-transport-shrinking',
            'is-transport-resetting'
        );

        transportCandidateIds = [];

        nodes.forEach(node => {

            node.renderX = node.baseX ?? node.x;
            node.renderY = node.baseY ?? node.y;
            node.renderSize = node.size;

            node.transportState = null;
            node.transportVX = 0;
            node.transportVY = 0;
            node.transportNextShiftAt = null;
            node.transportWarningStart = null;
            node.transportShrinkStart = null;

            clearTransportStateClasses(node);

            const targets = [
                node.element,
                node.coreElement
            ].filter(Boolean);

            targets.forEach(element => {
                element.classList.remove(
                    'is-transport-option',
                    'is-transport-current',
                    'is-transport-warning',
                    'is-transport-expanded',
                    'is-transport-shrinking'
                );
            });

        });

        updateRenderedNodePositions();

    }
    
    function prepareBlackholeNodes(){
        nodes.forEach(node => {
            if(node.baseAngle == null){
                node.baseAngle = node.angle;
            }

            if(node.baseX == null){
                node.baseX = node.x;
            }

            if(node.baseY == null){
                node.baseY = node.y;
            }

            if(node.renderAngle == null){
                node.renderAngle = node.baseAngle;
            }

            if(node.renderX == null){
                node.renderX = node.x;
            }

            if(node.renderY == null){
                node.renderY = node.y;
            }
        });
    }

    function restoreBlackholeNodes(){
        nodes.forEach(node => {
            node.renderAngle = node.baseAngle ?? node.angle;
            node.renderX = node.baseX ?? node.x;
            node.renderY = node.baseY ?? node.y;
        });

        clearBlackholeGuides();
    }

    function getBoardCenter(){
        return {
            x: boardCenterX,
            y: boardCenterY
        };
    }

    function getBlackholeNodeSpeed(node){

        if(node.playable && BLACKHOLE_ACTIVE_RINGS.includes(node.ring)){
            return BLACKHOLE_RING_SPEED[node.ring] || 0;
        }

        if(!node.playable && node.ring > 0){

            const direction = node.ring % 2 === 0 ? -1 : 1;

            const depth = Math.max(
                0,
                node.ring - PLAYABLE_RING_LIMIT
            );

            const attenuation = Math.max(
                .34,
                1 - depth * .045
            );

            return direction * BLACKHOLE_FILLER_SPEED * attenuation;

        }

        return 0;

    }

    function updateBlackholeNodePositions(delta = 16){

        const center = getBoardCenter();

        nodes.forEach(node => {

            const speed = getBlackholeNodeSpeed(node);

            if(!speed){
                node.renderX = node.baseX ?? node.x;
                node.renderY = node.baseY ?? node.y;
                return;
            }

            node.renderAngle += speed * delta;

            const radius = node.radius;

            node.renderX = center.x + Math.cos(node.renderAngle) * radius;
            node.renderY = center.y + Math.sin(node.renderAngle) * radius;

        });

    }

    function updateRenderedNodePositions(){

        nodes.forEach(node => {

            if(node.element){
                node.element.setAttribute('points', getCellPoints(node));
            }

            if(node.coreElement){
                const x = node.renderX ?? node.x;
                const y = node.renderY ?? node.y;
                const visualSize = node.renderSize ?? node.size;

                node.coreElement.setAttribute('cx', x);
                node.coreElement.setAttribute('cy', y);
                node.coreElement.setAttribute('r', Math.max(5, visualSize * .18));
            }

        });

        updatePlayerPosition();

    }

    function updateBlackholeGuidePositions(){

        if(!blackholeGuideLines.length) return;

        blackholeGuideLines.forEach(line => {

            const fromNode = getNode(line.__fromId);
            const toNode = getNode(line.__toId);

            if(!fromNode || !toNode) return;

            line.setAttribute('x1', fromNode.renderX ?? fromNode.x);
            line.setAttribute('y1', fromNode.renderY ?? fromNode.y);
            line.setAttribute('x2', toNode.renderX ?? toNode.x);
            line.setAttribute('y2', toNode.renderY ?? toNode.y);

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

            const nodeX = node.renderX ?? node.x;
            const nodeY = node.renderY ?? node.y;

            const distance = Math.hypot(
                nodeX - mouseX,
                nodeY - mouseY
            );

            /*
                Área de revelado.
                En Fantasma se amplía ligeramente para descubrir más casillas.
            */
            const cellRadius = node.size * .56;

            const isGhost = root.classList.contains('fx-ghost');

            const revealMargin = isGhost
                ? node.playable ? 108 : 94
                : node.playable ? 72 : 62;

            const nearCursor = distance < cellRadius + revealMargin;

            node.element.classList.toggle('is-near-cursor', nearCursor);

        });
        updateBlackholeGuides(mouseX, mouseY);
    }

    function scheduleCursorReveal(event){

        latestCursorEvent = event;

        if(cursorRevealFrame) return;

        cursorRevealFrame = requestAnimationFrame(() => {

            cursorRevealFrame = null;

            if(latestCursorEvent){
                updateCursorReveal(latestCursorEvent);
            }

        });

    }

    function drawTrail(fromId, toId){

        const from = getNode(fromId);
        const to = getNode(toId);

        if(root.classList.contains('fx-impact')) return;
        if(!from || !to || !trailLayer) return;

        const line = createSvgElement('line', {
            class:'exp-trail is-active',
            x1:from.renderX ?? from.x,
            y1:from.renderY ?? from.y,
            x2:to.renderX ?? to.x,
            y2:to.renderY ?? to.y,
            stroke:selectedTrailColor
        });

        line.__fromId = fromId;
        line.__toId = toId;

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



    function getEndingNodePosition(node){

        return {
            x:node.renderX ?? node.x,
            y:node.renderY ?? node.y
        };

    }

    function recordEndingStep(fromNodeId, toNodeId){

        if(endingStarted) return;
        if(!fromNodeId || !toNodeId) return;
        if(fromNodeId === toNodeId) return;

        const fromNode = getNode(fromNodeId);
        const toNode = getNode(toNodeId);

        if(!fromNode || !toNode) return;

        const fromPosition = getEndingNodePosition(fromNode);
        const toPosition = getEndingNodePosition(toNode);

        routeHistory.push({
            index:routeStepCounter,
            from:fromNodeId,
            to:toNodeId,
            fromX:fromPosition.x,
            fromY:fromPosition.y,
            toX:toPosition.x,
            toY:toPosition.y
        });

        routeStepCounter++;

    }

    function getResultBaseUrl(){

        const url = new URL('https://fabianfloreses.github.io/Enrutate-U3-TiX---Fabian-Flores/resultado.html');

        url.search = '';
        url.hash = '';

        return url;

    }

    function getEndingRoutePoints(){

        const points = [];

        routeHistory.forEach((step, index) => {

            if(index === 0){
                points.push({
                    x:step.fromX,
                    y:step.fromY
                });
            }

            points.push({
                x:step.toX,
                y:step.toY
            });

        });

        if(!points.length){
            const currentNode = getNode(currentNodeId);

            if(currentNode){
                const currentPosition = getEndingNodePosition(currentNode);

                points.push({
                    x:currentPosition.x,
                    y:currentPosition.y
                });
            }
        }

        return points;

    }

    function getEndingMappedPoints(){

        const points = getEndingRoutePoints();

        if(!points.length) return [];

        let minX = Math.min(...points.map(point => point.x));
        let maxX = Math.max(...points.map(point => point.x));
        let minY = Math.min(...points.map(point => point.y));
        let maxY = Math.max(...points.map(point => point.y));

        if(Math.abs(maxX - minX) < 1){
            minX -= 1;
            maxX += 1;
        }

        if(Math.abs(maxY - minY) < 1){
            minY -= 1;
            maxY += 1;
        }

        const viewSize = 1000;
        const padding = 110;
        const availableSize = viewSize - padding * 2;

        const width = maxX - minX;
        const height = maxY - minY;

        const scale = Math.min(
            availableSize / width,
            availableSize / height
        );

        const offsetX = (viewSize - width * scale) / 2;
        const offsetY = (viewSize - height * scale) / 2;

        const mappedPoints = points.map(point => {
            return {
                x:Math.round(offsetX + (point.x - minX) * scale),
                y:Math.round(offsetY + (point.y - minY) * scale)
            };
        });

        const cleanPoints = mappedPoints.filter((point, index, list) => {

            if(index === 0) return true;

            const previous = list[index - 1];

            return point.x !== previous.x || point.y !== previous.y;

        });

        /*
            Reduce el recorrido para que el QR sea escaneable.
            Mantiene inicio, final y una muestra proporcional del camino.
        */
        const MAX_QR_POINTS = 26;

        if(cleanPoints.length <= MAX_QR_POINTS){
            return cleanPoints;
        }

        const reducedPoints = [];
        const lastIndex = cleanPoints.length - 1;

        for(let i = 0; i < MAX_QR_POINTS; i++){

            const index = Math.round(
                (i / (MAX_QR_POINTS - 1)) * lastIndex
            );

            const point = cleanPoints[index];
            const previous = reducedPoints[reducedPoints.length - 1];

            if(!previous || previous.x !== point.x || previous.y !== point.y){
                reducedPoints.push(point);
            }

        }

        return reducedPoints;

    }

    function getEndingMappedRouteData(){

        const rawPoints = [];

        routeHistory.forEach(step => {
            rawPoints.push({ x:step.fromX, y:step.fromY });
            rawPoints.push({ x:step.toX, y:step.toY });
        });

        if(!rawPoints.length){
            const currentNode = getNode(currentNodeId);

            if(currentNode){
                const currentPosition = getEndingNodePosition(currentNode);

                rawPoints.push({
                    x:currentPosition.x,
                    y:currentPosition.y
                });
            }
        }

        if(!rawPoints.length){
            return {
                segments:[],
                points:[]
            };
        }

        let minX = Math.min(...rawPoints.map(point => point.x));
        let maxX = Math.max(...rawPoints.map(point => point.x));
        let minY = Math.min(...rawPoints.map(point => point.y));
        let maxY = Math.max(...rawPoints.map(point => point.y));

        if(Math.abs(maxX - minX) < 1){
            minX -= 1;
            maxX += 1;
        }

        if(Math.abs(maxY - minY) < 1){
            minY -= 1;
            maxY += 1;
        }

        const viewSize = 1000;
        const padding = 110;
        const availableSize = viewSize - padding * 2;

        const width = maxX - minX;
        const height = maxY - minY;

        const scale = Math.min(
            availableSize / width,
            availableSize / height
        );

        const offsetX = (viewSize - width * scale) / 2;
        const offsetY = (viewSize - height * scale) / 2;

        function mapPoint(x, y){
            return {
                x:Math.round(offsetX + (x - minX) * scale),
                y:Math.round(offsetY + (y - minY) * scale)
            };
        }

        const segments = routeHistory.map(step => {

            const start = mapPoint(step.fromX, step.fromY);
            const end = mapPoint(step.toX, step.toY);

            return [
                start.x,
                start.y,
                end.x,
                end.y
            ];

        });

        const points = [];
        const pointKeys = new Set();

        segments.forEach(segment => {

            const segmentPoints = [
                { x:segment[0], y:segment[1] },
                { x:segment[2], y:segment[3] }
            ];

            segmentPoints.forEach(point => {

                const key = `${point.x},${point.y}`;

                if(pointKeys.has(key)) return;

                pointKeys.add(key);
                points.push(point);

            });

        });

        if(!segments.length && rawPoints[0]){
            const singlePoint = mapPoint(rawPoints[0].x, rawPoints[0].y);
            points.push(singlePoint);
        }

        return {
            segments,
            points
        };

    }

    function encodePointValue(value){

        const safeValue = Math.max(
            0,
            Math.min(
                1295,
                Math.round(value)
            )
        );

        return safeValue
            .toString(36)
            .padStart(2, '0');

    }

    function encodeResultPoints(points){

        return points
            .map(point => {
                return `${encodePointValue(point.x)}${encodePointValue(point.y)}`;
            })
            .join('');

    }

    function encodeResultSegments(segments){

        return segments
            .map(segment => {
                return [
                    encodePointValue(segment[0]),
                    encodePointValue(segment[1]),
                    encodePointValue(segment[2]),
                    encodePointValue(segment[3])
                ].join('');
            })
            .join('');

    }

    function getResultColorKey(){

        const colorKeys = {
            violet:'v',
            pink:'p',
            orange:'o',
            cyan:'c'
        };

        return colorKeys[selectedCharacter] || 'o';

    }

    function buildResultUrl(){

        const url = getResultBaseUrl();

        const colorKey = getResultColorKey();
        const points = getEndingMappedPoints();

        const encodedPoints = encodeResultPoints(points);

        url.search = '';
        url.hash = '';

        url.searchParams.set(
            'r',
            `${colorKey}.${encodedPoints}`
        );

        return url.toString();

    }

    function renderEndingQr(){

        if(!endingQrBox) return;

        endingQrBox.innerHTML = '';

        const resultUrl = buildResultUrl();

        if(!window.QRCode || !QRCode.toCanvas){

            endingQrBox.innerHTML = '<span>QR no disponible</span>';
            return;

        }

        const canvas = document.createElement('canvas');

        QRCode.toCanvas(
            canvas,
            resultUrl,
            {
                width:190,
                margin:4,
                color:{
                    dark:'#222222',
                    light:'#FFFFFF'
                }
            },
            error => {

                if(error){
                    endingQrBox.innerHTML = '<span>QR no disponible</span>';
                    console.warn('No se pudo generar el QR:', error);
                    return;
                }

                endingQrBox.innerHTML = '';
                endingQrBox.appendChild(canvas);

                syncEndingSideLayout();

            }
        );

    }

    function drawEndingConstellation(){

        if(!endingRoutesLayer || !endingNodesLayer) return;

        endingRoutesLayer.innerHTML = '';
        endingNodesLayer.innerHTML = '';

        const routeColor = selectedPlayerColor || '#008FB8';
        const points = getEndingMappedPoints();

        if(!points.length) return;

        const segments = points.slice(0, -1).map((point, index) => {

            const nextPoint = points[index + 1];

            return {
                x1:point.x,
                y1:point.y,
                x2:nextPoint.x,
                y2:nextPoint.y
            };

        });

        segments.forEach((segment, index) => {

            const ghostLine = createSvgElement('line', {
                class:'exp-ending-route exp-ending-route--ghost',
                x1:segment.x1,
                y1:segment.y1,
                x2:segment.x2,
                y2:segment.y2,
                stroke:routeColor,
                'stroke-width':14
            });

            endingRoutesLayer.appendChild(ghostLine);

            const line = createSvgElement('line', {
                class:'exp-ending-route',
                x1:segment.x1,
                y1:segment.y1,
                x2:segment.x2,
                y2:segment.y2,
                stroke:routeColor,
                'stroke-width':5
            });

            endingRoutesLayer.appendChild(line);

            const length = line.getTotalLength();

            line.style.strokeDasharray = length;
            line.style.strokeDashoffset = length;
            line.style.animationDelay = `${index * 45}ms`;

        });

        points.forEach((point, index) => {

            const circle = createSvgElement('circle', {
                class:'exp-ending-point exp-ending-point-core exp-ending-point--middle',
                cx:point.x,
                cy:point.y,
                r:8,
                stroke:routeColor
            });

            circle.style.animationDelay = `${180 + index * 22}ms`;

            endingNodesLayer.appendChild(circle);

        });

    }

    function quietEndingBoard(){

        clearTimeout(interferenceTimer);
        clearTimeout(interferenceLoadingTimer);

        root.classList.remove(
            'is-final',
            'is-interference-loading',
            ...INTERFERENCE_CLASSES
        );

        stopMatrixEffect();
        stopGlitchEffect();
        stopImpactEffect();
        stopBlackholeMotion();
        stopTransportEffect();
        clearBlackholeGuides();

        if(finalOverlay){
            finalOverlay.setAttribute('aria-hidden', 'true');
            finalOverlay.removeAttribute('data-state');
        }

    }

    function syncEndingSideLayout(){

        if(!endingEl || !endingCard || !comboPanel || !endingActions) return;
        if(!endingEl.classList.contains('is-ending-revealed')) return;

        /*
            En pantallas pequeñas dejamos que el responsive maneje todo.
        */
        if(window.innerWidth <= 768){
            root.style.removeProperty('--ending-side-width');
            root.style.removeProperty('--ending-side-left');
            root.style.removeProperty('--ending-panel-top');
            root.style.removeProperty('--ending-actions-top');
            return;
        }

        const cardRect = endingCard.getBoundingClientRect();

        const sideWidth = window.innerWidth < 1280
            ? 300
            : 320;

        const gap = clamp(
            window.innerWidth * .028,
            28,
            46
        );

        let sideLeft = cardRect.right + gap;

        const maxSideLeft = window.innerWidth - sideWidth - 28;

        if(sideLeft > maxSideLeft){
            sideLeft = maxSideLeft;
        }

        /*
            Alturas reales de la leyenda y botones.
            Así el conjunto completo queda centrado respecto a la tarjeta.
        */
        const panelHeight = comboPanel.offsetHeight;
        const actionsHeight = endingActions.offsetHeight;

        const stackGap = clamp(
            window.innerHeight * .055,
            38,
            58
        );

        const stackHeight = panelHeight + stackGap + actionsHeight;

        const cardCenterY = cardRect.top + cardRect.height / 2;

        let stackTop = cardCenterY - stackHeight / 2;

        const minTop = 28;
        const maxTop = window.innerHeight - stackHeight - 28;

        stackTop = clamp(
            stackTop,
            minTop,
            Math.max(minTop, maxTop)
        );

        const actionsTop = stackTop + panelHeight + stackGap;

        root.style.setProperty('--ending-side-width', `${sideWidth}px`);
        root.style.setProperty('--ending-side-left', `${Math.round(sideLeft)}px`);
        root.style.setProperty('--ending-panel-top', `${Math.round(stackTop)}px`);
        root.style.setProperty('--ending-actions-top', `${Math.round(actionsTop)}px`);

    }

    function startEndingSequence(){

        if(endingStarted) return;
        if(!endingEl) return;

        endingStarted = true;

        clearTimeout(endingStartTimer);
        clearTimeout(endingRevealTimer);
        clearTimeout(endingQuietTimer);

        root.classList.add('is-ending-locked');

        endingEl.removeAttribute('aria-hidden');
        endingEl.classList.add('is-ending-active');

        endingQuietTimer = setTimeout(() => {
            quietEndingBoard();
        }, ENDING_QUIET_DELAY);

        endingRevealTimer = setTimeout(() => {
            drawEndingConstellation();
            renderEndingQr();

            endingEl.classList.add('is-ending-revealed');

            if(comboPanel){
                comboPanel.classList.add('is-ending-centered');
            }

            syncEndingSideLayout();

            requestAnimationFrame(() => {
                syncEndingSideLayout();
            });

            setTimeout(() => {
                syncEndingSideLayout();
            }, 120);

        }, ENDING_WAVE_DURATION);
    }

    function checkEndingCompletion(delay = 0){

        if(endingStarted) return;

        if(discoveredSequences.size < ENDING_TOTAL_SERIES) return;

        clearTimeout(endingStartTimer);

        endingStartTimer = setTimeout(() => {
            startEndingSequence();
        }, delay);

    }

    function resetEndingState(){

        clearTimeout(endingStartTimer);
        clearTimeout(endingRevealTimer);
        clearTimeout(endingQuietTimer);

        endingStarted = false;
        endingStartTimer = null;
        endingRevealTimer = null;
        endingQuietTimer = null;

        routeHistory = [];
        routeStepCounter = 0;

        root.classList.remove('is-ending-locked');

        root.style.removeProperty('--ending-side-width');
        root.style.removeProperty('--ending-side-left');
        root.style.removeProperty('--ending-panel-top');
        root.style.removeProperty('--ending-actions-top');

        if(comboPanel){
            comboPanel.classList.remove('is-ending-centered');
        }

        if(endingEl){
            endingEl.setAttribute('aria-hidden', 'true');
            endingEl.classList.remove(
                'is-ending-active',
                'is-ending-revealed'
            );
        }

        if(endingRoutesLayer){
            endingRoutesLayer.innerHTML = '';
        }

        if(endingNodesLayer){
            endingNodesLayer.innerHTML = '';
        }

        if(endingQrBox){
            endingQrBox.innerHTML = '<span>QR</span>';
        }

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

    function registerTransformation(color){

        const key = colorKeys[color];

        if(!key) return;

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

                const cellsMarkup = transformSequence
                    .map((key, index) => {

                        const cell = getProgressCellMarkup(key);

                        if(index === 0){
                            return cell;
                        }

                        return `<span class="exp-progress-plus">+</span>${cell}`;

                    })
                    .join('');

                progressLabel.innerHTML = `
                    <span class="exp-progress-text">Serie:</span>
                    <span class="exp-progress-cells">${cellsMarkup}</span>
                `;

            }

        }

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

        root.classList.add('is-interference-loading');

        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                interferenceLoadingTimer = setTimeout(() => {

                    root.classList.remove(...INTERFERENCE_CLASSES);

                    stopMatrixEffect();
                    stopGlitchEffect();
                    stopImpactEffect();
                    stopBlackholeMotion();
                    stopTransportEffect();
                    clearBlackholeGuides();

                    root.classList.remove('is-interference-loading');
                    root.classList.add(finalData.className);
                    root.classList.add('is-final');

                    if(finalOverlay){
                        finalOverlay.setAttribute('data-state', 'active');
                    }

                    if(finalLabel){
                        finalLabel.textContent = finalData.label;
                    }

                    if(finalData.className !== 'fx-impact' && trailLayer){
                        trailLayer.querySelectorAll('.exp-trail').forEach(line => {
                            line.classList.add('is-final');
                        });
                    }

                    returnCharacterToCenter();

                    if(finalData.className === 'fx-blackhole'){
                        startBlackholeMotion();
                    }

                    if(finalData.className === 'fx-transport'){
                        startTransportEffect();
                    }

                    if(finalData.className === 'fx-impact'){
                        if(trailLayer){
                            trailLayer.innerHTML = '';
                        }

                        currentRouteLines = [];
                        startImpactEffect();
                    }

                    if(finalData.className === 'fx-glitch'){
                        startGlitchEffect();
                    }

                    if(finalData.className === 'fx-matrix'){
                        startMatrixEffect();
                    }

                    checkEndingCompletion(1250);

                    interferenceTimer = setTimeout(() => {

                        transformSequence = [];
                        updateSequencePanel();

                        if(finalOverlay){
                            finalOverlay.setAttribute('aria-hidden', 'true');
                            finalOverlay.removeAttribute('data-state');
                        }

                        root.classList.remove('is-final');

                    }, 950);

                }, 620);

            });

        });

    }



    function getImpactBounds(){

        const viewBox = boardSvg
            .getAttribute('viewBox')
            .split(' ')
            .map(Number);

        const [x, y, width, height] = viewBox;

        const margin = 86;

        return {
            minX:x + margin,
            maxX:x + width - margin,
            minY:y + margin,
            maxY:y + height - margin
        };

    }

    function updateImpactEdges(){

        if(!baseEdgesGroup) return;

        baseEdgesGroup.querySelectorAll('.exp-base-edge').forEach(line => {

            const a = getNode(line.__edgeA);
            const b = getNode(line.__edgeB);

            if(!a || !b) return;

            line.setAttribute('x1', a.renderX ?? a.x);
            line.setAttribute('y1', a.renderY ?? a.y);
            line.setAttribute('x2', b.renderX ?? b.x);
            line.setAttribute('y2', b.renderY ?? b.y);

        });

    }

    function updateImpactTrails(){

        if(!trailLayer) return;

        trailLayer.querySelectorAll('.exp-trail').forEach(line => {

            const from = getNode(line.__fromId);
            const to = getNode(line.__toId);

            if(!from || !to) return;

            line.setAttribute('x1', from.renderX ?? from.x);
            line.setAttribute('y1', from.renderY ?? from.y);
            line.setAttribute('x2', to.renderX ?? to.x);
            line.setAttribute('y2', to.renderY ?? to.y);

        });

    }

    function updateImpactGeometry(){

        nodes.forEach(node => {

            const x = node.renderX ?? node.x;
            const y = node.renderY ?? node.y;
            const visualSize = node.renderSize ?? node.size;

            if(node.element){
                node.element.setAttribute('points', getCellPoints(node));
            }

            if(node.coreElement){
                node.coreElement.setAttribute('cx', x);
                node.coreElement.setAttribute('cy', y);
                node.coreElement.setAttribute('r', Math.max(5, visualSize * .18));
            }

        });

        updateImpactEdges();
        updateImpactTrails();
        updatePlayerPosition();

    }

    function shuffleImpactItems(items){

        return [...items].sort(() => Math.random() - .5);

    }

    function getBaseImpactAvailableIds(){

        return getConnectedNodeIds(currentNodeId)
            .filter(id => {

                const node = getNode(id);

                return node && node.playable && id !== currentNodeId;

            });

    }

    function pickImpactNodes(){

        const requiredIds = [
            currentNodeId,
            ...getBaseImpactAvailableIds()
        ].filter(Boolean);

        const uniqueRequiredIds = [...new Set(requiredIds)];

        const pool = nodes.filter(node => {
            return (
                node.ring > 0 &&
                !uniqueRequiredIds.includes(node.id)
            );
        });

        const shuffledPool = shuffleImpactItems(pool);

        const remainingCount = Math.max(
            0,
            IMPACT_VISIBLE_COUNT - uniqueRequiredIds.length
        );

        impactNodeIds = [
            ...uniqueRequiredIds,
            ...shuffledPool.slice(0, remainingCount).map(node => node.id)
        ];

    }

    function setImpactWideViewBox(){

        if(!boardSvg) return;

        const currentViewBox = boardSvg.getAttribute('viewBox');

        if(!impactOriginalViewBox){
            impactOriginalViewBox = currentViewBox;
        }

        const [x, y, width, height] = currentViewBox
            .split(' ')
            .map(Number);

        const screenRatio = boardSvg.clientWidth / boardSvg.clientHeight;

        const centerX = x + width / 2;
        const centerY = y + height / 2;

        const impactHeight = height;
        const impactWidth = impactHeight * screenRatio;

        boardSvg.setAttribute(
            'viewBox',
            `${centerX - impactWidth / 2} ${centerY - impactHeight / 2} ${impactWidth} ${impactHeight}`
        );

    }

    function restoreImpactViewBox(){

        if(!impactOriginalViewBox) return;

        boardSvg.setAttribute('viewBox', impactOriginalViewBox);
        impactOriginalViewBox = null;

    }

    function easeImpactOut(t){
        return 1 - Math.pow(1 - t, 3);
    }

    function mixImpactValue(a, b, t){
        return a + (b - a) * t;
    }

    function prepareImpactNodes(){

        setImpactWideViewBox();
        pickImpactNodes();

        const bounds = getImpactBounds();
        const activeImpactIds = new Set(impactNodeIds);

        nodes.forEach(node => {

            if(node.baseX == null){
                node.baseX = node.x;
            }

            if(node.baseY == null){
                node.baseY = node.y;
            }

            const isActiveImpactNode = activeImpactIds.has(node.id);

            if(!isActiveImpactNode){

                node.renderX = node.baseX ?? node.x;
                node.renderY = node.baseY ?? node.y;
                node.renderSize = node.size;

                node.impactVX = 0;
                node.impactVY = 0;

                if(node.element){
                    node.element.classList.remove('is-impacting');
                    node.element.classList.add('is-impact-hidden');
                }

                return;

            }

            if(node.element){
                node.element.classList.remove('is-impact-hidden');
                node.element.classList.add('is-impacting');
            }

            if(node.ring === 0){

                node.renderX = node.x;
                node.renderY = node.y;
                node.renderSize = Math.max(node.size, 68);

                node.impactVX = 0;
                node.impactVY = 0;

                return;

            }

            const startX = node.renderX ?? node.baseX ?? node.x;
            const startY = node.renderY ?? node.baseY ?? node.y;

            const targetX = rand(bounds.minX, bounds.maxX);
            const targetY = rand(bounds.minY, bounds.maxY);

            const targetSize = IMPACT_CELL_SIZE;

            node.impactStartX = startX;
            node.impactStartY = startY;
            node.impactStartSize = targetSize;

            node.impactTargetX = targetX;
            node.impactTargetY = targetY;
            node.impactTargetSize = targetSize;

            node.renderX = startX;
            node.renderY = startY;
            node.renderSize = targetSize;

            const angle = rand(0, Math.PI * 2);

            const speed = node.playable
                ? rand(.24, .46)
                : rand(.14, .32);

            node.impactVX = Math.cos(angle) * speed;
            node.impactVY = Math.sin(angle) * speed;

        });

        updateImpactGeometry();
        updateCells();

    }

    function limitImpactVelocity(node){

        let vx = node.impactVX ?? 0;
        let vy = node.impactVY ?? 0;

        const speed = Math.hypot(vx, vy);

        const maxSpeed = node.playable ? .48 : .34;
        const minSpeed = node.playable ? .16 : .09;

        if(speed > maxSpeed){
            vx = (vx / speed) * maxSpeed;
            vy = (vy / speed) * maxSpeed;
        }

        if(speed < minSpeed){
            const angle = rand(0, Math.PI * 2);

            vx = Math.cos(angle) * minSpeed;
            vy = Math.sin(angle) * minSpeed;
        }

        node.impactVX = vx;
        node.impactVY = vy;

    }

    function resolveImpactCollisions(bounds){

        const activeNodes = impactNodeIds
            .map(id => getNode(id))
            .filter(node => {
                return (
                    node &&
                    node.ring > 0 &&
                    node.renderX != null &&
                    node.renderY != null
                );
            });

        for(let i = 0; i < activeNodes.length; i++){

            const nodeA = activeNodes[i];

            for(let j = i + 1; j < activeNodes.length; j++){

                const nodeB = activeNodes[j];

                const ax = nodeA.renderX ?? nodeA.x;
                const ay = nodeA.renderY ?? nodeA.y;
                const bx = nodeB.renderX ?? nodeB.x;
                const by = nodeB.renderY ?? nodeB.y;

                const dx = bx - ax;
                const dy = by - ay;

                const distance = Math.hypot(dx, dy);

                if(distance <= 0) continue;

                const radiusA = ((nodeA.renderSize ?? nodeA.size) / 2) * IMPACT_COLLISION_RADIUS_SCALE;
                const radiusB = ((nodeB.renderSize ?? nodeB.size) / 2) * IMPACT_COLLISION_RADIUS_SCALE;

                const minDistance = radiusA + radiusB;

                if(distance >= minDistance) continue;

                const nx = dx / distance;
                const ny = dy / distance;

                const overlap = minDistance - distance;
                const push = overlap * IMPACT_COLLISION_PUSH;

                nodeA.renderX -= nx * push * .5;
                nodeA.renderY -= ny * push * .5;

                nodeB.renderX += nx * push * .5;
                nodeB.renderY += ny * push * .5;

                const avx = nodeA.impactVX ?? 0;
                const avy = nodeA.impactVY ?? 0;
                const bvx = nodeB.impactVX ?? 0;
                const bvy = nodeB.impactVY ?? 0;

                const aNormal = avx * nx + avy * ny;
                const bNormal = bvx * nx + bvy * ny;

                const aTangentX = avx - aNormal * nx;
                const aTangentY = avy - aNormal * ny;

                const bTangentX = bvx - bNormal * nx;
                const bTangentY = bvy - bNormal * ny;

                nodeA.impactVX = aTangentX + bNormal * nx * IMPACT_COLLISION_BOUNCE;
                nodeA.impactVY = aTangentY + bNormal * ny * IMPACT_COLLISION_BOUNCE;

                nodeB.impactVX = bTangentX + aNormal * nx * IMPACT_COLLISION_BOUNCE;
                nodeB.impactVY = bTangentY + aNormal * ny * IMPACT_COLLISION_BOUNCE;

                limitImpactVelocity(nodeA);
                limitImpactVelocity(nodeB);

            }

        }

        activeNodes.forEach(node => {

            const radius = (node.renderSize ?? node.size) / 2;

            node.renderX = clamp(
                node.renderX,
                bounds.minX + radius,
                bounds.maxX - radius
            );

            node.renderY = clamp(
                node.renderY,
                bounds.minY + radius,
                bounds.maxY - radius
            );

            limitImpactVelocity(node);

        });

    }

    function updateImpactMotion(delta){

        const bounds = getImpactBounds();
        const safeDelta = Math.min(delta, IMPACT_MAX_DELTA);

        nodes.forEach(node => {

            if(!impactNodeIds.includes(node.id)) return;
            if(node.ring === 0) return;

            let x = node.renderX ?? node.x;
            let y = node.renderY ?? node.y;

            let vx = node.impactVX ?? 0;
            let vy = node.impactVY ?? 0;

            x += vx * safeDelta;
            y += vy * safeDelta;

            const radius = (node.renderSize ?? node.size) / 2;

            if(x - radius < bounds.minX){
                x = bounds.minX + radius;
                vx = Math.abs(vx) * IMPACT_WALL_BOUNCE;
            }

            if(x + radius > bounds.maxX){
                x = bounds.maxX - radius;
                vx = -Math.abs(vx) * IMPACT_WALL_BOUNCE;
            }

            if(y - radius < bounds.minY){
                y = bounds.minY + radius;
                vy = Math.abs(vy) * IMPACT_WALL_BOUNCE;
            }

            if(y + radius > bounds.maxY){
                y = bounds.maxY - radius;
                vy = -Math.abs(vy) * IMPACT_WALL_BOUNCE;
            }

            vx += rand(-.012, .012);
            vy += rand(-.012, .012);

            node.renderX = x;
            node.renderY = y;

            node.impactVX = vx;
            node.impactVY = vy;

            limitImpactVelocity(node);

        });

        resolveImpactCollisions(bounds);

        updateImpactGeometry();

    }

    function startImpactEffect(){

        stopImpactEffect();

        prepareImpactNodes();

        root.classList.add('is-impact-dispersing');

        const entryStart = performance.now();
        const entryDuration = 950;

        function animateImpactEntry(now){

            const progress = Math.min((now - entryStart) / entryDuration, 1);
            const eased = easeImpactOut(progress);

            impactNodeIds.forEach(id => {

                const node = getNode(id);

                if(!node || node.ring === 0) return;

                node.renderX = mixImpactValue(
                    node.impactStartX,
                    node.impactTargetX,
                    eased
                );

                node.renderY = mixImpactValue(
                    node.impactStartY,
                    node.impactTargetY,
                    eased
                );

                node.renderSize = mixImpactValue(
                    node.impactStartSize,
                    node.impactTargetSize,
                    eased
                );

            });

            updateImpactGeometry();

            if(progress < 1){

                impactEntryFrame = requestAnimationFrame(animateImpactEntry);
                return;

            }

            root.classList.remove('is-impact-dispersing');

            impactLastTime = performance.now();

            function animateImpact(now){

                const delta = now - impactLastTime;
                impactLastTime = now;

                updateImpactMotion(delta);

                impactFrame = requestAnimationFrame(animateImpact);

            }

            impactFrame = requestAnimationFrame(animateImpact);

        }

        impactEntryFrame = requestAnimationFrame(animateImpactEntry);

    }

    function stopImpactEffect(){

        if(impactEntryFrame){
            cancelAnimationFrame(impactEntryFrame);
            impactEntryFrame = null;
        }

        if(impactFrame){
            cancelAnimationFrame(impactFrame);
            impactFrame = null;
        }

        impactLastTime = null;

        root.classList.remove('is-impact-dispersing');

        impactNodeIds = [];

        nodes.forEach(node => {

            node.renderX = node.baseX ?? node.x;
            node.renderY = node.baseY ?? node.y;
            node.renderSize = node.size;

            node.impactVX = 0;
            node.impactVY = 0;

            node.impactStartX = null;
            node.impactStartY = null;
            node.impactStartSize = null;

            node.impactTargetX = null;
            node.impactTargetY = null;
            node.impactTargetSize = null;

            if(node.element){
                node.element.classList.remove(
                    'is-impacting',
                    'is-impact-hidden'
                );
            }

        });

        restoreImpactViewBox();
        updateImpactGeometry();
        updateCells();

    }




    function updateGlitchTransform(){

        const transform = `rotate(${glitchAngle} ${boardCenterX} ${boardCenterY})`;

        [
            layerRingsGroup,
            baseEdgesGroup,
            fogLayer,
            trailLayer,
            cellsLayer,
            playerLayer
        ].forEach(group => {

            if(group){
                group.setAttribute('transform', transform);
            }

        });

    }

    function startGlitchEffect(){

        stopGlitchEffect();

        glitchAngle = 0;
        updateGlitchTransform();

        function runGlitchCycle(){

            /*
                Primero: movimiento incómodo breve.
            */
            root.classList.add('is-glitch-shaking');

            glitchShakeTimer = setTimeout(() => {

                /*
                    Luego: giro brusco.
                */
                root.classList.remove('is-glitch-shaking');

                glitchAngle += 90;
                updateGlitchTransform();

                const nextDelay = Math.floor(rand(2100, 3000));

                glitchTimer = setTimeout(runGlitchCycle, nextDelay);

            }, 720);

        }

        glitchTimer = setTimeout(runGlitchCycle, 1100);

    }

    function stopGlitchEffect(){

        if(glitchTimer){
            clearTimeout(glitchTimer);
            glitchTimer = null;
        }

        if(glitchShakeTimer){
            clearTimeout(glitchShakeTimer);
            glitchShakeTimer = null;
        }

        glitchAngle = 0;

        root.classList.remove('is-glitch-shaking');

        root.style.removeProperty('--glitch-rotation');

        [
            layerRingsGroup,
            baseEdgesGroup,
            fogLayer,
            trailLayer,
            cellsLayer,
            playerLayer
        ].forEach(group => {

            if(group){
                group.removeAttribute('transform');
            }

        });

    }
    



    function getMatrixBaseAvailableIds(){

        if(!currentNodeId) return [];

        return getConnectedNodeIds(currentNodeId)
            .filter(id => {

                const node = getNode(id);

                if(!node) return false;
                if(!node.playable) return false;
                if(node.ring === 0) return false;
                if(currentRouteNodeIds.includes(id)) return false;

                return true;

            });

    }

    function getMatrixColorOptions(color){

        return getMatrixBaseAvailableIds()
            .filter(id => {

                const node = getNode(id);

                return node && node.color === color;

            });

    }

    function setMatrixActiveColor(color){

        matrixActiveColor = color;

        root.setAttribute('data-matrix-color', color);

        root.classList.remove('is-matrix-scanning');

        if(boardWrap){
            void boardWrap.offsetWidth;
        }

        root.classList.add('is-matrix-scanning');

        updateCells();

    }

    function advanceMatrixScan(){

        const nextColor = MATRIX_COLORS[matrixColorIndex];

        matrixColorIndex = (matrixColorIndex + 1) % MATRIX_COLORS.length;

        setMatrixActiveColor(nextColor);

    }

    function startMatrixEffect(){

        stopMatrixEffect();

        clearBlackholeGuides();

        matrixColorIndex = 0;

        advanceMatrixScan();

        matrixTimer = setInterval(() => {
            advanceMatrixScan();
        }, 1500);

    }

    function stopMatrixEffect(){

        if(matrixTimer){
            clearInterval(matrixTimer);
            matrixTimer = null;
        }

        mmatrixActiveColor = null;
        matrixColorIndex = 0;

        root.classList.remove('is-matrix-scanning');
        root.removeAttribute('data-matrix-color');

        nodes.forEach(node => {

            if(!node.element) return;

            node.element.classList.remove(
                'is-matrix-active',
                'is-matrix-locked'
            );

        });

        updateCells();

    }




    function pulseRedCell(node){

        if(!node || !node.element) return;

        node.element.classList.add('is-red-pulse');

        setTimeout(() => {
            node.element.classList.remove('is-red-pulse');
        }, 700);

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
            pulseRedCell(node);
        }

    }

    function moveToNode(nodeId){

        if(!selectedCharacter) return;

        const availableIds = getAvailableNodeIds();

        if(!availableIds.includes(nodeId)) return;

        const previousNodeId = currentNodeId;

        currentNodeId = nodeId;

        recordEndingStep(previousNodeId, currentNodeId);

        drawTrail(previousNodeId, currentNodeId);

        if(!currentRouteNodeIds.includes(previousNodeId)){
            currentRouteNodeIds.push(previousNodeId);
        }

        if(!currentRouteNodeIds.includes(currentNodeId)){
            currentRouteNodeIds.push(currentNodeId);
        }

        const currentNode = getNode(currentNodeId);

        if(root.classList.contains('fx-transport')){

            flashTransportLanding(currentNode);
            triggerTransportResetWave();

        }

        applyColorEvent(currentNode);

        updatePlayerPosition();
        updatePlayerColor();
        updateCells();

        if(root.classList.contains('fx-matrix')){
            advanceMatrixScan();

            if(matrixTimer){
                clearInterval(matrixTimer);
            }

            matrixTimer = setInterval(() => {
                advanceMatrixScan();
            }, 1500);
        }

        const hasOptions = root.classList.contains('fx-matrix')
            ? getMatrixBaseAvailableIds().length > 0
            : getAvailableNodeIds().length > 0;

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

        resetEndingState();

        root.classList.remove(
            'is-final',
            ...INTERFERENCE_CLASSES
        );
        
        stopMatrixEffect();
        stopGlitchEffect();
        stopImpactEffect();
        stopBlackholeMotion();
        stopTransportEffect();
        clearBlackholeGuides();
        
        discoveredSequences.clear();

        if(finalOverlay){
            finalOverlay.setAttribute('aria-hidden', 'true');
        }

        if(trailLayer){
            trailLayer.innerHTML = '';
        }

        if(atmosphereLayer){
            atmosphereLayer.innerHTML = '';
        }

        transformSequence = [];

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

    if(endingResetButton){
        endingResetButton.addEventListener('click', resetExperiment);
    }

    if(boardWrap){

        boardWrap.addEventListener('wheel', event => {

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

        boardWrap.addEventListener('mousemove', scheduleCursorReveal);

        boardWrap.addEventListener('mouseleave', () => {

            nodes.forEach(node => {

                if(node.element){
                    node.element.classList.remove('is-near-cursor');
                }

            });

            clearBlackholeGuides();

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

    window.addEventListener('resize', () => {
        syncEndingSideLayout();
    });

    initBoard();

})();
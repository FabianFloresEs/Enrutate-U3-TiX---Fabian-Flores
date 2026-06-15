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

/* ================================= */
/* EXPERIMENTACIÓN DIGITAL */
/* ================================= */

(function(){

    const experimentPage = document.body.classList.contains('experimentacion-page');

    if(!experimentPage) return;

    const root = document.getElementById('expRoot');
    const enterButton = document.querySelector('[data-exp-enter]');
    const backEntryButton = document.querySelector('[data-exp-back-entry]');
    const resetButton = document.querySelector('[data-exp-reset]');

    const characterButtons = document.querySelectorAll('[data-exp-character]');
    const effectCards = document.querySelectorAll('[data-exp-effect]');

    const boardWrap = document.querySelector('.exp-board-wrap');

    const layerRingsGroup = document.getElementById('expLayerRings');
    const baseEdgesGroup = document.getElementById('expBaseEdges');
    const trailLayer = document.getElementById('expTrailLayer');
    const cellsLayer = document.getElementById('expCellsLayer');
    const fogLayer = document.getElementById('expFogLayer');
    const playerLayer = document.getElementById('expPlayerLayer');

    const stepDots = document.querySelectorAll('.exp-step-indicator span');
    const progressFill = document.getElementById('expProgressFill');

    if(!root || !cellsLayer || !playerLayer) return;

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

    let selectedCharacter = null;
    let selectedPlayerColor = '#7C4DFF';
    let selectedTrailColor = '#4C2BBF';

    let nodes = [];
    let edges = [];
    let fogElements = [];

    let currentNodeId = null;
    let startNodeId = null;
    let checkpointNodeId = null;

    let unlockedRing = 1;
    let stepCount = 0;
    let isComplete = false;

    let routeIndex = 0;
    let currentRouteLines = [];

    const totalProgressLength = 326.72;

    function createSvgElement(tag, attributes = {}){

        const element = document.createElementNS(NS, tag);

        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });

        return element;

    }

    function getNode(id){
        return nodes.find(node => node.id === id);
    }

    function makeNodeId(ring, index){
        return `r${ring}-n${index}`;
    }

    function getRouteColor(){

        if(!selectedCharacter){
            return '#4C2BBF';
        }

        const palette = trailPalettes[selectedCharacter];

        return palette[routeIndex % palette.length];

    }

    function revealEffectInfo(color){

        effectCards.forEach(card => {

            const cardColor = card.getAttribute('data-exp-effect');

            if(cardColor === color){
                card.classList.add('is-unlocked');
            }

        });

    }

    function resetEffectInfo(){

        effectCards.forEach(card => {
            card.classList.remove('is-unlocked');
        });

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

    function buildNodes(){

        const ringData = [
            { ring:0, count:1, radius:0, size:48 },
            { ring:1, count:8, radius:150, size:40 },
            { ring:2, count:12, radius:265, size:36 },
            { ring:3, count:16, radius:375, size:32 },
            { ring:4, count:22, radius:470, size:28 }
        ];

        const colorPattern = [
            'blue', 'green', 'red',
            'green', 'blue', 'red',
            'blue', 'green', 'red'
        ];

        nodes = [];

        ringData.forEach(ringInfo => {

            for(let i = 0; i < ringInfo.count; i++){

                let x = 500;
                let y = 500;

                if(ringInfo.ring > 0){

                    const angle = (-90 + (360 / ringInfo.count) * i + ringInfo.ring * 7) * Math.PI / 180;

                    x = 500 + Math.cos(angle) * ringInfo.radius;
                    y = 500 + Math.sin(angle) * ringInfo.radius;

                }

                const color = ringInfo.ring === 0
                    ? 'yellow'
                    : colorPattern[(i + ringInfo.ring) % colorPattern.length];

                nodes.push({
                    id:makeNodeId(ringInfo.ring, i),
                    ring:ringInfo.ring,
                    index:i,
                    count:ringInfo.count,
                    radius:ringInfo.radius,
                    x,
                    y,
                    size:ringInfo.size,
                    color,
                    visible:ringInfo.ring <= 1,
                    revealed:ringInfo.ring === 0,
                    stable:false,
                    element:null
                });

            }

        });

    }

    function addEdge(a, b){

        const edgeId = [a, b].sort().join('__');

        if(edges.some(edge => edge.id === edgeId)) return;

        edges.push({
            id:edgeId,
            a,
            b
        });

    }

    function getConnectedNodeIds(id){

        return edges
            .filter(edge => edge.a === id || edge.b === id)
            .map(edge => edge.a === id ? edge.b : edge.a);

    }

    function buildEdges(){

        edges = [];

        const maxRing = 4;

        for(let ring = 1; ring <= maxRing; ring++){

            const ringNodes = nodes.filter(node => node.ring === ring);

            ringNodes.forEach((node, index) => {

                const nextNode = ringNodes[(index + 1) % ringNodes.length];
                const prevNode = ringNodes[(index - 1 + ringNodes.length) % ringNodes.length];

                addEdge(node.id, nextNode.id);

                if(index % 3 === 0){
                    addEdge(node.id, prevNode.id);
                }

            });

        }

        const center = getNode(makeNodeId(0, 0));
        const firstRingNodes = nodes.filter(node => node.ring === 1);

        firstRingNodes.forEach(node => {
            addEdge(center.id, node.id);
        });

        nodes.forEach(node => {

            if(node.ring <= 0 || node.ring >= maxRing) return;

            const nextRingNodes = nodes.filter(otherNode => otherNode.ring === node.ring + 1);

            const sortedByDistance = nextRingNodes
                .map(otherNode => {
                    return {
                        node:otherNode,
                        distance:Math.hypot(otherNode.x - node.x, otherNode.y - node.y)
                    };
                })
                .sort((a, b) => a.distance - b.distance);

            addEdge(node.id, sortedByDistance[0].node.id);
            addEdge(node.id, sortedByDistance[1].node.id);

        });

    }

    function renderLayerRings(){

        if(!layerRingsGroup) return;

        layerRingsGroup.innerHTML = '';

        [150, 265, 375, 470].forEach(radius => {

            const ring = createSvgElement('circle', {
                class:'exp-layer-ring',
                cx:500,
                cy:500,
                r:radius
            });

            layerRingsGroup.appendChild(ring);

        });

    }

    function renderBaseEdges(){

        if(!baseEdgesGroup) return;

        baseEdgesGroup.innerHTML = '';

        edges.forEach(edge => {

            const a = getNode(edge.a);
            const b = getNode(edge.b);

            if(!a || !b) return;

            const line = createSvgElement('line', {
                class:'exp-base-edge',
                x1:a.x,
                y1:a.y,
                x2:b.x,
                y2:b.y
            });

            baseEdgesGroup.appendChild(line);

        });

    }

    function renderFog(){

        if(!fogLayer) return;

        fogLayer.innerHTML = '';
        fogElements = [];

        [
            { ring:2, r:310 },
            { ring:3, r:420 },
            { ring:4, r:520 }
        ].forEach(item => {

            const fog = createSvgElement('circle', {
                class:'exp-fog',
                cx:500,
                cy:500,
                r:item.r,
                'data-fog-ring':item.ring
            });

            fogElements.push(fog);
            fogLayer.appendChild(fog);

        });

    }

    function updateFog(){

        fogElements.forEach(fog => {

            const ring = Number(fog.getAttribute('data-fog-ring'));

            fog.classList.toggle('is-hidden', ring <= unlockedRing);

        });

    }

    function renderCells(){

        cellsLayer.innerHTML = '';

        nodes.forEach(node => {

            const cell = createSvgElement('rect', {
                class:'exp-cell',
                x:node.x - node.size / 2,
                y:node.y - node.size / 2,
                width:node.size,
                height:node.size,
                rx:node.size * .28,
                ry:node.size * .28,
                'data-node-id':node.id,
                'data-color':node.color
            });

            cell.addEventListener('click', () => {
                moveToNode(node.id);
            });

            node.element = cell;

            cellsLayer.appendChild(cell);

        });

    }

    function updateCellPosition(node){

        if(!node || !node.element) return;

        node.element.setAttribute('x', node.x - node.size / 2);
        node.element.setAttribute('y', node.y - node.size / 2);

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
            r:18
        });

        player.style.fill = selectedPlayerColor;

        playerLayer.appendChild(player);

    }

    function updatePlayerColor(){

        const player = document.getElementById('expPlayer');

        if(player){
            player.style.fill = selectedPlayerColor;
        }

    }

    function updatePlayerPosition(){

        const player = document.getElementById('expPlayer');
        const node = getNode(currentNodeId);

        if(!player || !node) return;

        player.setAttribute('cx', node.x);
        player.setAttribute('cy', node.y);

    }

    function getAvailableNodeIds(){

        if(!currentNodeId) return [];

        return getConnectedNodeIds(currentNodeId)
            .map(id => getNode(id))
            .filter(Boolean)
            .filter(node => node.visible || node.revealed || node.stable)
            .filter(node => node.ring <= unlockedRing || node.revealed || node.stable)
            .map(node => node.id);

    }

    function updateCells(){

        const availableIds = getAvailableNodeIds();

        nodes.forEach(node => {

            if(node.ring <= unlockedRing || node.revealed || node.stable){
                node.visible = true;
            }

            if(!node.element) return;

            node.element.classList.toggle('is-visible', node.visible);
            node.element.classList.toggle('is-revealed', node.revealed);
            node.element.classList.toggle('is-current', node.id === currentNodeId);
            node.element.classList.toggle('is-available', availableIds.includes(node.id) && !isComplete);
            node.element.classList.toggle('is-stable', node.stable);

        });

        updateFog();

    }

    function updateStepDots(){

        stepDots.forEach((dot, index) => {
            dot.classList.toggle('is-filled', index < stepCount);
        });

    }

    function updateProgress(){

        const revealedAmount = nodes.filter(node => node.revealed).length;
        const progress = revealedAmount / nodes.length;

        const offset = totalProgressLength - totalProgressLength * progress;

        if(progressFill){
            progressFill.style.strokeDashoffset = offset;
        }

        if(progress >= 1 && !isComplete){

            isComplete = true;

            nodes.forEach(node => {
                node.visible = true;
                node.revealed = true;
            });

            finishCurrentRoute();
            updateCells();

            if(boardWrap){
                boardWrap.classList.add('is-complete');
            }

        }

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

    function revealNode(node){

        if(!node) return;

        node.visible = true;
        node.revealed = true;

    }

    function revealNeighbors(node){

        getConnectedNodeIds(node.id).forEach(id => {

            const neighbor = getNode(id);

            if(!neighbor) return;

            neighbor.visible = true;
            neighbor.revealed = true;

        });

    }

    function stabilizeZone(node){

        node.stable = true;

        getConnectedNodeIds(node.id).forEach(id => {

            const neighbor = getNode(id);

            if(!neighbor) return;

            neighbor.visible = true;
            neighbor.stable = true;

        });

    }

    function rotateRing(ring){

        const targetRing = Math.max(1, ring);
        const ringNodes = nodes.filter(node => node.ring === targetRing);

        if(!ringNodes.length) return;

        const angle = (360 / ringNodes.length) * Math.PI / 180;

        ringNodes.forEach(node => {

            const dx = node.x - 500;
            const dy = node.y - 500;

            const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
            const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);

            node.x = 500 + rotatedX;
            node.y = 500 + rotatedY;

            updateCellPosition(node);

        });

        renderBaseEdges();
        updatePlayerPosition();

    }

    function returnFogFrom(node){

        unlockedRing = Math.max(1, node.ring);

        nodes.forEach(item => {

            if(item.ring > unlockedRing && !item.revealed && !item.stable){
                item.visible = false;
            }

        });

        updateFog();

    }

    function shiftBoard(){

        if(!boardWrap) return;

        boardWrap.classList.remove('is-shifting');

        void boardWrap.offsetWidth;

        boardWrap.classList.add('is-shifting');

        setTimeout(() => {
            boardWrap.classList.remove('is-shifting');
        }, 920);

    }

    function interruptAt(node){

        if(!node || !node.element) return;

        node.element.classList.add('is-interruption');

        setTimeout(() => {

            node.element.classList.remove('is-interruption');
            finishCurrentRoute();
            returnToCheckpoint(false);

        }, 650);

    }

    function applyColorEvent(node){

        if(!node) return;

        if(node.color === 'blue'){

            revealEffectInfo('blue');

            rotateRing(node.ring);
            returnFogFrom(node);
            shiftBoard();

        }

        if(node.color === 'green'){

            revealEffectInfo('green');

            revealNeighbors(node);
            stabilizeZone(node);

        }

        if(node.color === 'red'){

            revealEffectInfo('red');

            interruptAt(node);

        }

        if(node.color === 'yellow'){

            revealEffectInfo('yellow');

        }

    }

    function completeStep(node){

        revealNode(node);
        applyColorEvent(node);

        updateCells();
        updateProgress();

    }

    function moveToNode(nodeId){

        if(isComplete || !selectedCharacter) return;

        const availableIds = getAvailableNodeIds();

        if(!availableIds.includes(nodeId)) return;

        const previousNodeId = currentNodeId;

        currentNodeId = nodeId;

        drawTrail(previousNodeId, currentNodeId);

        const currentNode = getNode(currentNodeId);

        if(currentNode && currentNode.color !== 'yellow'){
            stepCount++;
        }

        if(stepCount >= 3){

            stepCount = 0;
            completeStep(currentNode);

        }

        updatePlayerPosition();
        updatePlayerColor();
        updateStepDots();
        updateCells();

        const hasOptions = getAvailableNodeIds().length > 0;

        if(!hasOptions && !isComplete){

            setTimeout(() => {
                finishCurrentRoute();
                returnToCheckpoint(false);
            }, 500);

        }

    }

    function returnToCheckpoint(shouldFinishRoute = true){

        if(isComplete) return;

        if(shouldFinishRoute && currentRouteLines.length > 0){
            finishCurrentRoute();
        }

        currentNodeId = checkpointNodeId;
        stepCount = 0;

        updatePlayerPosition();
        updatePlayerColor();
        updateStepDots();
        updateCells();

    }

    function selectCharacter(character){

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

        revealEffectInfo('yellow');
        returnToCheckpoint(false);

    }

    function goBackToEntry(){

        root.classList.remove('is-board-active');

    }

    function absorbTrailsToCenter(callback){

        if(!trailLayer){
            callback();
            return;
        }

        const trails = Array.from(trailLayer.querySelectorAll('.exp-trail'));

        if(!trails.length){
            callback();
            return;
        }

        if(boardWrap){
            boardWrap.classList.add('is-resetting');
        }

        const centerX = 500;
        const centerY = 500;

        const duration = 900;
        const startTime = performance.now();

        const trailData = trails.map(line => {

            line.classList.add('is-absorbing');
            line.classList.remove('is-past');

            return {
                line,
                x1:Number(line.getAttribute('x1')),
                y1:Number(line.getAttribute('y1')),
                x2:Number(line.getAttribute('x2')),
                y2:Number(line.getAttribute('y2'))
            };

        });

        function easeInOut(t){
            return t < .5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function animate(now){

            const rawProgress = Math.min((now - startTime) / duration, 1);
            const progress = easeInOut(rawProgress);

            trailData.forEach(item => {

                const x1 = item.x1 + (centerX - item.x1) * progress;
                const y1 = item.y1 + (centerY - item.y1) * progress;
                const x2 = item.x2 + (centerX - item.x2) * progress;
                const y2 = item.y2 + (centerY - item.y2) * progress;

                item.line.setAttribute('x1', x1);
                item.line.setAttribute('y1', y1);
                item.line.setAttribute('x2', x2);
                item.line.setAttribute('y2', y2);

                item.line.style.opacity = String(1 - progress * .9);

            });

            if(rawProgress < 1){

                requestAnimationFrame(animate);

            }else{

                if(boardWrap){
                    boardWrap.classList.remove('is-resetting');
                }

                callback();

            }

        }

        requestAnimationFrame(animate);

    }

    function resetExperiment(){

        absorbTrailsToCenter(() => {

            if(boardWrap){
                boardWrap.classList.remove('is-complete', 'is-shifting');
            }

            if(trailLayer){
                trailLayer.innerHTML = '';
            }

            resetEffectInfo();

            buildNodes();
            buildEdges();

            startNodeId = makeNodeId(0, 0);
            checkpointNodeId = startNodeId;
            currentNodeId = startNodeId;

            unlockedRing = 1;
            stepCount = 0;
            isComplete = false;

            routeIndex = 0;
            selectedTrailColor = getRouteColor();
            currentRouteLines = [];

            renderLayerRings();
            renderBaseEdges();
            renderFog();
            renderCells();
            renderPlayer();

            updateCells();
            updateStepDots();
            updateProgress();

            revealEffectInfo('yellow');

        });
    }

    function initBoard(){

        buildNodes();
        buildEdges();

        startNodeId = makeNodeId(0, 0);
        checkpointNodeId = startNodeId;
        currentNodeId = startNodeId;

        renderLayerRings();
        renderBaseEdges();
        renderFog();
        renderCells();
        renderPlayer();

        updateCells();
        updateStepDots();
        updateProgress();

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

    initBoard();

})();
/* ================================= */
/* CARRUSEL ACERCA DEL JUEGO */
/* ================================= */

const slides = document.querySelectorAll('.carousel-slide');

const nextBtn = document.querySelector('.carousel-btn.next');
const prevBtn = document.querySelector('.carousel-btn.prev');

let currentSlide = 0;

function showSlide(index){

    slides.forEach(slide=>{
        slide.classList.remove('active');
    });

    slides[index].classList.add('active');

}

if(nextBtn && prevBtn){

    nextBtn.addEventListener('click',()=>{

        currentSlide++;

        if(currentSlide >= slides.length){

            currentSlide = 0;

        }

        showSlide(currentSlide);

    });

    prevBtn.addEventListener('click',()=>{

        currentSlide--;

        if(currentSlide < 0){

            currentSlide = slides.length - 1;

        }

        showSlide(currentSlide);

    });

}

showSlide(0);

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

const patternColors = {
    yellow:'#FFDD0E',
    blue:'#008FB8',
    green:'#6AAA2C',
    red:'#D62416',
    dots:'#222222',
    bg:'#ECECEC'
};

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
            return drawSmallOctagon(node.x, node.y, 26, patternColors.blue);

        case 'green':
            return drawSmallOctagon(node.x, node.y, 26, patternColors.green);

        case 'yellow':
            return drawSmallOctagon(node.x, node.y, 26, patternColors.yellow);

        case 'red':
            return drawRedStar(node.x, node.y, 24);

        case 'green-large':
            return drawLargeGreenBonus(node.x, node.y, 35);

        case 'yellow-large':
            return drawLargeYellowGoal(node.x, node.y, 35);

        default:
            return drawSmallOctagon(node.x, node.y, 26, patternColors.blue);
    }
}

function getNodeRadius(type){
    if(type === 'red') return 24;
    if(type === 'green-large' || type === 'yellow-large') return 35;
    return 26;
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

    if(dist < 80) return '';

    const ux = dx / dist;
    const uy = dy / dist;

    /*
        Menor margen desde la casilla:
        permite que los 3 puntos respiren mejor.
    */
    const startInset = r1 + 10;
    const endInset = r2 + 10;

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

    return getNodeRadius(node.type) + 28;

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

function getExclusionZones(width, height){

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
            x:rect.left - heroRect.left - 250,
            y:rect.top - heroRect.top - 115,
            w:rect.width + 500,
            h:rect.height + 230
        });

    }

    /*
    Zona protegida de casillas navegables.
    Más amplia para evitar casillas decorativas cerca.
    */
    if(nav){

        const rect = nav.getBoundingClientRect();

        zones.push({
            x:rect.left - heroRect.left - 220,
            y:rect.top - heroRect.top - 150,
            w:rect.width + 440,
            h:rect.height + 300
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

    const routeStep = 170;
    const routeLength = Math.floor(rand(5, 9));

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

    const width = hero.offsetWidth;
    const height = hero.offsetHeight + 220; // extra para que los caminos puedan salir del área visible

    const exclusionZones = getExclusionZones(width, height);

    const graph = {
        nodes:[],
        links:[]
    };

    const targetNodes = Math.min(
        165,
        Math.max(95, Math.floor((width * height) / 12000))
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

    heroPattern.style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,${encodedSvg}")`;
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

if(hero){
    hero.addEventListener('mousemove', updateRevealPosition);
}

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
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const CANVAS_CENTER_X = CANVAS_WIDTH / 2;
const CANVAS_CENTER_Y = CANVAS_HEIGHT / 2;
const IMAGE_ENLARGE = 11;
const Heart_color = "pink"; 

function heartFunction(t, shrinkRatio = IMAGE_ENLARGE) {
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return {
        x: x * shrinkRatio + CANVAS_CENTER_X,
        y: y * shrinkRatio + CANVAS_CENTER_Y
    };
}

function scatterInside(x, y, beta = 0.15) {
    const ratioX = -beta * Math.log(Math.random());
    const ratioY = -beta * Math.log(Math.random());
    const dx = ratioX * (x - CANVAS_CENTER_X);
    const dy = ratioY * (y - CANVAS_CENTER_Y);
    return { x: x - dx, y: y - dy };
}

function shrink(x, y, ratio) {
    const force = -1 / Math.pow(((x - CANVAS_CENTER_X) ** 2 + (y - CANVAS_CENTER_Y) ** 2), 0.6);
    const dx = ratio * force * (x - CANVAS_CENTER_X);
    const dy = ratio * force * (y - CANVAS_CENTER_Y);
    return { x: x - dx, y: y - dy };
}

function curve(p) {
    return 2 * (2 * Math.sin(4 * p)) / (2 * Math.PI);
}

class Heart {
    constructor(generateFrame = 20) {
        this.points = new Set();
        this.edgeDiffusionPoints = new Set();
        this.centerDiffusionPoints = new Set();
        this.allPoints = {};
        this.build(2000);
        this.randomHalo = 1000;
        this.generateFrame = generateFrame;
        for (let frame = 0; frame < generateFrame; frame++) {
            this.calc(frame);
        }
    }

    build(number) {
        for (let i = 0; i < number; i++) {
            const t = Math.random() * 2 * Math.PI;
            const { x, y } = heartFunction(t);
            this.points.add({ x, y });
        }
        for (const point of this.points) {
            for (let i = 0; i < 3; i++) {
                const { x, y } = scatterInside(point.x, point.y, 0.05);
                this.edgeDiffusionPoints.add({ x, y });
            }
        }
        const pointList = Array.from(this.points);
        for (let i = 0; i < 4000; i++) {
            const { x, y } = pointList[Math.floor(Math.random() * pointList.length)];
            const scattered = scatterInside(x, y, 0.17);
            this.centerDiffusionPoints.add(scattered);
        }
    }

    calcPosition(x, y, ratio) {
        const force = 1 / Math.pow(((x - CANVAS_CENTER_X) ** 2 + (y - CANVAS_CENTER_Y) ** 2), 0.52);
        const dx = ratio * force * (x - CANVAS_CENTER_X) + Math.random() * 2 - 1;
        const dy = ratio * force * (y - CANVAS_CENTER_Y) + Math.random() * 2 - 1;
        return { x: x - dx, y: y - dy };
    }

    calc(generateFrame) {
        const ratio = 10 * curve(generateFrame / 10 * Math.PI);
        const haloRadius = Math.floor(4 + 6 * (1 + curve(generateFrame / 10 * Math.PI)));
        const haloNumber = Math.floor(3000 + 4000 * Math.abs(curve(generateFrame / 10 * Math.PI) ** 2));
        const allPoints = [];
        const heartHaloPoint = new Set();
        for (let i = 0; i < haloNumber; i++) {
            const t = Math.random() * 2 * Math.PI;
            let { x, y } = heartFunction(t, 11.6);
            ({ x, y } = shrink(x, y, haloRadius));
            if (!heartHaloPoint.has(`${x},${y}`)) {
                heartHaloPoint.add(`${x},${y}`);
                x += Math.random() * 28 - 14;
                y += Math.random() * 28 - 14;
                const size = Math.random() < 0.5 ? 1 : 2;
                allPoints.push({ x, y, size });
            }
        }
        for (const point of this.points) {
            const { x, y } = this.calcPosition(point.x, point.y, ratio);
            const size = Math.floor(Math.random() * 3) + 1;
            allPoints.push({ x, y, size });
        }
        for (const point of this.edgeDiffusionPoints) {
            const { x, y } = this.calcPosition(point.x, point.y, ratio);
            const size = Math.floor(Math.random() * 2) + 1;
            allPoints.push({ x, y, size });
        }
        for (const point of this.centerDiffusionPoints) {
            const { x, y } = this.calcPosition(point.x, point.y, ratio);
            const size = Math.floor(Math.random() * 2) + 1;
            allPoints.push({ x, y, size });
        }
        this.allPoints[generateFrame] = allPoints;
    }

    render(ctx, renderFrame) {
        for (const point of this.allPoints[renderFrame % this.generateFrame]) {
            ctx.fillStyle = Heart_color;
            ctx.fillRect(point.x, point.y, point.size, point.size);
        }
    }
}

function draw(ctx, heart, renderFrame = 0) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    heart.render(ctx, renderFrame);
    requestAnimationFrame(() => draw(ctx, heart, renderFrame + 1));
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('heartCanvas');
    const ctx = canvas.getContext('2d');
    const heart = new Heart();
    draw(ctx, heart);
});

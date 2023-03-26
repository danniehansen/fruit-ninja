<template>
  <div
    class="wrapper"
    :style="`width:${width}px;height:${height}px;`"
    @mousemove="onMouseMove"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
  >
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script lang="ts">
interface Point {
  x: number;
  y: number;
  health: number;
}

interface GameObjectImage {
  assets: {
    original: HTMLImageElement;
    sliceOne: HTMLCanvasElement;
    sliceTwo: HTMLCanvasElement;
  };
  points: number;
}

interface GameObject {
  x: number;
  y: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
  image: GameObjectImage;
  dead: boolean;
}

import { defineComponent, onBeforeMount, onMounted, ref, watch } from 'vue';
import BombImage from '../../assets/Bomb.png';

export default defineComponent({
  setup() {
    const canvas = ref<HTMLCanvasElement>();
    const width = ref(0);
    const height = ref(0);

    let gameObjects: GameObject[] = [];
    let canvasContext: CanvasRenderingContext2D | null = null;
    let lastKnownTime: number | null = null;
    let frameId = 0;
    let points: Point[] = [];
    let availableImages: GameObjectImage[] = [];
    let timeSinceLast = 0;
    let mouseX = 0;
    let mouseY = 0;
    let mouseDown = false;
    let gameObjectInteractBuffer = 10;
    let score = 0;

    // --- Rendering ---
    const update = (delta: number) => {
      timeSinceLast += delta;

      if (timeSinceLast >= 1750) {
        timeSinceLast = 0;
        spawnGameObject();
      }

      // Game objects
      for (const gameObject of gameObjects) {
        if (
          !gameObject.dead &&
          mouseDown &&
          mouseX >= gameObject.x - gameObjectInteractBuffer &&
          mouseX <=
            gameObject.x +
              gameObject.image.assets.original.width +
              gameObjectInteractBuffer &&
          mouseY >= gameObject.y - gameObjectInteractBuffer &&
          mouseY <=
            gameObject.y +
              gameObject.image.assets.original.height +
              gameObjectInteractBuffer
        ) {
          gameObject.dead = true;
          score += gameObject.image.points;
        }

        gameObject.y += gameObject.velocityY * (delta / 750);
        gameObject.x += gameObject.velocityX * (delta / 750);
        gameObject.rotation += gameObject.velocityZ * (delta / 750);
        gameObject.velocityY += delta / 2;
      }

      gameObjects = gameObjects.filter(
        (gameObject) =>
          !gameObject.dead && gameObject.y <= (canvas.value?.height ?? 0) + 50
      );

      // Slicer
      for (const point of points) {
        point.health -= delta;
      }

      if (mouseDown) {
        points.push({
          x: mouseX,
          y: mouseY,
          health: 100,
        });
      }

      if (points.length > 0) {
        points = points.filter((point) => point.health > 0);
      }
    };

    const render = () => {
      if (!canvasContext || !canvas.value) {
        return;
      }

      canvasContext.fillStyle = '#000';
      canvasContext.fillRect(0, 0, canvas.value.width, canvas.value.height);

      // Game objects
      for (const gameObject of gameObjects) {
        canvasContext.save();
        canvasContext.translate(
          gameObject.x + gameObject.image.assets.original.width / 2,
          gameObject.y + gameObject.image.assets.original.height / 2
        );
        canvasContext.rotate((gameObject.rotation * Math.PI) / 180.0);
        canvasContext.translate(
          -gameObject.x - gameObject.image.assets.original.width / 2,
          -gameObject.y - gameObject.image.assets.original.height / 2
        );
        canvasContext.drawImage(
          gameObject.image.assets.original,
          gameObject.x,
          gameObject.y,
          gameObject.image.assets.original.width,
          gameObject.image.assets.original.height
        );

        canvasContext.restore();

        /* canvasContext.fillStyle = 'rgba(255, 255, 255, 0.6)';
        canvasContext.fillRect(
          gameObject.x - gameObjectInteractBuffer,
          gameObject.y - gameObjectInteractBuffer,
          gameObject.image.original.width + gameObjectInteractBuffer * 2,
          gameObject.image.original.height + gameObjectInteractBuffer * 2
        ); */
      }

      // Slicer
      if (points.length > 1) {
        for (var i = 1, len = points.length; i < len; i++) {
          canvasContext.strokeStyle = '#ffffff';
          canvasContext.beginPath();
          canvasContext.moveTo(points[i - 1].x, points[i - 1].y);

          canvasContext.globalAlpha = points[i].health / 100;

          if (points[i + 1]) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;

            canvasContext.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
          } else {
            canvasContext.quadraticCurveTo(
              points[i].x,
              points[i].y,
              mouseX,
              mouseY
            );
          }

          canvasContext.stroke();
          canvasContext.globalAlpha = 1;
        }
      }

      // Score
      canvasContext.fillStyle = '#fff';
      canvasContext.fillText(`Score: ${score}`, 25, 25);
    };

    const frame = (time: number) => {
      const delta = lastKnownTime === null ? time : time - lastKnownTime;
      lastKnownTime = time;

      frameId = requestAnimationFrame(frame);

      update(delta);
      render();
    };

    const setSize = () => {
      if (canvas.value) {
        canvas.value.width = width.value;
        canvas.value.height = height.value;
      }
    };

    // --- Events ----
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.pageX;
      mouseY = e.pageY;
    };

    const onMouseDown = () => {
      mouseDown = true;
    };

    const onMouseUp = () => {
      mouseDown = false;
    };

    const resize = () => {
      width.value = window.innerWidth;
      height.value = window.innerHeight;
    };

    function getRandomInt(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const spawnGameObject = () => {
      if (!canvas.value) {
        throw new Error('Canvas unavailable');
      }

      const toSpawn =
        availableImages[Math.floor(Math.random() * availableImages.length)];

      const xFrom = 0;
      const xTo = canvas.value.width - toSpawn.assets.original.width;

      const x = getRandomInt(xFrom, xTo);

      gameObjects.push({
        x,
        y: canvas.value.height,
        rotation: getRandomInt(0, 185),
        velocityX:
          canvas.value.width / 2 < x
            ? getRandomInt(0, 175) * -1
            : getRandomInt(0, 175),
        velocityY: getRandomInt(600, 850) * -1,
        velocityZ: getRandomInt(10, 45),
        image: toSpawn,
        dead: false,
      });
    };

    const createSlices = (
      img: HTMLImageElement,
      points: number
    ): GameObjectImage => {
      const sliceOneCanvas = document.createElement('canvas');
      const sliceOneContext = sliceOneCanvas.getContext('2d');

      const sliceTwoCanvas = document.createElement('canvas');
      const sliceTwoContext = sliceOneCanvas.getContext('2d');

      if (!sliceOneContext || !sliceTwoContext) {
        throw new Error('Unable to get slices context');
      }

      // One
      sliceOneCanvas.width = img.width;
      sliceOneCanvas.height = img.height;

      sliceOneContext.moveTo(0, 0);
      sliceOneContext.lineTo(200, 0);
      sliceOneContext.lineTo(0, 200);
      sliceOneContext.clip();

      sliceOneContext.drawImage(img, 0, 0);

      // Two
      sliceTwoCanvas.width = img.width;
      sliceTwoCanvas.height = img.height;

      sliceTwoContext.moveTo(200, 200);
      sliceTwoContext.lineTo(200, 0);
      sliceTwoContext.lineTo(0, 200);
      sliceTwoContext.clip();

      sliceTwoContext.drawImage(img, 0, 0);

      return {
        assets: {
          original: img,
          sliceOne: sliceOneCanvas,
          sliceTwo: sliceTwoCanvas,
        },
        points,
      };
    };

    onMounted(async () => {
      if (canvas.value) {
        resize();

        canvasContext = canvas.value.getContext('2d');

        availableImages = await Promise.all(
          [
            {
              image: BombImage,
              points: 10,
            },
          ].map<Promise<GameObjectImage>>((obj) => {
            return new Promise((resolve) => {
              const img = new Image();

              img.src = obj.image;
              img.onload = () => {
                resolve(createSlices(img, obj.points));
              };
            });
          })
        );

        frameId = requestAnimationFrame(frame);
      }
    });

    onBeforeMount(() => {
      cancelAnimationFrame(frameId);
    });

    watch(width, setSize);
    watch(height, setSize);

    window.addEventListener('resize', resize);

    return { canvas, width, height, onMouseMove, onMouseUp, onMouseDown };
  },
});
</script>

<style lang="scss" scoped>
.wrapper {
  display: block;

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    user-select: none;
  }
}
</style>

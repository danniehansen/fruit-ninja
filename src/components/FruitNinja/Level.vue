<template>
  <Slicer :x="mouseX" :y="mouseY" :interact="mouseDown" />

  <GameObject
    v-for="gameObject in gameObjects"
    :key="gameObject.id"
    :image="gameObject.image"
    :x="gameObject.x"
    :y="gameObject.y"
    :mouseX="mouseX"
    :mouseY="mouseY"
    :mouseDown="mouseDown"
    @dead="($event) => onGameObjectDead(gameObject)"
  />
</template>

<script lang="ts">
import { defineComponent, Raw, ref } from 'vue';
import Canvas from './Canvas.vue';
import DebugFpsCounter from './Debug/DebugFpsCounter.vue';
import Slicer from './Slicer.vue';
import GameObject from './GameObject.vue';
import BombImage from '../../assets/Bomb.png';
import { CanvasApi } from './Types';
import { registerComponent } from './Utils';

interface GameObjectBase {
  image: Raw<HTMLImageElement>;
  points: number;
}

interface GameObjectItem extends GameObjectBase {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  dead: boolean;
}

export default defineComponent({
  components: { Canvas, Slicer, GameObject, DebugFpsCounter },
  props: {
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    mouseX: {
      type: Number,
      required: true,
    },
    mouseY: {
      type: Number,
      required: true,
    },
    mouseDown: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    // GameObjects
    let gameObjectCounter = 0;
    let availableGameObjects: GameObjectBase[] = [];
    const gameObjects = ref<GameObjectItem[]>([]);

    const update = (api: CanvasApi) => {
      if (api.deltaTime === undefined) {
        return;
      }

      for (const gameObject of gameObjects.value) {
        gameObject.y -= (gameObject.velocityY / 100) * api.deltaTime;
        gameObject.velocityY -= api.deltaTime / 20;

        gameObject.x += (gameObject.velocityX / 100) * api.deltaTime;
      }

      if (gameObjects.value.length > 0) {
        gameObjects.value = gameObjects.value.filter(
          (gameObject) => gameObject.y < props.height + 50
        );
      }
    };

    const render = (api: CanvasApi) => {
      if (!api.context) {
        return;
      }
    };

    function getRandomInt(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const onGameObjectDead = (deadGameObject: GameObjectItem) => {
      gameObjects.value = gameObjects.value.filter(
        (gameObject) => gameObject !== deadGameObject
      );

      console.log('onGameObjectDead');
    };

    const spawnObject = () => {
      gameObjectCounter++;

      const objectToSpawn = availableGameObjects[0];

      const x = getRandomInt(0, props.width - objectToSpawn.image.width);

      const maxVelocityY = Math.floor(props.height / 10) / 100;
      const velocityY = maxVelocityY * getRandomInt(75, 100);

      const maxVelocityX = Math.floor(props.width / 90);

      gameObjects.value.push({
        ...availableGameObjects[0],
        id: gameObjectCounter,
        x,
        y: props.height,
        velocityX: x > props.width / 2 ? maxVelocityX * -1 : maxVelocityX,
        velocityY,
        dead: false,
      });
    };

    (async () => {
      availableGameObjects = await Promise.all(
        [
          {
            src: BombImage,
            points: -10,
          },
        ].map((item) => {
          return new Promise<GameObjectBase>((resolve) => {
            const image = new Image();

            image.onload = () => {
              resolve({
                image,
                points: item.points,
              });
            };

            image.src = item.src;
          });
        })
      );

      setInterval(() => {
        spawnObject();
      }, 1250);
    })();

    registerComponent('level', update, render);

    return { gameObjects, onGameObjectDead };
  },
});
</script>

<script lang="ts">
import { defineComponent, getCurrentInstance, onBeforeUnmount } from 'vue';
import { CanvasApi } from './Types';

interface Point {
  x: number;
  y: number;
}

export default defineComponent({
  props: {
    x: {
      type: Number,
      required: true,
    },

    y: {
      type: Number,
      required: true,
    },

    interact: {
      type: Boolean,
      default: false,
    },
  },
  render() {},
  setup(props, context) {
    const instance = getCurrentInstance();
    const pointInteval = 30;
    const decayInterval = 90;

    let points: Point[] = [];
    let timeSinceLastPoint: number | null = null;
    let timeSinceLastDecay: number | null = null;

    function getDistance(x1: number, y1: number, x2: number, y2: number) {
      let y = x2 - x1;
      let x = y2 - y1;

      return Math.sqrt(x * x + y * y);
    }

    const update = (api: CanvasApi) => {
      if (api.deltaTime === undefined) {
        return;
      }

      if (props.interact) {
        const lastPoint = points.length > 0 ? points[points.length - 1] : null;
        const distance = lastPoint
          ? getDistance(props.x, props.y, lastPoint.x, lastPoint.y)
          : null;

        if (
          timeSinceLastPoint === null ||
          ((distance === null || distance > 100) &&
            timeSinceLastPoint + api.deltaTime > pointInteval)
        ) {
          timeSinceLastPoint = 0;

          points.push({
            x: props.x,
            y: props.y,
          });
        } else {
          timeSinceLastPoint += api.deltaTime;
        }
      }

      if (
        timeSinceLastDecay === null ||
        timeSinceLastDecay + api.deltaTime > decayInterval
      ) {
        timeSinceLastDecay = 0;

        points.shift();
      } else {
        timeSinceLastDecay += api.deltaTime;
      }

      if (points.length > 8) {
        points = points
          .reverse()
          .slice(0, 8)
          .reverse();
      }

      if (!props.interact && points.length > 0) {
        points = [];
      }
    };

    const render = (api: CanvasApi) => {
      if (!api.context) {
        return;
      }

      if (props.interact) {
        if (points.length > 1) {
          api.context.strokeStyle = '#ffffff';
          api.context.beginPath();

          let first = true;
          for (const point of points) {
            if (first) {
              first = false;
              api.context.moveTo(point.x, point.y);
            } else {
              api.context.lineTo(point.x, point.y);
            }
          }

          api.context.lineTo(props.x, props.y);

          api.context.stroke();
        }
      }
    };

    const componentId = instance?.parent?.exposed?.register({
      name: 'slicer',
      update,
      render,
    });

    onBeforeUnmount(() => {
      instance?.parent?.exposed?.deregister(componentId);
    });

    return {};
  },
});
</script>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import { CanvasApi } from './Types';
import { registerComponent } from './Utils';

interface Point {
  x: number;
  y: number;
  health: number;
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
  setup(props) {
    let points: Point[] = [];

    const update = (api: CanvasApi) => {
      if (api.deltaTime === undefined) {
        return;
      }

      for (const point of points) {
        point.health -= api.deltaTime;
      }

      if (props.interact) {
        points.push({
          x: props.x,
          y: props.y,
          health: 100,
        });
      }

      if (points.length > 0) {
        points = points.filter((point) => point.health > 0);
      }
    };

    const render = (api: CanvasApi) => {
      if (!api.context) {
        return;
      }

      if (points.length > 1) {
        api.context.strokeStyle = '#ffffff';
        api.context.beginPath();

        api.context.moveTo(points[0].x, points[0].y);

        for (var i = 0, len = points.length; i < len; i++) {
          if (points[i + 1]) {
            var xc = (points[i].x + points[i + 1].x) / 2;
            var yc = (points[i].y + points[i + 1].y) / 2;
            api.context.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
          } else {
            api.context.quadraticCurveTo(
              points[i].x,
              points[i].y,
              props.x,
              props.y
            );
          }
        }

        api.context.stroke();
      }
    };

    registerComponent('slicer', update, render);

    watch(
      () => props.interact,
      (value) => {
        if (value) {
          points = [];
        }
      }
    );

    return {};
  },
});
</script>

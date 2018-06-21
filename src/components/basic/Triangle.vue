<template>
  <div class="cp-triangle" :class="dir" :style="makeStyles"></div>
</template>

<script>
export default {
  props: {
    dir: {
      type: String,
      default: '',
    },
    width: {
      type: Number,
      default: 10,
    },
    height: {
      type: Number,
      default: 8,
    },
    bgcol: {
      type: String,
      default: '#ccc',
    },
  },
  computed: {
    makeStyles() {
      const px2rem = window.lib.flexible.px2rem;
      const w = `${px2rem(this.width)}rem`;
      const w2 = `${px2rem(this.width / 2)}rem`;
      const h = `${px2rem(this.height)}rem`;
      const h2 = `${px2rem(this.height / 2)}rem`;
      const col = this.bgcol;
      const dir = this.dir;
      const obj = {};

      if (dir === 'bottom') {
        obj['border-width'] = `${h} ${w2} 0 ${w2}`;
        obj['border-color'] = `${col} transparent transparent transparent`;
      } else if (dir === 'top') {
        obj['border-width'] = `0 ${w2} ${h} ${w2}`;
        obj['border-color'] = `transparent transparent ${col} transparent`;
      } else if (dir === 'left') {
        obj['border-width'] = `${h2} ${w} ${h2} 0`;
        obj['border-color'] = `transparent ${col} transparent transparent`;
      } else {
        obj['border-width'] = `${h2} 0 ${h2} ${w}`;
        obj['border-color'] = `transparent transparent transparent ${col}`;
      }

      return obj;
    },
  },
};
</script>

<style scoped lang="scss" >
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.cp-triangle {
  width: 0;
  height: 0;
  border-style: solid;
}
</style>

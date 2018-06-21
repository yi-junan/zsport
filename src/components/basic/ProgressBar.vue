<template>
  <div class="cp-progress-bar">
    <div class="progress" :style="{ 'width': `${progress}%` }"></div>
  </div>
</template>

<script>
export default {
  props: {
    progress: {
      type: Number,
      default: 0,
    },
  },
};
</script>

<style scoped lang="scss" >
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.cp-progress-bar {
  background-color: #ededed;
  width: 100%;
}

.progress {
  transition: width 0.2s ease-in-out;
  background-color: $blue;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  color: #fff;
}
</style>

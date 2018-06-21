<template>
  <div class="cp-depart-radios">
    <p class="title">{{ $t("chu_fa_shi_jian") }}:</p>
    <div class="box" @click="onRasios">
      <Radio :data="d" v-for="d in data" :key="`radio-${d.id}`" :ref="`radio-${d.id}`" />
    </div>
  </div>
</template>

<script>
import Radio from '@/components/basic/Radio.vue';
import { LoopEle } from '@/assets/js/util.js';

export default {
  components: {
    Radio,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    onChose: {
      type: Function,
      default: () => {},
    },
    defaultId: {
      type: [String, Number],
      default: '',
    },
  },
  methods: {
    onRasios(e) {
      LoopEle(e, {
        UL: tar => {
          const className = tar.className;
          const id = tar.getAttribute('data-id');

          if (className.indexOf('cp-radio') !== -1) {
            for (let v in this.$refs) {
              if (v.indexOf('radio') !== -1) {
                if (v === `radio-${id}`) {
                  this.$refs[`radio-${id}`][0].onChose();
                } else {
                  this.$refs[v][0].unChose();
                }
              }
            }
            this.onChose(id);
          }
        },

        DIV: 'end',
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (this.defaultId) {
        this.$refs[`radio-${this.defaultId}`][0].onChose();
      }
    });
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.cp-depart-radios {
  width: 100%;
  padding: px2rem(10) px2rem(25);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  color: #999;
  font-size: 14px;
  background-color: #fff;

  .box {
    font-size: 0;
    flex: auto;
    width: 100%;

    /deep/ .cp-radio {
      display: inline-block;
      vertical-align: middle;
      margin-top: 5px;
      margin-bottom: 5px;
      margin-right: 5%;

      @media screen and (min-width: 1601px) {
        margin-right: 69px;
      }

      &:last-child {
        margin-right: 0;
      }
    }
  }

  .title {
    margin-right: px2rem(44);
    white-space: nowrap;
    flex: none;
  }
}
</style>

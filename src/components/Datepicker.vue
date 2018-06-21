<template>
  <input type="text" class="cp-datepicker" :placeholder="placeholder || $t('shi_jian_ri_qi')" />
</template>

<script>
import pikaday from 'pikaday';

export default {
  props: {
    defaultDate: {
      type: [Number, String],
      default: '',
    },
    onSelect: {
      type: Function,
      default: () => {},
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  methods: {
    setDefaultDate() {
      if (this.picker && this.defaultDate) {
        const date = new Date(this.defaultDate);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        this.picker.setDate(`${year}-${month}-${day}`);
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.picker = new pikaday({
        field: this.$el,
        minDate: new Date(),
        i18n: {
          previousMonth: '上一月',
          nextMonth: '下一月',
          months: [
            '1月',
            '2月',
            '3月',
            '4月',
            '5月',
            '6月',
            '7月',
            '8月',
            '9月',
            '10月',
            '11月',
            '12月',
          ],
          weekdays: [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ],
          weekdaysShort: ['日', '一', '二', '三', '四', '五', '六'],
        },
        onSelect: date => {
          this.onSelect(date.getTime(), this.$el);
        },
      });
      this.setDefaultDate();
    });
  },
  beforeDestroy() {
    this.picker.destroy();
  },
};
</script>

<style lang="scss">
@import '../assets/css/color.scss';
@import '~pikaday/scss/pikaday.scss';

.pika-single {
  border: 1px solid #eee;

  .pika-button {
    background-color: #f8f8f8;
    text-align: center;
    color: #888;
  }
  .is-today .pika-button {
    color: $blue;
  }
  .pika-button:hover {
    background-color: $orange;
    color: #fff;
  }
  .is-selected .pika-button {
    color: #fff;
    background-color: $blue;
  }
  .pika-table abbr {
    text-decoration: none;
    cursor: default;
    color: #bbb;
  }
}
</style>

<style scoped lang="scss">
@import '../assets/css/util.scss';

.cp-datepicker {
  cursor: pointer;
  font-size: 12px;
  padding-left: px2rem(11);
  padding-right: px2rem(11);
  box-sizing: border-box;
  border: none;
  border-radius: 4px;
  background-color: #f8f8f8;

  &:focus {
    outline: none;
  }
  &::placeholder {
    color: #ccc;
  }
}
</style>

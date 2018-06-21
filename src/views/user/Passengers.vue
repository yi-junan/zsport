<template>
  <div class="p-passengers">
    <div class="wrap">
      <div class="head">{{ $t('cheng_ke_ming_dan') }}</div>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>{{ $t('xing_ming') }}</th>
              <th>{{ $t('cheng_ke_lei_xing') }}</th>
              <th>{{ $t('zheng_jian_lei_xing') }}</th>
              <th>{{ $t('zheng_jian_hao_ma') }}</th>
              <th>{{ $t('cao_zuo') }}</th>
            </tr>
          </thead>
          <tbody @click="onTable">
            <tr v-for="p in passengers" :key="`passenger${p.id}`">
              <td>{{ p.name }}</td>
              <td>{{ getPassengerById(p.passengerType).name || '-' }}</td>
              <td>{{ getCTypeById(p.credentialType).name || '-' }}</td>
              <td>{{ getSecretStr(p.credentialNumber) }}</td>
              <td>
                <Button :text="$t('xiu_gai')" type="no-border" data-type="udpate" :data-id="p.id" />
                <Button :text="$t('shan_chu')" type="no-border" data-type="delete" :data-id="p.id" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="add-btn" @click="openAddPassenger()">
        <Button>
          <span>{{ $t('tian_jia_cheng_ke') }}</span>
          <Icon name="zengjia" />
        </Button>
      </div>
      <div class="loading" v-show="loading">
        <loading :width="50" :height="50" />
      </div>
    </div>

    <!-- 添加乘客窗口 -->
    <AddPassenger ref="addPassenger" :passenger="passenger" />
  </div>
</template>

<script>
import Icon from '@/components/basic/Icon.vue';
import Button from '@/components/basic/Button.vue';
import { LoopEle, getSecretStr, noti } from '@/assets/js/util.js';
import { mapState } from 'vuex';
import Loading from '@/components/basic/Loading.vue';
import model from '@/assets/js/axios';
import api from '@/assets/js/api.js';
import AddPassenger from './AddPassenger.vue';

export default {
  name: 'Passengers',
  components: {
    Icon,
    Button,
    AddPassenger,
    Loading,
  },

  data() {
    return {
      // 当前选中的乘客
      passenger: {
        id: '',
        name: '',
        passengerType: '',
        credentialType: '',
        credentialNumber: '',
        gender: '',
        birthday: '',
      },
      loading: false,
    };
  },
  computed: {
    ...mapState({
      lang: state => state.status.lang,
      passengers: state => state.passenger.passengers,
    }),
  },
  methods: {
    // 打开添加乘客窗口
    openAddPassenger(argData) {
      this.$refs.addPassenger.onToggle(argData);
    },

    // 删除乘客信息
    async deletePassenger(argId) {
      this.loading = true;
      try {
        await model.delete(api.delPassenger, { id: argId });
      } catch (e) {
        noti(e.error || this.$i18n.t('tips.pageUserPassenger[3]'));
        this.loading = false;
        return;
      }

      this.$store.dispatch('delPassenger', argId);
      this.loading = false;
    },

    // 根据id获取对应的证件类型
    getCTypeById(argId) {
      const msg = this.$store.getters.getCredentialType(argId);
      return msg || {};
    },

    // 根据id获取对应的乘客类型
    getPassengerById(argId) {
      const msg = this.$store.getters.getPassengerType(argId);
      return msg || {};
    },

    // 加密字符串
    getSecretStr(argStr) {
      return getSecretStr(argStr);
    },

    // 点中表格某一项
    onTable(e) {
      LoopEle(e, {
        BUTTON: tar => {
          const id = tar.getAttribute('data-id');
          const type = tar.getAttribute('data-type');
          const passenger = this.$store.getters.getPassengerById(id);

          if (type === 'udpate' && passenger) {
            this.openAddPassenger(passenger);
          } else if (type === 'delete') {
            this.deletePassenger(id);
          }
        },
        TABLE: 'end',
      });
    },
  },
  async created() {
    this.loading = true;
    await this.$store.dispatch('initPassenger');
    this.loading = false;
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/css/color.scss';
@import '../../assets/css/util.scss';

.p-passengers {
  width: 100%;
  height: 100%;
  padding-bottom: px2rem(30);
  box-sizing: border-box;
  background-color: #fff;

  .wrap {
    width: 100%;
    height: 100%;
    position: relative;
  }
}

.head {
  padding: px2rem(30) 0 px2rem(19) px2rem(32);
  border-bottom: 1px solid #ddd;
  @include fontSizeRespond(26);
}

.table-wrap {
  width: 100%;
  padding: px2rem(30);
  box-sizing: border-box;
}

.table {
  width: 100%;
  border: 1px solid #eee;
  border-top: px2rem(8) solid $blue;
  text-align: left;

  th {
    padding: px2rem(20) px2rem(10);
    border-bottom: 1px solid #eee;
    color: #333;
    @include fontSizeRespond(16);
    box-sizing: border-box;
    white-space: nowrap;

    &:first-child {
      width: 20%;
      padding-left: px2rem(30);
    }
    &:nth-child(2) {
      width: 18%;
    }
    &:nth-child(3) {
      width: 18%;
    }
    &:last-child {
      width: 15%;
      text-align: center;
    }
  }
  td {
    padding: px2rem(20) px2rem(10);
    font-size: 14px;
    color: #999;
    vertical-align: middle;
    line-height: 1.2;
    white-space: nowrap;

    &:first-child {
      padding-left: px2rem(30);
      white-space: normal;
      word-break: break-all;
    }
    &:nth-child(4) {
      white-space: normal;
      word-break: break-all;
    }
    &:last-child {
      text-align: center;
    }
  }
  /deep/ .cp-btn {
    display: inline-block;
    vertical-align: middle;
    padding: px2rem(5) px2rem(10);
    min-width: 0;
  }
}

.add-btn {
  padding-left: px2rem(30);

  /deep/ .cp-btn {
    height: 100%;
    width: px2rem(150);
    height: px2rem(50);
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      margin-right: px2rem(8);
    }
  }
}
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.5);
}
</style>

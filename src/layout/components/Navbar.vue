<template>
  <div class="navbar">
    <hamburger
      id="hamburger-container"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <search id="header-search" class="right-menu-item" />

        <error-log class="errLog-container right-menu-item hover-effect" />

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip content="Global Size" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>

      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <!--          <img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar">-->
          <svg-icon icon-class="squirrel" class-name="user-avatar" />
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <!--          <router-link to="/profile/index">-->
          <!--            <el-dropdown-item>Profile</el-dropdown-item>-->
          <!--          </router-link>-->
          <!--          <router-link to="/">-->
          <!--            <el-dropdown-item>Dashboard</el-dropdown-item>-->
          <!--          </router-link>-->
          <!--          <a target="_blank" href="https://github.com/PanJiaChen/vue-element-admin/">-->
          <!--            <el-dropdown-item>Github</el-dropdown-item>-->
          <!--          </a>-->
          <!--          <a target="_blank" href="https://panjiachen.github.io/vue-element-admin-site/#/">-->
          <!--            <el-dropdown-item>Docs</el-dropdown-item>-->
          <!--          </a>-->
          <!--          <el-dropdown-item divided @click.native="logout">-->
          <!--            <span style="display:block;">Log Out</span>-->
          <!--          </el-dropdown-item>-->
          <el-dropdown-item v-if="$i18n.locale !== 'en'" @click.native="handleChangeLang('en')">
            <span style="display:block;">English</span>
          </el-dropdown-item>
          <el-dropdown-item v-if="$i18n.locale !== 'zh'" @click.native="handleChangeLang('zh')">
            <span style="display:block;">中文</span>
          </el-dropdown-item>
          <el-dropdown-item @click.native="handleChangePassword()">
            <span style="display:block;">{{ $t('system.changePassword.title') }}</span>
          </el-dropdown-item>
          <el-dropdown-item @click.native="logout">
            <span style="display:block;">{{ $t('system.logout') }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <!-- 新增修改彈跳視窗 -->
    <el-dialog
      v-if="passwordDialog.isVisible"
      :title="$t('system.changePassword.title')"
      :visible.sync="passwordDialog.isVisible"
      :close-on-click-modal="false"
      :show-close="true"
      width="80%"
    >
      <div class="dialog-main">
        <el-form
          ref="dataForm"
          :rules="passwordDialog.rules"
          :model="passwordDialog.data"
          label-position="left"
          label-width="200px"
        >
          <el-form-item :label="$t('system.changePassword.oldPassword')" prop="OldPassword">
            <bs-input
              v-model="passwordDialog.data.OldPassword"
              type="password"
              :placeholder="$t('system.changePassword.oldPasswordPlaceHolder')"
            />
          </el-form-item>
          <el-form-item :label="$t('system.changePassword.newPassword')" prop="NewPassword">
            <bs-input
              v-model="passwordDialog.data.NewPassword"
              type="password"
              :placeholder="$t('system.changePassword.newPasswordPlaceHolder')"
            />
          </el-form-item>
          <el-form-item :label="$t('system.changePassword.confirmPassword')" prop="ConfirmPassword">
            <bs-input
              v-model="passwordDialog.data.ConfirmPassword"
              type="password"
              :placeholder="$t('system.changePassword.confirmPasswordPlaceHolder')"
            />
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <bs-submit-button @click="updatePassword" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import ErrorLog from '@/components/ErrorLog'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import Cookies from 'js-cookie'
import { Rules } from '@/definitions/fieldCheck'
import { changePassword } from '@/api/user'
import { deepClone } from '@/utils'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    ErrorLog,
    Screenfull,
    SizeSelect,
    Search
  },
  data() {
    return {
      passwordDialog: {
        isVisible: false,
        rules: {
          OldPassword: [...Rules.password, ...Rules.requiredBlur],
          NewPassword: [...Rules.password, ...Rules.requiredBlur],
          ConfirmPassword: [...Rules.password, ...Rules.requiredBlur]
        },
        defaultData: {
          OldPassword: '',
          NewPassword: '',
          ConfirmPassword: ''
        },
        data: {
          OldPassword: '',
          NewPassword: '',
          ConfirmPassword: ''
        }
      }
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'device'
    ])
  },
  methods: {
    handleChangeLang(lang) {
      Cookies.set('language', lang)
      location.reload()
      // this.$i18n.locale = lang
    },
    handleChangePassword() {
      this.passwordDialog.isVisible = true
      this.passwordDialog.data = deepClone(this.passwordDialog.defaultData)
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/resetToken')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    async updatePassword() {
      changePassword(this.passwordDialog.data).then(response => {
        this.passwordDialog.isVisible = false
        this.$message({ message: this.$t('system.changePassword.success'), type: 'success' })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, .08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>

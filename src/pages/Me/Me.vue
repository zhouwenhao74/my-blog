<template>
    <div class="container">
        <div class="userinfo" @click='login'>
            <img :src="userinfo.avatarUrl" alt="">
            <p>{{userinfo.nickName}}</p>
        </div>
        <YearProgress></YearProgress>
        <ul class="tab">
            <li class="tab-item">
                <span class="tab-link">Web:zhouwenhao747.coding.me/FlowersToFold</span>
            </li>
            <li class="tab-item">
                <span class="tab-link">QQ:547366823</span>
            </li>
            <li class="tab-item">
                <span class="tab-link">微博:@周文昊</span>
            </li>
            <li class="tab-item">
                <span class="tab-link">十年树人，百年树袋熊</span>
            </li>
        </ul>
    </div>
</template>

<script>
import YearProgress from '@/components/YearProgress'
export default {
    components: {
    YearProgress
  },
  data () {
    return {
      userinfo: {
        avatarUrl: '../../../static/img/unlogin.png',
        nickName: '点击登录'
      }
    }
  }
}
</script>

<style lang='scss'>
.container{
  padding:0 30rpx;

} 
.userinfo{
  margin-top:100rpx;
  text-align:center;
  img{
    width: 150rpx;
    height:150rpx;
    margin: 20rpx;
    border-radius: 50%;
  }
}
.tab .tab-item {
        height: 40px;
        line-height: 40px;
        text-align: center;
        list-style: none;
    }
.tab-link {
        padding: 10px;
        color: #9caebf;
        font-size: 14px;
        font-weight: 600;
    }
</style>
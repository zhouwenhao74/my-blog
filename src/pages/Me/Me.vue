<template>
    <div class="container">
        <div class="userinfo">
            <open-data class="userinfo-avatar" type="userAvatarUrl"></open-data>
            <open-data class="userinfo-name" type="userNickName"></open-data>
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
import {share}  from '@/utils/share'
export default {
    onShareAppMessage(){
        return share();
    },
    components: {
    YearProgress
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
  display: flex;  
  flex-direction: column;  
  align-items: center;  
}
.userinfo-avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  margin-top: 40rpx;
  display: block;
  overflow: hidden;
}
.userinfo-name {
    margin-top: 10rpx;
    color: #9caebf;
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
<template>
    <div :class="['chapter-page', {nightMode: isNightMode}]">
    <rich-text class="chapter-content" @click="onPageClick" :nodes="chapterDetailsConver" :style="{fontSize: chapterFontSize + 'px'}"/>
    <div class="turnPage" v-show="chapterDetailsConver">
      <!-- <div class="button last" @click="gotoTargeChapter(currentPageIndex - 1)" v-if="currentPageIndex > 0">上一章</div>
      <div class="button next" @click="gotoTargeChapter(currentPageIndex + 1)" v-if="currentPageIndex < chaptersSectionCount - 1">下一章</div> -->
    </div>
    <!-- 底部菜单 -->
    <div :class="['chapter-footbar', { show: showFooterBar }]">
      <ul>
        <li @click="toggleNightOrDay">
          <i class="iconfont icon-sun1" v-if="isNightMode"></i>
          <i class="iconfont icon-moon" v-else></i>
          <span>{{isNightMode? "白天" : "夜间"}}</span>
        </li>
        <li @click="toggleSettingPanel">
          <i class="iconfont icon-setting"></i>
          <span>设置</span>
        </li>
        <li @click="toggleCategoryList">
          <i class="iconfont icon-menu"></i>
          <span>目录</span>
        </li>
      </ul>
      <!-- 设置面板 -->
      <div class="setting-panel" v-show="showFooterBar && showSettingPanel">
        <!-- 亮度调节面板 -->
        <div class="lightness setting-panel-normal">
          <i class="iconfont icon-sun"></i>
          <slider min="0" max="1" :value="lightness" step="0.05" color="#f5f5f5" activeColor="#4393e2" block-size="14" @changing="changeLightNess" @change="changeLightNess"/>
          <div >
            <span style="margin-right: 10px;">常亮</span>
            <switch type="checkbox" :checked="isKeepLight" @change="toggleScreenLight"></switch>
          </div>
        </div>
        <!-- 字体大小调节面板 -->
        <div class="font-size setting-panel-normal">
          <i class="iconfont icon-ziti"></i>
          <slider min="12" max="30" :value="chapterFontSize" step="1" color="#f5f5f5" activeColor="#4393e2" block-size="14" @change="changeFontSize"/>
        </div>
      </div>
    </div>
    <!-- 目录 -->
    <section :class="['chapter-picker', { showDirectory }]" @click="toggleCategoryList">
      <header @click.stop>
        <h3>目录(共{{titles.length}}章)</h3>
        <picker :range="chapterSectionArray" >
          <span class="picker">{{chapterSectionArray[currentChapterSectionIndex]}} <i class="iconfont icon-dropDown"></i></span>
        </picker>
      </header>
      <ul @click.stop>
        <li
          :key="item.title"
          v-for="(item, index) in titles"
          @click="getDetail(index+1)"
        >{{item.title}}</li>      
      </ul>
      <button>关闭</button>
    </section>
  </div>
</template>

<script>
import qcloud from 'wafer2-client-sdk'
import {showSuccess, post} from '@/util'
import config from '@/config'
import { CHAPTER_FONT_SIZE, SCREEN_IS_LIGHT, CHAPTER_SECTION_COUNT } from '@/utils/constants';
import {get, showModal} from '@/util'

// 临时变量,书源
let _currentSource = null;
// 临时变量,保存页面onHide之前的数据，与onShow之后做对比，如果一直就不重新获取
let _lastChapter = null;
// 保存章节数据，不放在data中，防止数据过大，造成卡顿
let _chapterListData = {
  chapters: []
};
// 保存章节分段数据
let _chaptersSection = [];

export default {
    data() {
    return {
    //   CHAPTER_SECTION_COUNT,  
      fromOtherPlace: false, // 是否从其他地方跳转过来
      showDirectory: false, // 是否展示目录
      showFooterBar: false, // 是否展示底部菜单
      isNightMode: false, // 是否是夜间模式
      currentPageIndex: 0, // 当前查看第几章
      bookInBookCase: null, // 书籍对应的书架的内容
      lightness: 0, // 亮度
      showSettingPanel: false, // 是否展示设置面板
      chapterFontSize: 14, // 默认字体大小
      isKeepLight: false, // 屏幕是否保持常亮
      currentChapterSectionIndex: 0, // 当前处在章节分段第几段
      chapterListDataId: 0, // 章节ID
      chaptersSectionCount: 0, // 章节数量
      currentChapterSection: [], // 当前查看的章节段落
      chapteDetail: [],
      text:"hello world",
      bookid : 1,
      info:[],
      titles:[]
    };
  },
  onPageScroll: function (e) {
    console.log(e)
  },
  mounted () {
      this.getDetail(this.bookid)
      this.getTitle()
  },
  watch: {
      showFooterBar(value) {
      if (!value) {
        this.showSettingPanel = false;
      }
    }
  },
  methods: {
    async getDetail(index) {
      const info = await get('/weapp/deom', {id: index})
      this.info = info
      this.showDirectory = false
      this.showFooterBar = false
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0
      })

    },
    async getTitle() {
      const titles = await get('/weapp/novelList',{})
      this.titles = titles
    },
    toggleCategoryList() {
      this.showDirectory = !this.showDirectory;
    },
    // 切换夜间/白天模式
    toggleNightOrDay() {
      this.isNightMode = !this.isNightMode;
    },
    // 切换设置面板
    toggleSettingPanel() {
      this.showSettingPanel = !this.showSettingPanel;
    },
    onPageClick() {
      // 切换底部显示
      this.showFooterBar = !this.showFooterBar;
    },
    changeLightNess(e) {
      const { value } = e.target;
      if (typeof value === 'number') {
        this.lightness = value;
        wx.setScreenBrightness({ value });
      }
    },
    // 改变字体大小
    changeFontSize(e) {
      const { value } = e.target;
      if (typeof value === 'number') {
        this.chapterFontSize = value;
        wx.setStorage({
          key: CHAPTER_FONT_SIZE,
          data: value
        });
      }
    },
    // 保持屏幕常亮
    toggleScreenLight(e) {
      const { value } = e.target;
      this.isKeepLight = value;
      wx.setStorage({
        key: SCREEN_IS_LIGHT,
        data: value
      });
    }

  },
  computed: {
    chapterSectionArray() {
      const totalArrayCount = Math.ceil(690 / CHAPTER_SECTION_COUNT);
      return Array.from({ length: totalArrayCount }).map((section, index) => `${(index * CHAPTER_SECTION_COUNT) + 1} - ${Math.min((index + 1) * CHAPTER_SECTION_COUNT, this.chaptersSectionCount)}`);
    },
    chapterDetailsConver() {
      try {
        // 暂时想不到其他法子，先把\n|\r转成<p>标签
        return this.info[0].detail
    } catch (e) {
        return '';
      }
    }
  },
}
</script>

<style lang="scss">
$primaryColor: #4393e2;
.chapter-page{
  background-color: #EFE6DF;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  // overflow: auto;
  font-size: 14px;
  .changeSourceButton{
    position: absolute;
    left: 50%;
    top: 50%;
    width: auto;
    transform: translate(-50%, -50%);
    padding: 2px 20px;
    color: #fff;
    background-color: $primaryColor;
    font-size: 14px;
  }
}
.chapter-content{
  padding: 15px 15px 0;
  line-height: 1.75;
  text-indent: 2em;
  min-height: 80vh;
  color: #333;
  width: 100%;
  box-sizing: border-box;
  display:block;
  word-wrap: break-word;
}
// 翻页按钮
.turnPage{
  padding: 30px 15px 20px;
  display: flex;
  justify-content: space-between;
  .button{
    background-color: transparent;
    flex: 1;
    border-radius: 30px;
    border: 1px solid #999;
    color: #666;
    outline: none;
    font-size: 14px;
    text-align: center;
    padding: 6px 0;
    &.next{
      flex: 1.8;
      margin-left: 20px;
    }
  }
}
// 底部菜单
.chapter-footbar{
  position: fixed;
  bottom: 0;
  left: 0;
  right:0;
  background-color: #333;
  color: #fff;
  transition: transform .3s ease;
  transform: translateY(100%);
  &.show{
    transform: translateY(0);
  }
  > ul {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 100;
    padding-top: 5px;
  }
  li {
    flex: 1;
    text-align: center;
    padding: 8px 0;
    .iconfont{
      margin-bottom: 5px;
    }
  }
}
// 设置面板
.setting-panel{
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background-color: #333;
  padding: 1px 20px;
  border-bottom: 1px solid #4e4e4e;
  .setting-panel-normal{
    padding: 5px 0;
    display: flex;
    align-items: center;
    slider{
      flex: 1;
    }
    &.lightness>div{
      display: inline-flex;
      align-items: center;
    }
  }
}
// 目录
.chapter-picker{
  color: #333;
  position: fixed;
  left:0;
  right:0;
  bottom:0;
  top: 0;
  background: #fff;
  overflow: auto;
  transform: translate3d(-100%, 0, 0);
  transition: transform .3s ease;
  display: flex;
  flex-direction: column;
  header {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    box-shadow: 0 0 10px rgba(#333, .375);
    .picker{
      display: inline-flex;
      align-items: center;
    }
    .icon-dropDown{
      font-size: 12px;
      margin-left: 5px;
    }
  }
  &> ul{
    flex: 1;
    overflow: auto;
    li {
      padding: 10px 20px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      &.active{
        color: #fff;
        background-color: rgba($primaryColor, .75);
      }
    }
  }
  &.showDirectory{
    transform: translate3d(0, 0, 0);
  }
  > button{
    width: 100%;
    background-color: $primaryColor;
    outline: none;
    border-radius: 0;
    border: 0;
    font-size: 14px;
    color: #fff;
    padding: 5px 0;
    box-shadow: 0 0 10px rgba($primaryColor, .375);
  }
}
// 主题调整
.chapter-page{
  // 夜间模式
  &.nightMode{
    background: #333;
		.chapter-content{
			color: #777;
		}
    .chapter-picker{
      background: #333;
      header,
      > ul {
        color: #666;
      }
      li.active{
        color: $primaryColor;
        background-color: transparent;
      }
    }
  }
}
</style>

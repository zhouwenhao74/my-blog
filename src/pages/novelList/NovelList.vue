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
        <h3>目录(共{{1}}章)</h3>
        <picker :range="chapterSectionArray" >
          <span class="picker">{{chapterSectionArray[currentChapterSectionIndex]}} <i class="iconfont icon-dropDown"></i></span>
        </picker>
      </header>
      <ul @click.stop>
        <li>{{"第一章 唐家村"}}</li>
      </ul>
      <button>关闭</button>
    </section>
  </div>
</template>

<script>
import { CHAPTER_FONT_SIZE, SCREEN_IS_LIGHT, CHAPTER_SECTION_COUNT } from '@/utils/constants';

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
      text:"hello world",
    };
  },
  watch: {
      showFooterBar(value) {
      if (!value) {
        this.showSettingPanel = false;
      }
    }
  },
  methods: {
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
        return '七月盛夏的蜀中，天气已经热的让人有些烦躁，唐门弟子敞着大胸，在唐门外巡逻着。当然，唐门是不允许衣冠不整的人进入唐门的，但是现在已经是深夜，而且这几名巡夜的弟子又在唐门外，这样一个没有一丝风的酷热的夜晚，也就没有人再去在意这些了。<p>在这个季节，相比于中午的巡逻，巡夜其实是一件比较幸福的事情，毕竟夜晚比中午可是凉爽了不少，唐门为了应付这种炎热的天气，把一天两轮的巡防改成了一天三轮，每一轮都是四个时辰，此时正值亥时，是一天中最后一次换防的时候。<p>“辛苦兄弟们了。”来换防的弟子打了一个哈欠说道，倒不是说他没有好好的休息，而是白天天太热，实在是睡不好。<p>“今天应该没啥事情了。”被换防的弟子指了一指天上的月亮说道，“月黑风高夜，才是杀人越货的最佳时机，今天月光这么亮，估计也是一个安稳夜。”<p>换防弟子笑了一声说道，“哪天不是安稳夜呢，如今世道太平，哪有这么多事情，这不，原来巡夜的可有二三十人，现在都只剩八九人了。”<p>“这天实在太热了，我们回去得喝上两杯再去睡觉。”唐门倒是没有什么禁酒令，只要不是在自己巡逻的时候，喝上两杯并不算什么事，当然，是玩不能喝醉的。“哥哥我倒是挺羡慕你们晚上巡逻的，多凉爽啊。”<p>“凉爽是凉爽，但是晚上人都遇不到几个，可无聊着呢。”换防弟子拍了一下对方的肩膀笑道，“记得留两口酒给我们。”<p>“好好好，接下来就靠你们了。”巡逻的人把巡逻令牌交给了换防的人。<p>交付完令牌，巡逻之人没走几步，天空就划过了一道火光，然后又是一道，没多久，不远处的黑夜便被映成了一片红色。几个弟子看着火光有些愣神，这是什么情况？<p>“不好，那个方向是唐家村，唐家村走水了。”最先反应过来的是一个比较年长的弟子，“你，去通知掌门，你去通知其他弟子，其余的人跟着我立马赶过去救火。看样子火势还不小。”他简单的吩咐了一下其他弟子，立马赶去了唐家村。<p>越来越多的弟子发现这个情况，纷纷拿起身边能装水的家伙，赶去了唐家村。<p>唐家村，北面靠着唐门，西南面靠着十二连环坞，东南面靠着沐云庄，虽然这个村庄只有八十多口人，确是唐门以及十二连环坞，沐云庄粮食的主要来源。尤其对于唐门来说，这个村庄有半数以上都是唐门的下山弟子。唐门和其他门派不同，对于一些厌倦了江湖纷争的弟子，只要不违背唐门的门规，唐门是允许他们下山过平静生活的，当然，即便是你下了山，依旧也得遵守唐门门规，但这比起其他门派下山得废除武功啥的要好太多了。所以，很多弟子即便是下山了，也会呆在离唐门不远的村庄，这样，如果唐门有遇到什么大事，他们也来得及赶回来，虽然下了山，但他们对于唐门的感情，确是没那么容易放下的。<p>唐门掌门唐文翔在接到弟子的通报后，一开始还没觉得是什么大事，炎热的夏天，走个水也不算什么大事，唐家村好歹有这么些个唐门下山弟子，想来能很快就能扑灭。但是当他走出房间的一霎那，瞧见那一片红色的天空，就知道，这件事没那么简单，他立马跑去了马厩，骑着一匹马就赶了过去。<p>唐家村是不可能着这么一大片的，因为村里就有一条小河，哪怕哪家走了水，发现的晚了，那也有足够的时间和人力扑灭，这么大的火，只有一种可能，有人故意放火。这么久过去了，火势没有丝毫的减弱，使得唐文翔担忧不以，到底发生了什么？<p>急马飞驰，唐文翔以最快的速度赶到了唐家村，刚到村口，便被眼前的景象所震惊到，所有的房屋都已经被点燃了，从烧毁的程度看，应该是同时起火的。<p>“掌门，”唐文翔刚下马，唐门弟子唐醉就前来向他禀报，“我们已经搜寻了一圈，找到了八十一具尸体，还没有发现活口。”说完，他就底下了头。<p>唐文翔的脸色非常难看，甚至有些失神，他所担忧的事情，终于还是发生了，难道才平静了没多久的武林，不，是整个江湖，又将要掀起一场腥风血雨了？八十一口人，有一半还是唐门的下山弟子，到底谁有这能耐，能在悄无声息的情况下干掉他们？<p>唐醉似乎看出了唐文翔的疑虑，说道，“从伤痕来看，是十二连环坞的招式。”<p>一句话，把唐文翔从思虑中拉了回来，“你刚才说找到了多少尸体？”<p>“目前发现八十一具，”唐醉指了指河边，“尸体都在那边，我刚才已经清点过了。”<p>“我记得唐家村不止八十一口人，”唐文翔看了一眼排成一排的尸体说道，“唐家村的人口唐门是有记录的，你立马派人回唐门找到记录，然后一一对照，吩咐下去，救火的同时不要停止搜救，如果还有人幸存，那么多少会知道这到底是怎么回事。”<p>“是！弟子遵命！”唐醉在收到唐文翔指令后，立马去安排了。<p>唐醉走后，唐文翔仔细的查看了一下尸体，的确是十二连环坞的招式，而且还很流畅，但是十二连环坞哪会有这种能耐？他们要不是仗着有水上的天然屏障，光唐家村的这些弟子，就足以把他们全部歼灭了，这栽赃，未免有些儿戏了吧。<p>“唐掌门，这，是发生了何事？”不远处，陆续来了两拨人马，走在前面的一个约莫四十多岁的人问道，此时便是南宫世家的大当家——南宫傲天，旁边并行的一个年龄相仿的人，便是沐云庄庄主庄韦贤了。<p>“傲天兄，庄庄主，你们也赶来了啊。”唐文翔指了指河边的尸体说道，“唐家村，怕是被人给屠村了。”<p>“什么？！”南宫傲天和庄韦贤一脸的难以置信，他们知道，这个村庄，大部分都是唐门的下山弟子，“唐家村世代居住于此，也并没有招惹过其他人，谁会下此毒手？我之前还只是以为天干地燥，不小心走水了，看火势严重，才跟着过来看下情况。”庄韦贤说道。<p>“十二连环坞？”南宫傲天看了一眼尸体，问道，他虽然不相信这是十二连环坞干的，但还是不禁问出了口。<p>“恐怕不是。”唐文翔呆呆的望着这片尸体，过了半晌，才继续说道，“事关重大，你们俩且随我回唐门，有件事，怕是瞒不住了，我得先告诉你们。”<p>南宫傲天和庄韦贤点了一下头，他们知道，能这么悄无声息的杀掉这么多人，还有半数唐门弟子，那绝对不是一般的事情。光说这战斗力，就不是他们所能抵挡的。如果这事发生在自己庄上，怕是自己也无力抵挡吧。'
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
  height: 100vh;
  box-sizing: border-box;
  position: relative;
  overflow: auto;
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

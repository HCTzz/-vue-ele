<template>
  <div class="main">
      <div class="header">
        <div class="operate">
          <span title="后退" :class="[arrowDsiabled ? 'disabled' : '','el-icon-arrow-left']"></span>
          <span title="前进" :class="[!arrowDsiabled ? 'disabled' : '','el-icon-arrow-right']"></span>
          <span title="刷新" class="el-icon-refresh"></span>
        </div>
        <div class="separate"></div>
        <div class="path">
          <span v-html="currentPath.join(' ')"></span>
        </div>
        <div class="separate"></div> 
        <div class="search">
            <el-input class="input"
              size="mini"
              type="text"
              placeholder="搜索磁盘文件"
              clearable
              suffix-icon="el-icon-search"
              v-model="searchFileName"
              >
            </el-input>
        </div>
      </div>
      <div class='content'>
        <el-row :gutter="20">
          <el-col :span="4" v-for="file in fileList" :key="file.fileKey">
            <div class="">
              <i :class="file.icon"></i>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="footer"></div>
  </div>
</template>

<script>
import { log } from 'util';

export default {
  data() {
    return {
        arrowDsiabled:false,
        arrow:'<i class="el-icon-arrow-right"></i>',
        currentPath:['<span>/</span>','<i class="el-icon-arrow-right"></i>'],
        currenLevel:1,
        currentPid:'',
        searchFileName:'',
        fileList:[],
    };
  },
  mounted: function() {
    for(let i = 0;i < 25;i ++){
      this.fileList.push({
          fileLevel:1,
          fileName:'文档' + i,
          fileKey:i,
          ended:i % 2 == 0 ? true:false,
          icon:'el-icon-folder',
        })
    }
  },
  methods: {
  }
};
</script>
<style lang="scss">
.el-input__inner{
    padding-left: 0px ; 
    padding-right: 10px ; 
    border: none ; 
    width: 220px ;
}
.search i{
  font-size: 16px;
}
</style>
<style lang="scss" scoped>
.main {
  position: relative;
  padding:0px 10px;
  color: #666;
  .header{
    font-size: 18px;
    height: 45px;
    line-height: 45px;
    width: 100%;
    border-bottom: 1px solid #ccc;
    > div{
      display: inline-block;
      vertical-align: middle;
    };
    .operate{
      margin-left:8px;
      span{
        cursor: pointer;
      };
      span:last-child{
        margin-left: 16px;
      };
      span.disabled{
        color: #bbb
      }
    };
    .search{
      div{
        
      }
    };
    .path{
      width: 70%;
      width: -moz-calc(100% - 460px);
      width: -webkit-calc(100% - 460px);
      width: calc(100% - 460px);
      margin-left: 10px;
      span{
        i.el-icon-arrow-right{
          font-size: 14px;
        }
      }
    };
    .separate{
      border-left: 1px solid #ccc;
      height: 20px;
      vertical-align: middle;
      margin-left: 20px;
      margin-right: 10px;
    };
  };
  .content{
    div{
      height: 160px;
    }
  }
}
</style>

<template>
  <div class="main">
    <div class="header">
      <div class="search">
        <el-input 
          v-model="listQuery.searchFileName"
          class="input"
          size="mini"
          type="text"
          placeholder="搜索视频"
          clearable
          @keyup.enter.native="searchFile"
          style="width:auto"
        >
          <el-button slot="append" @click="searchFile" icon="el-icon-search"></el-button>
        </el-input>
        <editorImage style="display: inline-block;" pickeName="上传视频" color="#1890ff" :accept="accept" class="editor-upload-btn" @successCBK="imageSuccessCBK" />
      </div>
    </div>
    <div class="content">
      <el-scrollbar style='height:100%'>
        <el-row class="row">
          <el-col class="col" v-for="(video,index) in fileList" :key="video.fileKey" :xs="12" :sm="6" :md="4" :xl="1">
              <div class="gutter" @contextmenu.prevent.stop.capture="contextmenu(video.fileKey,index,$event)" v-longtap.stop="{fn:openContext, fileId:video.fileKey, index:index}">
                <div class="img-div" @click="priviewVideo(video)">
                  <el-image class='el-image'  fit="cover" :src="getImgSrc(video.fileKey)" >
                    <div slot="error" class="image-slot">
                      <img :src="getImgSrc('')" style="background-size: cover;max-width:100%" alt="">
                    </div>
                  </el-image>
                  <span >{{video.createTime | dateParse}}</span>
                  <span >{{video.fileSize | renderSize}}</span>
                  <i class="el-icon-video-play"></i>
                </div>
                <div class="descr">
                  <span contenteditable="true" @blur="changeFileName(video,index,$event)">{{ video.fileName }}</span>
                  <span >{{video.fileDuration | resloveVideoDuration}}</span>
                </div>
              </div>
          </el-col>
        </el-row>
      </el-scrollbar>
    </div>
    <div class="pagination">
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.limit"
          @pagination="changePage"
        />
      </div>
      <div class="videoDialog" v-show="playEleShow" >
        <video ref="videoElement" class="centeredVideo" :style="{height:height}" controls>
            Your browser is too old which doesn't support HTML5 video.
        </video>
        <i class="el-icon-circle-close" @click="destoryFlv"></i>
      </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination';
import focusOnCondition from '@/directive/focus';
import {getVideoList,downloadVideo ,updateVideo} from '@/api/video';
import { deleteFile,downloadFile} from '@/api/file';
import { MessageBox } from 'element-ui';
import editorImage from '@/components/Tinymce/components/EditorImage'
document.oncontextmenu = function() { return false; }
import flvjs from 'flv.js/dist/flv.js'
export default {
  directives: { focusOnCondition },
  components: { editorImage ,Pagination },
  data() {
    return {
        visible: false,
        fileList: [],
        total: 0,
        pages:0,
        playEleShow:false,
        width:0,
        height:0,
        listQuery: {
          page: 1,
          limit: 10,
          searchFileName: '',
        },
        player:null,
        fileId:'',
        tempFilelist:[],
        defaultImgPath: require('@/assets/img/default.jpg'),
        accept: '.MP4,.mp4,.flv,.FLV'
    };
  },
  watch: {
    
  },
  mounted: function() {
    this.freshFileList(this.listQuery);
  },
  methods: {
    priviewVideo(video){
      if(this.player){
        this.destoryFlv();
      }
      this.height = video.fileHeight + 'px';
      this.width = video.fileWidth + 'px';
      this.playEleShow = true;
      this.player = flvjs.createPlayer({
        type:video.fileExt,
        isLive:false,
        duration:video.fileDuration,
        filesize:video.fileSize,
        url:this.$store.state.settings.serverPath + 'video/priviewVideo?fileKey=' + video.fileKey
      });
      this.player.attachMediaElement(this.$refs.videoElement);
      this.player.load();
      this.player.play();

      this.player.on(flvjs.Events.ERROR, (errorType, errorDetail, errorInfo) => {
          console.log('errorType:', errorType);
          console.log('errorDetail:', errorDetail);
          console.log('errorInfo:', errorInfo);
        },
      );
      let that = this;
      this.$refs.videoElement.addEventListener('error',function(e){
        that.$message({
          type:'error',
          message:'视频加载失败'
       });
      })
    } ,   
    destoryFlv(){
      this.playEleShow = false;
      this.player.destroy();
      this.player = null;
    },
    changePage(data){
      this.listQuery = data; 
      this.freshFileList(data);
    },
    imageSuccessCBK(arr) {
      freshFileList();
    },
    getImgSrc(key) {
      if (!key) {
        return this.defaultImgPath;
      }
      return this.$store.state.settings.serverPath + 'sysFile/priviewImg?fileKey=' + key;
    },
    freshFileList(data) {
      const loading = this.$loading({
          lock: true,
          text: '加载中',
          spinner: 'el-icon-loading',
          customClass: 'loading',
          target: '.main'
      });
      this.fileList = [];
      getVideoList(data).then((res) => {
        const list = res.data.data;
        this.fileList = list;
        this.total = res.data.count;
        this.pages = res.data.pages;
      })
      loading.close();
    },
    changeFileName(file,index, event) {
      const changeName = event.target.innerText;
      if(file.fileName == changeName){
        return ;
      }
      file.fileName = changeName;
      updateVideo(file).then(res => {
        this.$message.success('修改成功');
        if (this.fileList[index].fileName !== changeName) {
          this.fileList[index].fileName = changeName;
        }
      });
    },
    deleteFiles(id,index) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        }).then(() => {
           deleteFile(id).then(res => {
            this.fileList.splice(index, 1);
            this.$message.success('删除成功！');
          })
        })
    },
    downLoad(id,index){
        downloadFile( id);
    },
    openContext(ev,value){
      this.contextmenu(value.fileId,value.index, ev);
    },
    contextmenu(id,index, event) {
      this.$contextmenu({
        items: [
          { label: '查看', icon: 'el-icon-back', divided: true, onClick: () => {
            event.target.click();
          } },
          { label: '下载', icon: 'el-icon-download', divided: true , onClick: () => {
            this.downLoad(id,index);
          } },
          // { label: '移动到', divided: true },
          { label: '删除', divided: true, icon: 'el-icon-delete', onClick: () => {
            this.deleteFiles(id,index);
          } },
          // { label: '重命名', divided: true, onClick: () => {
          //   console.log(event);
          //   // event.target.parentNode.nextElementSibling.children[0].focus();
          // } },
        ],
        event,
        zIndex: 3,
        minWidth: 100
      });
      return false;
    },
    searchFile() {
      if (this.listQuery.searchFileName == '' && this.tempFilelist.length > 0) {
        this.freshFileList({ searchName:this.listQuery.searchFileName });
      }
    },
    back(e) {
      if (!this.leftArrowEnable) {
        return false;
      }
      this.listQuery.searchFileName = '';
      if (this.tempFilelist.length > 0) {
        this.fileList = this.tempFilelist;
        this.tempFilelist = [];
        if (this.currentIndex == 0) {
          this.leftArrowEnable = false;
          return ;
        }
      }
      this.currentIndex--;
      if (this.currentIndex == 0) {
        this.leftArrowEnable = false;
      }
      this.rightArrowEnable = true;
      this.currentPath.splice(this.currentPath.length - 2, 2);
    },
    forward(e) {
      if (!this.rightArrowEnable) {
        return false;
      }
      this.leftArrowEnable = true;
      this.currentIndex++
      if ((this.currentIndex + 1) == this.pathIds.length) {
        this.rightArrowEnable = false;
      }
    },
    enterFloder(file) {
      if (file.ended) {
        return false;
      }
      this.leftArrowEnable = true;
      this.pathIds.push(file.fileKey);
      this.currentIndex++;
      this.currentPath.push('<a class="path-a" data-id="' + file.fileKey + '">' + file.fileName + '</a>');
      this.currentPath.push(this.arrow);
    },
    focusDiv(index) {
      this.number = index;
    }
  }
};
</script>
<style lang="scss">
.pagination-container{
  padding-top: 5px !important;
  margin: 0px;
  text-align: center !important;
}

.search .el-input__inner{
    padding-left: 10px ;
    padding-right: 10px ;
    width: 220px ;
    @media (max-width:550px) {
        width: 160px ;
    }
}
.search i{
  font-size: 14px;
}
.el{
  color:#F8C92A
}
a.path-a{
  font-size: 14px !important;
  vertical-align: top;
}
a.path-a:hover{
  color:#4DB3FF !important;
};
.el-icon-back{
  transform: rotate(135deg);
}
.dialog{
  .el-dialog__header{
    height: 20px;
  }
  ul{
    padding: 10px 10px 20px 10px;
    margin: 0px;
  }
  li:first-child{
    height: 60px;
    border-bottom: 1px dashed #ccc;
    line-height: 60px;
  }
  li{
    height: 40px;
    line-height: 40px;
    list-style: none;
    span{
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 300px;
    }
    span:first-child{
      width: 80px;
      color: #aaa;
    }
    span + span{
          width: 280px;
    }
    div{
      display: inline-block;
      *{
        vertical-align: middle;
      }
      i{
          font-size: 30px !important;
      }
      span{
        display: inline-block;

        margin: 0px 10px;
      }

    }
  }
}
.el-scrollbar__wrap{
  overflow-x:hidden;
}

.videoDialog{
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0px;
    left: 0px;
    background-color: rgba(0, 0, 0, 0.18);
    text-align: center;
    .centeredVideo{
      max-width: 100%;
      max-height: 90%;
      margin-top: 1%;
    }
    .el-icon-circle-close{
      position: absolute;
      right: 2rem;
      top:1rem;
      font-size: 3rem;
      color: #fff;
      cursor: pointer;
    }
}
</style>
<style lang="scss" scoped>
.main {
  height: 100%;
  color: #666;
  position: relative;
  .footer{
    letter-spacing: 1px;
    height: 30px;
    line-height: 30px;
    width: 100%;
    border-top: 1px solid #ccc;
    div{
      display: inline-block;
      margin: 0px 10px;
      span{
        letter-spacing: 2px;
      }
    }
    div+div{
      margin-left: 20px;
    }
  }
  .header{
    font-size: 16px;
    height: 60px;
    line-height: 60px;
    width: 100%;
    border-bottom: 1px solid #ccc;
    > div{
      margin-left: 10px;
      display: inline-block;
      vertical-align: middle;
      height: 100%;
      span{
        display: block;
        height: 45px;
      }
      span:nth-child(1){
        color: #999;
        line-height: 50px;
      }
      span:nth-child(2){
        line-height: 40px;
        color: #aaa;
      }
    };
    .img{
      width: 60px !important;
      height: 65px;
      margin: 15px 15px 0px 15px;
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
      };
      
    };
    .path{
      width: 70%;
      width: -moz-calc(100% - 420px);
      width: -webkit-calc(100% - 420px);
      width: calc(100% - 420px);
      margin-left: 10px;
      span{
        width: 100%;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        display: block;
        i.el-icon-arrow-right{
          font-size: 14px;
        };

      };

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
    height: calc(100vh - 185px);
    overflow: hidden;
    background: #e8f4ff;
    .row{
      .col{
        position: relative;
        text-align: center;
        display: inline-block;
        padding: 10px;
        vertical-align: top;
        > * {
          box-sizing: border-box;
          display: block;
        };
        .gutter{
          padding: 10px;
          background-color: #fff;
          .img-div{
            position: relative;
            .el-image{
              cursor: pointer;
              &::before{
                content: '';
                position: absolute;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(48, 49, 51, 0.16);
              }
              &:hover::before{
                  background-color: rgba(48, 49, 51, 0.26);
              }
            }
            i{
              cursor: pointer;
              position: absolute;
              top:50%;
              left: 50%;
              transform: translate(-50%,-50%);
              color: rgba(255, 255, 255, 0.7098039215686275);
              font-size: 3rem;
            }
            span{
              position: absolute;
              left: 4px;
              bottom: 15px;
              color: #ffffffab;
              &:nth-child(3){
                left:auto;
                right:  4px;
              }
            }
          }
          i{
            margin: 0 auto;
            font-size: 80px;
          };
          .descr{
            margin-top: 10px;
            span{
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              width: 100%;
              text-align: left;
              font-size: 12px;
              display: block;
              padding-left: 2px;
            };
            span:nth-child(1){
              border-top: 1px solid #eee;
              height: 30px;
              line-height: 30px;
              color:#333;
            };
            span:nth-child(2){
              height: 20px;
              line-height: 20px;
              color: #aaa;
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 300px) {
    body {
        background-color:lightblue;
    }
}

</style>

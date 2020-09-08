<template>
  <div class="main">
    <div class="header">
      <div class="search">
        <el-input 
          v-model="searchFileName"
          class="input"
          size="mini"
          type="text"
          placeholder="搜索相册"
          clearable
          @keyup.enter.native="searchFile"
          style="width:auto"
        >
          <el-button slot="append" @click="searchFile" icon="el-icon-search"></el-button>
        </el-input>
        <el-button style="margin-left:20px" @click="openGapContext" type="primary" size="mini">
          新建
        </el-button>
      </div>
    </div>
    <div class="content" @contextmenu.prevent.stop="gapContextmenu($event)" v-longtap.stop="openGapContext">
      <el-scrollbar style="height:100%">
        <!-- @dblclick.capture.once="enterFloder(file)" -->
        <el-row class="row">
          <el-col class="col" v-for="(file,index) in fileList" :key="file.id" :xs="12" :sm="6" :md="4" :xl="1">
            <div class="gutter"  @contextmenu.prevent.stop="contextmenu(file.id,index,$event)" v-longtap.stop="{fn:openContext, fileId:file.id, index:index}">
              <div class="img-div">
                <img :key="getImgSrc(file.fileId)" style="background-size: cover;max-width:100%" class="img"  Object-fit="cover" @click.stop="enterFloder(file)" v-lazy="getImgSrc(file.fileId)">
                <div class="item"><span>{{ file.imgCount }}P</span></div>
              </div>
              <span style='display: block;' contenteditable="true" @blur="changeFileName(file,index,$event)">{{ file.name }}</span>
            </div>
          </el-col>
        </el-row>
      </el-scrollbar>
    </div>
    <el-dialog
      :visible.sync="visible"
      width="400px"
      custom-class="dialog"
      title="属性"
    >
      <ul v-if="file != null">
        <li>
          <div><i :class="['el',file.icon]" /><span :title="file.fileName">{{ file.fileName }}</span></div>
        </li>
        <li><span>类型：</span><span>{{ file.fileTypeName }}</span></li>
        <li><span>位置：</span><span :title="file.filePath">{{ file.filePath }}</span></li>
        <li><span>大小：</span><span>{{ file.fileSize }}</span></li>
        <li v-if="file.fileInfo != ''"><span>包含：</span><span>{{ file.fileInfo }}</span></li>
        <li><span>修改时间：</span><span>{{ file.modifyDate }}</span></li>
      </ul>
    </el-dialog>
  </div>
</template>

<script>
import { log } from 'util';
import focusOnCondition from '@/directive/focus';
import { getFileList, addPhoto, updatePhoto, deletePhoto } from '@/api/photo';
import { MessageBox } from 'element-ui';
document.oncontextmenu = function() { return false; }
export default {
  directives: { focusOnCondition },
  data() {
    return {
        visible: false,
        leftArrowEnable: false,
        rightArrowEnable: false,
        arrow: '<i class="el-icon-arrow-right"></i>',
        currentPath: [],
        currenLevel: 1,
        pathIds: [''],
        currentIndex: 0,
        searchFileName: '',
        fileList: [],
        file: null,
        tempFilelist: [],
        rootId: '0',
        id: '',
        defaultImgPath: require('@/assets/img/default.jpg')
    };
  },
  watch: {
    fileList: function(newFileList, oldFileList) {
    }
  },
  mounted: function() {
    const currentPath = this.currentPath;
    this.freshFileList({ pid: this.rootId });
  },
  methods: {
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
      getFileList(data).then((res) => {
        const list = res.data.list;
        this.fileList = list;
      })
      loading.close();
    },
    changeFileName(file,index, event) {
      const changeName = event.target.innerText;
      if(file.name == changeName){
        return ;
      }
      file.name = changeName;
      updatePhoto(file).then(res => {
        this.$message.success('修改成功');
        if (this.fileList[index].fileName !== changeName) {
          this.fileList[index].fileName = changeName;
        }
      });
    },
    deleteFiles(id,index) {
      this.$confirm('此操作将永久删除该相册, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        }).then(() => {
           deletePhoto({id,id}).then(res => {
            this.fileList.splice(index, 1);
            this.$message.success('删除成功！');
        })
      })
    },
    openGapContext(){
      this.createPhoto();
    },
    createPhoto(){
      var that = this;
      MessageBox.prompt('', '新增', {
        inputValue: '新建相册',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        customClass:'message-box',
        beforeClose: function(action, instance, done) {
          if (action === 'cancel') {
            done();
          }
          if (action === 'confirm') {
            const value = instance.inputValue
            if (value == '' || (value.length < 1 || value.length > 20)) {
              that.$message.error('输入格式不正确');
              return ;
            }
            const rtf = that.fileList.find((f) => {
              return f.fileName === value;
            })
            if (rtf) {
              that.$message.error('已存在名为' + value + '的文件夹。');
              return ;
            }
            addPhoto({ pid: that.rootId, name: value }).then(function(res) {
              that.fileList.push(res.data);
              done();
              that.$router.push({ path: `/system/imgAdd/${res.data.id}`});
            })
            // focus = (this.fileList.length - 1);
          }
        }
      });
    },
    gapContextmenu(event) {
      this.$contextmenu({
        items: [
          // { label: "上传", icon: "el-icon-upload2",divided:true },
          { label: '新建相册', divided: true, onClick: () => {
            this.createPhoto();
          } },
          { label: '刷新', icon: 'el-icon-refresh', divided: true, onClick: () => { this.freshFileList({ pid: this.rootId }) } }
        ],
        event,
        zIndex: 3,
        minWidth: 100
      });
      return false;
    },
    openContext(ev,value){
      thhis.contextmenu(value.fileId,value.index,ev);
    },
    contextmenu(id,index, event) {
      this.$contextmenu({
        items: [
          { label: '打开', icon: 'el-icon-back', divided: true },
          { label: '删除', divided: true, icon: 'el-icon-delete', onClick: () => {
            this.deleteFiles(id,index);
          } },
          { label: '重命名', divided: true, onClick: () => {
            event.target.parentNode.nextElementSibling.focus()
          } },
        ],
        event,
        zIndex: 3,
        minWidth: 100
      });
      return false;
    },
    searchFile() {
      if (this.searchFileName) {
        this.freshFileList({ pid: this.rootId,searchName:this.searchFileName });
      }else{
        this.freshFileList({ pid: this.rootId});
      }
    },
    back(e) {
      if (!this.leftArrowEnable) {
        return false;
      }
      this.searchFileName = '';
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
      this.$router.push({path:`/system/imgAdd/${file.id}`})
    },
    focusDiv(index) {
      this.number = index;
    }
  }
};
</script>
<style lang="scss">
.search{
  margin-left: 10px;
}
.search .el-input__inner{
    padding: 5px 10px;
    width: 220px ;
    border:1px solid #C0C4CC !important;
    @media (max-width:550px) {
        width: 160px !important;
    }
}

.message-box{
  @media screen and (max-width: 420px) {
    width: 90%;
  }
}

.search i{
  font-size: 16px;
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
</style>
<style lang="scss" scoped>
.main {
  height: 100%;
  color: #666;
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
    height: calc(100vh - 135px);
    // overflow: auto;
    div.focus{
        background:#DAF5FF !important;
        border: 1px solid #74bcff;
    };
    .row{
      margin: 0px !important;
      padding: 0px 5px;
      .col{
        position: relative;
        text-align: center;
        padding: 5px;
        margin: 10px 0px;
        cursor: pointer;
        > * {
          box-sizing: border-box;
          display: block;
        };
        .gutter{
          background: #f2f6fc;
          padding: 10px;
          i{
            margin: 0 auto;
            font-size: 80px;
          };
          span{
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
            font-size: 12px;
            margin-top: 15px;
            padding: 5px;
          }
          .img-div{
            position: relative;
            max-width: 100%;
            .item{
              position: absolute;
              right: 20px;
              bottom: 20px;
              color: #e6a700;
              font-size: 16px;
              span{
                font-size: 18px;
              }
            }
          }
        }
      }
    }
  }
}


</style>

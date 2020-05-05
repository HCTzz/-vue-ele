<template>
  <div class="main">
    <div class="header">
      <div class="operate">
        <span title="后退" :class="[!leftArrowEnable ? 'disabled' : '','el-icon-arrow-left']" @click="back" />
        <span title="前进" :class="[!rightArrowEnable ? 'disabled' : '','el-icon-arrow-right']" @click="forward" />
        <span title="刷新" class="el-icon-refresh" />
      </div>
      <div class="separate" />
      <div class="path">
        <span v-html="currentPath.join(' ')" />
      </div>
      <div class="separate" />
      <div class="search">
        <el-input
          v-model="searchFileName"
          class="input"
          size="mini"
          type="text"
          placeholder="搜索相册"
          clearable
          @keyup.enter.native="searchFile"
        />
      </div>
    </div>
    <div class="content" @contextmenu.prevent.stop="gapContextmenu($event)">
      <el-scrollbar>
        <div v-for="(file,index) in fileList" :key="file.id" :class="['file',file.id === id ? 'focus':'']" @contextmenu.prevent.stop="contextmenu(index,$event)" @click="focusDiv(index)" @dblclick.capture.once="enterFloder(file)">
          <el-image :key="getImgSrc(file.fileId)" fit="cover" :src="getImgSrc(file.fileId)" lazy />
          <span contenteditable="true" @blur="changeFileName(index,$event)">{{ file.name }}</span>
        </div>
      </el-scrollbar>
    </div>
    <div class="footer">
      <div class="item"><span>{{ item }}</span>项</div>
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
        item: 0,
        rootId: '0',
        pid: '',
        id: '',
        defaultImgPath: require('@/assets/img/default.jpg')
    };
  },
  watch: {
    fileList: function(newFileList, oldFileList) {
      this.item = newFileList.length;
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
      return this.$store.state.serverPath + 'sysFile/priviewImg?fileKey=' + key;
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
    changeFileName(index, event) {
      const changeName = event.target.innerText;
      if (this.fileList[index].fileName !== changeName) {
        this.fileList[index].fileName = changeName;
      }
      this.focus = -1;
    },
    deleteFiles(index) {
      this.fileList.splice(index, 1);
      this.$message.success('删除成功！');
    },
    gapContextmenu(event) {
      this.$contextmenu({
        items: [
          // { label: "上传", icon: "el-icon-upload2",divided:true },
          { label: '新建相册', divided: true, onClick: () => {
            var that = this;
            MessageBox.prompt('', '编辑', {
              inputValue: '新建相册',
              confirmButtonText: '确定',
              cancelButtonText: '取消',
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
                  const rtf = fileList.find((f) => {
                    return f.fileName === value;
                  })
                  if (rtf) {
                    that.$message.error('已存在名为' + value + '的文件夹。');
                    return ;
                  }
                  addPhoto({ pid: that.rootId, name: value }).then(function(res) {
                    that.fileList.push(res.data);
                    done();
                    that.$router.push({ path: '/system/imgAdd', params: { id: res.data.id }});
                  })
                  // focus = (this.fileList.length - 1);
                }
              }
            });
          } },
          { label: '刷新', icon: 'el-icon-refresh', divided: true, onClick: () => { this.freshFileList() } }
        ],
        event,
        zIndex: 3,
        minWidth: 100
      });
      return false;
    },
    contextmenu(index, event) {
      this.$contextmenu({
        items: [
          { label: '打开', icon: 'el-icon-back', divided: true },
          { label: '下载', icon: 'el-icon-download', divided: true },
          { label: '移动到', divided: true },
          { label: '删除', divided: true, icon: 'el-icon-delete', onClick: () => {
            this.deleteFiles(index);
          } },
          { label: '重命名', divided: true, onClick: () => {
            event.target.nextElementSibling.focus()
          } },
          { label: '属性', divided: true, onClick: () => { this.visible = !this.visible;this.file = this.fileList[index]; } }
        ],
        event,
        zIndex: 3,
        minWidth: 100
      });
      return false;
    },

    searchFile() {
      if (this.searchFileName == '' && this.tempFilelist.length > 0) {
          this.fileList = this.tempFilelist;
          this.this.tempFilelist = [];
          return;
      }
      if (this.searchFileName == '') {
        return;
      }
      this.leftArrowEnable = true;
      const temp = this.fileList.filter(e => {
        return e.fileName.indexOf(this.searchFileName) != -1;
      })
      this.tempFilelist = this.fileList;
      this.fileList = temp;
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
.search .el-input__inner{
    padding-left: 0px ;
    padding-right: 10px ;
    border: none ;
    width: 220px ;
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
    height: calc(100vh - 160px);
    overflow: hidden;
    div.file:hover{
        background: rgba(218, 245, 255,0.36);
    };
    div.focus{
        background:#DAF5FF !important;
        border: 1px solid #74bcff;
    };
    div.file{
      position: relative;
      text-align: center;
      width: 140px;
      display: inline-block;
      padding: 10px;
      margin: 10px 20px;
      > * {
        box-sizing: border-box;
        display: block;
      };
      i{
        margin: 0 auto;
        font-size: 80px;
      };
      span{
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        padding: 15px 0px 0px 0px;
        font-size: 12px;
      }
    }
  }
}
</style>

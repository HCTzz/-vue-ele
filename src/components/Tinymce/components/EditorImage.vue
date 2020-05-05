<template>
  <!-- :headers="header" -->
  <div class="upload-container">
    <el-button :style="{background:color,borderColor:color}" icon="el-icon-upload" size="mini" type="primary" @click=" dialogVisible=true">
      upload
    </el-button>
    <el-dialog z-index="2000" :visible.sync="dialogVisible">
      <el-upload
        :multiple="true"
        :with-credentials="true"
        :file-list="fileList"
        :show-file-list="true"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
        :on-error="handleError"
        :before-upload="beforeUpload"
        class="editor-slide-upload"
        action="/dev-api/sysFile/fileUpload"
        list-type="picture-card"
        :accept="accept"
      >
        <el-button size="small" type="primary">
          Click upload
        </el-button>
      </el-upload>
      <el-button @click="dialogVisible = false">
        取消
      </el-button>
      <el-button type="primary" @click="handleSubmit">
        保存
      </el-button>
    </el-dialog>
  </div>
</template>

<script>
// import { getToken } from 'api/qiniu'
import { deleteFile } from '@/api/file'

export default {
  name: 'EditorSlideUpload',
  props: {
    color: {
      type: String,
      default: '#1890ff'
    },
    accept: {
      type: String,
      default: '.jpg,.jpeg,.png,.gif,.bmp,.pdf,.JPG,.JPEG,.PBG,.GIF,.BMP,.mp4,.rmvb,.flv'
    }
  },
  data() {
    return {
      dialogVisible: false,
      listObj: {},
      fileList: []
    }
  },
  methods: {
    checkAllSuccess() {
      return Object.keys(this.listObj).every(item => this.listObj[item].hasSuccess)
    },
    handleError(err, file) {

    },
    handleSubmit() {
      const arr = Object.keys(this.listObj).map(v => this.listObj[v])
      if (!this.checkAllSuccess()) {
        this.$message('请等待所有文件上传. 若出现网络错误, 请刷新页面并重新上传!')
        return
      }
      this.$emit('successCBK', arr)
      this.listObj = {}
      this.fileList = []
      this.dialogVisible = false
    },
    handleSuccess(response, file) {
      if (response.code != 20000) {
        file.status = 'fail';
        file.percentage = 0;
        this.$message({
          showClose: true,
          message: response.message,
          type: 'error'
        });
        return ;
      }
      const data = response.data;
      const uid = file.uid
      const objKeyArr = Object.keys(this.listObj)
      for (let i = 0, len = objKeyArr.length; i < len; i++) {
        if (this.listObj[objKeyArr[i]].uid === uid) {
          this.listObj[objKeyArr[i]].url = data.filePath
          this.listObj[objKeyArr[i]].hasSuccess = true
          this.listObj[objKeyArr[i]].uid = data.fileKey
          return
        }
      }
      file.uid = data.fileKey;
    },
    handleRemove(file) {
      const uid = file.uid
      const self = this;
      deleteFile(uid).then(res => {
        if (res.code !== 20000) {
          self.$message({
            showClose: true,
            message: res.message,
            type: 'error'
          });
        } else {
          const objKeyArr = Object.keys(this.listObj)
          for (let i = 0, len = objKeyArr.length; i < len; i++) {
              if (self.listObj[objKeyArr[i]].uid === uid) {
                delete self.listObj[objKeyArr[i]]
              }
          }
        }
      })
    },
    beforeUpload(file) {
      const _self = this
      const _URL = window.URL || window.webkitURL
      const fileName = file.uid
      this.listObj[fileName] = {}
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = _URL.createObjectURL(file)
        img.onload = function() {
          _self.listObj[fileName] = { hasSuccess: false, uid: file.uid, width: this.width, height: this.height }
        }
        resolve(true)
      })
    }
  }
}
</script>
<style lang="css">
  .el-upload-list__item.is-fail  .el-upload-list__item-status-label{
      background: red;
      display: block;
  }
  .is-fail .el-icon-check::before{
        content: "\E60F" !important;
  }
</style>
<style lang="scss" scoped>
.editor-slide-upload {
  margin-bottom: 20px;
  /deep/ .el-upload--picture-card {
    width: 100%;
  }

}
</style>

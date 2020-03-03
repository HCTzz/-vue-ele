<template>
  <div class="main">
    <div class="table">
      <el-table
        size="small"
        header-cell-class-name="el-table-head-th"
        :data="tableData"
        stripe
        :border="true"
        :fit="true"
        style="width: 100%"
        empty-text='无数据'
      >
        <el-table-column type="index" label="序号" width="50" align='center'></el-table-column>
        <el-table-column prop="fileName" label="文件名" min-width="15%" show-overflow-tooltip align='center'/>
        <el-table-column prop="filePath" label="存储路径" min-width="15%" show-overflow-tooltip align='center'/>
        <el-table-column prop="fileApply" label="所属业务" min-width="10%" show-overflow-tooltip align='center' />
        <el-table-column prop="fileStatus" label="状态" min-width="10%" align='center'/>
        <el-table-column
          prop="fileType"
          :formatter="typeFormat"
          label="类型"
          min-width="10%" 
          align='center'
        />
        <el-table-column label="创建人" prop="createUser" min-width="10%" align='center'/>
        <el-table-column label="创建时间" prop="createTime" min-width="15%" align='center'>
          <template slot-scope="scope">
            {{ scope.row.createTime | DateTimeformat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="10%" align='center'>
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="addRow('add', scope.row,scope.$index)"
            >
              转码
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="addRow('edit', scope.row,scope.$index)"
            >
              编辑
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="deleteRow(scope.row,scope.$index)"
            >
              删除
            </el-button>
          </template>
         
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination">
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
      />
    </div>
    <el-dialog
      title='编辑文件名'
      :visible.sync="visible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="460px"
      top="10vh"
      @closed="closeEvent"
    >
      <el-form
        ref="pageForm"
        :model="page"
        :rules="rules"
        label-width="100px"
        label-position="right"
        size="mini"
        label-suffix=":"
      >
        <el-form-item label="文件名称" prop="fileName">
          <el-input v-model="page.fileName" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="savePage">保存</el-button>
          <el-button @click="closeDialog">关闭</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination';
import { backstageValid } from '@/utils/validate';
import { log } from 'util';
const defaultPage = {
  fileKey: '',
  fileName: '',
  filePath: '',
  fileApply: '',
  fileStatus: '',
  fileExt: '',
  fileType: '',
  createUser: '',
  createTime: '',
  
};
export default {
  components: { Pagination },
  data() {
    return {
      page: {},
      tableData: [{
        fileKey:'419168994617069619',
        fileName:'关于闪酷跑路的技术指导',
        filePath:'/upload/123',
        fileApply:'这是个业务',
        fileStatus:'正常',
        fileExt:'doc',
        fileType:'2',
        createUser:'管理员',
        createTime:'1583200544629',
      },{
        fileKey:'419168994617069619',
        fileName:'关于闪酷跑路的技术指导2',
        filePath:'/upload/123',
        fileApply:'这是个业务',
        fileStatus:'正常',
        fileExt:'doc',
        fileType:'2',
        createUser:'管理员',
        createTime:'1583200544629',
      }],
      index:-1,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10
      },
      actionType: '',
      visible: false,
      rules: {
        fileName: {
          type: 'string',
          required: true,
          min: 2,
          max: 20,
          message: '长度在 1 到 50 个字符',
          trigger: 'blur'
        },
      }
    };
  },
  mounted: function() {
    this.total = this.tableData.length;
  },
  methods: {
    typeFormat(row, column, cellValue, index) {
      let t = '';
      let ext = row.fileExt;
      if(cellValue == 1){
        t = '文档';
      }else if(cellValue == 2){
        t = '图片';
      }else if(cellValue == 3){
        t = '视频';
      }else if(cellValue == 4){
        t = '音频';
      }else if(cellValue == 5){
        t = '其他';
      }
      return t + '('+ext+')';
    },
    handleClick(params) {
      
    },
    addRow(type, row,index) {
      this.actionType = type;
      this.visible = true;
      if (type === 'edit') {
        this.index = index;
        this.page = Object.assign({}, defaultPage, row);
      } else if (type === 'add' && row) {
        this.page = Object.assign({}, defaultPage, { id: row.id });
      } else {
        this.page = Object.assign({}, defaultPage, { component: 'layout' });
      }
    },
    deleteRow(row,index){
      this.$message.success('删除成功');
      this.tableData.splice(index,1);
    },
    savePage() {
      this.$refs['pageForm'].validate(valid => {
        if (valid) {
          let index = this.index;
          if(index == -1){
            this.$message.error('数据错误，请刷新后重试！');
            return false;
          }
          this.tableData[index].fileName = this.page.fileName;
          this.$message.success('修改成功');
          this.closeDialog();
        } else {
          return false;
        }
      });
    },
    closeDialog() {
      this.visible = false;
      this.$refs['pageForm'].resetFields();
    },
    closeEvent() {
      this.$refs['pageForm'].resetFields();
      this.index = -1;
    }
  }
};
</script>

<style lang="scss" scoped>
.main {
  padding: 20px 10px 0px 10px;
}
</style>

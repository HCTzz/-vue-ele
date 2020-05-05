<template>
  <div class="main">
    <div class="btns">
      <!-- v-model="searchFileName" -->
      <!-- @keyup.enter.native="searchFile" -->
      <el-input
        v-model="searchName"
        class="input"
        size="mini"
        type="text"
        placeholder="请输入标题/内容"
        clearable
        @keyup.enter.native="searchVlog"
      />
      <el-button
        type="primary"
        icon="el-icon-plus"
        size="mini"
        @click="addVlog('add')"
      >新增</el-button>
    </div>
    <div class="table">
      <el-table
        size="small"
        header-cell-class-name="el-table-head-th"
        :data="tableData"
        stripe
        :border="true"
        :fit="true"
        style="width: 100%"
        empty-text="无数据"
      >
        <el-table-column type="index" label="序号" width="50" align="center" />
        <el-table-column prop="title" label="标题" min-width="55%" show-overflow-tooltip align="center" />
        <el-table-column prop="deleteStatus" label="状态" min-width="15%" align="center" :formatter="formatStatus" />
        <el-table-column label="时间" prop="createTime" min-width="20%" align="center">
          <template slot-scope="scope">
            {{ scope.row.createTime | timeParse }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="20%" align="center">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.deleteStatus == 1"
              type="text"
              size="small"
              @click="updateStatus(scope.row,2,scope.$index)"
            >
              置为无效
            </el-button>
            <el-button
              v-else
              type="text"
              size="small"
              @click="updateStatus(scope.row,1,scope.$index)"
            >
              置为有效
            </el-button>
            <!-- <el-button
              type="text"
              size="small"
              @click="addRow('add', scope.row,scope.$index)"
            >
              转码
            </el-button> -->
            <el-button
              type="text"
              size="small"
              @click="addVlog('edit', scope.row,scope.$index)"
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
      :title="dialogTitle"
      :visible.sync="visible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="960px"
      top="5vh"
      @closed="closeEvent"
    >
      <el-form
        ref="vlogForm"
        :model="vlog"
        :rules="rules"
        label-width="60px"
        label-position="right"
        size="mini"
        label-suffix=":"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="vlog.title" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <tinymce :value="vlog.content" accept=".jpg,.jpeg,.png,.gif,.bmp,.JPG,.JPEG,.PBG,.GIF,.BMP" :height="200" @input="setContent" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveVlog">保存</el-button>
          <el-button @click="closeDialog">关闭</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination';
import { backstageValid } from '@/utils/validate';
import { fetchList, fetchArticle, createArticle, updateArticle } from '@/api/article';
import Tinymce from '@/components/Tinymce';
import { log } from 'util';
const defaultVlog = {
  id: '',
  title: '',
  content: '',
  status: '',
  createTime: ''
};
export default {
  components: { Pagination, Tinymce },
  data() {
    return {
      vlog: {
        id: '',
        title: '',
        content: '',
        status: '',
        createTime: ''
      },
      dialogTitle: '',
      searchName: '',
      page: {},
      tableData: [
      //   {
      //   id:'419168994617069619',
      //   title:'关于闪酷跑路的技术指导2',
      //   content:'/upload/123',
      //   fileApply:'这是个业务',
      //   status:'公开',
      //   createUser:'管理员',
      //   createTime:'1583200544629',
      // }
      ],
      index: -1,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10
      },
      actionType: '',
      visible: false,
      rules: {
        title: {
          type: 'string',
          required: true,
          min: 2,
          max: 20,
          message: '长度在 1 到 50 个字符',
          trigger: 'blur'
        },
        content: {
          type: 'string',
          required: true,
          message: '内容不能为空',
          trigger: 'blur'
        }
      }
    };
  },
  mounted: function() {
    fetchList(this.listQuery).then(res => {
      this.total = res.data.total;
      this.tableData = res.data.list;
    })
  },
  methods: {
    updateStatus(vlog, status, index) {
      this.vlog.id = vlog.id;
      this.vlog.deleteStatus = status;
      updateArticle(this.vlog).then(res => {
        if (res.code === 20000) {
          this.$message.success('修改成功');
          this.tableData[index].deleteStatus = status;
        } else {
          this.$message.success('修改失败');
        }
      })
    },
    formatStatus(row, column, cellValue, index) {
      return cellValue == 1 ? '有效' : '无效';
    },
    setContent(content) {
      this.vlog.content = content;
    },
    searchVlog() {

    },
    handleClick(params) {

    },
    addVlog(type, row, index) {
      this.actionType = type;
      this.visible = true;
      this.dialogTitle = '新增';
      if (type === 'edit') {
        this.dialogTitle = '编辑';
        this.index = index;
        this.vlog = Object.assign({}, defaultVlog, row);
      } else if (type === 'add' && row) {
        this.vlog = Object.assign({}, defaultVlog, { id: row.id });
      } else {
        this.vlog = Object.assign({}, defaultVlog, { component: 'layout' });
      }
    },
    deleteRow(row, index) {
      deleteArticle(row).then(res => {
        this.$message.success('删除成功');
        this.tableData.splice(index, 1);
      })
    },
    saveVlog() {
      this.$refs['vlogForm'].validate(valid => {
        if (valid) {
          const index = this.index;
          if (index == -1) { // 新增
            createArticle(this.vlog).then(res => {
                this.tableData.push(res.data);
                this.$message.success('保存成功！');
            })
            return false;
          } else {
            updateArticle(this.vlog).then(res => {
              this.tableData[index] = this.vlog;
              this.$message.success('修改成功');
              this.closeDialog();
            })
          }
        } else {
          return false;
        }
      });
    },
    closeDialog() {
      this.visible = false;
      // this.$refs['pageForm'].resetFields();
    },
    closeEvent() {
      // this.$refs['pageForm'].resetFields();
      this.index = -1;
    }
  }
};
</script>

<style lang="scss" scoped>
.main {
  padding: 20px 10px 0px 10px;
}
.el-input{
  width: 220px
}
.btns .el-button{
  margin-left: 20px;
}
</style>

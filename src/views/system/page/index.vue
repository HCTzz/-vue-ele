<template>
  <div class="main">
    <div class="btns">
      <el-button
        type="primary"
        icon="el-icon-plus"
        size="mini"
        @click="addRole('add')"
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
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        row-key="id"
      >
        <el-table-column prop="code" label="页面编码" min-width="10%" />
        <el-table-column prop="name" label="页面名称" min-width="15%" />
        <el-table-column prop="path" label="路由路径" min-width="10%" />
        <el-table-column prop="component" label="模块名" min-width="10%" />
        <el-table-column
          prop="type"
          :formatter="typeFormat"
          label="类型"
          min-width="10%"
        />
        <el-table-column prop="hidden" label="是否隐藏" min-width="10%">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.hidden"
              active-text="是"
              inactive-text="否"
            />
          </template>
        </el-table-column>
        <el-table-column prop="alwaysShow" label="始终显示" min-width="10%">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.alwaysShowFormat"
              active-text="是"
              inactive-text="否"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" min-width="15%">
          <template slot-scope="scope">
            {{ scope.row.createTime | excludSec }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="10%">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="addRole('add', scope.row)"
            >
              新增
            </el-button>
          </template>
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="addRole('edit', scope.row)"
            >
              编辑
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
      :title="actionType == 'add' ? '添加菜单' : '编辑菜单'"
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
        label-width="80px"
        label-position="right"
        size="mini"
        label-suffix=":"
      >
        <el-form-item label="编码" prop="code">
          <el-input v-model="page.code" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="page.name" />
        </el-form-item>
        <el-form-item label="路由" prop="path">
          <el-input v-model="page.path" />
        </el-form-item>
        <el-form-item label="加载模块" prop="component">
          <el-input v-model="page.component" />
        </el-form-item>
        <el-form-item label="重定向" prop="redirect">
          <el-input v-model="page.redirect" placeholder="一级菜单中使用" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="page.redirect" placeholder="一级菜单中使用" />
        </el-form-item>
        <el-form-item label="是否隐藏" prop="hidden">
          <el-switch v-model="page.hidden" active-text="是" inactive-text="否" />
        </el-form-item>
        <el-form-item label="始终显示" prop="alwaysShow">
          <el-switch
            v-model="page.alwaysShow"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
        <el-form-item label="状态" prop="type">
          <el-radio-group v-model="page.type" size="mini">
            <el-radio border label="1">菜单</el-radio>
            <el-radio border label="2">按钮</el-radio>
          </el-radio-group>
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
const defaultPage = {
  id: '',
  parentId: '',
  name: '',
  path: '',
  component: '',
  redirect: '',
  icon: '',
  hidden: false,
  alwaysShow: true,
  type: '1',
  code: '',
  createTime: ''
};
export default {
  components: { Pagination },
  data() {
    return {
      page: {},
      tableData: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10
      },
      actionType: '',
      visible: false,
      rules: {
        name: {
          type: 'string',
          required: true,
          min: 2,
          max: 20,
          message: '长度在 2 到 20 个字符',
          trigger: 'blur'
        },
        code: [
          {
            type: 'string',
            required: true,
            message: '请输入菜单编码',
            trigger: 'blur',
            min: 3,
            max: 15,
            message: '长度在 3 到 15 个字符'
          },
          {
            validator(rule, value, callback, source, option) {
              console.log(this);
              // if (this.page.id) {
              //   option.params.id = this.page.id;
              // }
              option.url = '/system/page/validCode';
              option.callback = data => {
                if (data.code !== 20000) {
                  callback(
                    new Error(data.message ? data.message : '该编码已被使用！')
                  );
                } else {
                  callback();
                }
              };
              backstageValid(rule, value, callback, source, option);
            },
            trigger: 'blur'
          }
        ],
        path: {
          type: 'string',
          required: true,
          min: 2,
          max: 20,
          message: '长度在 2 到 20 个字符',
          trigger: 'blur'
        }
      }
    };
  },
  mounted: function() {
    this.total = this.tableData.length;
  },
  methods: {
    typeFormat(row, column, cellValue, index) {
      return cellValue == 1 ? '菜单' : '按钮';
    },
    handleClick(params) {
      console.log(params);
    },
    addRole(type, row) {
      this.actionType = type;
      this.visible = true;
      if (type === 'edit') {
        this.page = Object.assign({}, defaultPage, row);
      } else if (type === 'add' && row) {
        this.page = Object.assign({}, defaultPage, { id: row.id });
      } else {
        this.page = Object.assign({}, defaultPage, { component: 'layout' });
      }
    },
    savePage() {
      this.$refs['pageForm'].validate(valid => {
        if (valid) {
          console.log(this.page);
        } else {
          alert('false!');
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
    }
  }
};
</script>

<style lang="scss" scoped>
.main {
  padding: 20px 10px 0px 10px;
}
</style>

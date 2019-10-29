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
      >
        <el-table-column prop="roleCode" label="角色编码" min-width="15%" />
        <el-table-column prop="roleName" label="角色名称" min-width="20%" />
        <el-table-column prop="roleRange" label="权限范围" min-width="20%" />
        <el-table-column prop="status" label="状态" min-width="10%" />
        <el-table-column prop="createTime" label="创建时间" min-width="20%" />
        <el-table-column label="操作" min-width="15%">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="handleClick(scope.row)"
            >查看</el-button>
            <el-button
              type="text"
              size="small"
              @click="handleClick(scope.row)"
            >编辑</el-button>
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
      :title="actionType == 'add' ? '添加角色' : '编辑角色'"
      :visible.sync="visible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="460px"
    >
      <el-form
        :model="role"
        :rules="rules"
        label-width="80px"
        label-position="right"
      >
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="role.roleCode" placeholder="角色编码" />
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="role.roleName" placeholder="角色名称" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="role.status" size="mini">
            <el-radio border label="1">有效</el-radio>
            <el-radio border label="2">无效</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权限范围" />
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination';
import { backstageValid } from '@/utils/validate';
const role = {
  roleCode: '',
  roleName: '',
  roleRange: '',
  deleteStatus: '',
  routers: []
};
export default {
  components: { Pagination },
  data() {
    return {
      tableData: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10
      },
      actionType: '',
      visible: false,
      role: {
        name: ''
      },
      rules: {
        roleCode: [
          {
            type: 'string',
            required: true,
            message: '请输入角色编码',
            trigger: 'blur',
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符'
          },
          {
            validator(rule, value, callback, source, option) {
              option.url = '/system/role/validRole';
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
        roleName: [
          {
            type: 'string',
            required: true,
            message: '请输入角色名称',
            trigger: 'blur',
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符'
          }
        ]
      }
    };
  },
  mounted: function() {
    this.total = this.tableData.length;
  },
  methods: {
    handleClick(params) {
      console.log(params);
    },
    addRole(type) {
      this.actionType = type;
      this.visible = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.main {
  padding: 20px 10px 0px 10px;
}
</style>

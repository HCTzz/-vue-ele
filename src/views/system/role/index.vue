<template>
  <div class="main">
    <div class="table">
      <el-table size="small" header-cell-class-name="el-table-head-th" :data="tableData" stripe border="true" fit="true" style="width: 100%">
        <el-table-column
          prop="date"
          label="日期"
          min-width="20%"
        />
        <el-table-column
          prop="name"
          label="姓名"
          min-width="20%"
        />
        <el-table-column
          prop="address"
          label="地址"
        />
      </el-table>
    </div>
    <div class="pagination"><pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" /></div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
export default {
    components: { Pagination },
    data() {
      return {
        tableData: [{
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1517 弄'
        }, {
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1519 弄'
        }, {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1516 弄'
        }],
        total: 0,
        listQuery: {
          page: 1,
          limit: 10
        }
      }
    },
    mounted: function() {
      this.total = this.tableData.length;
    }
  }
</script>

<style lang="scss" scoped>
.main{
  padding: 20px 10px 0px 10px;
  .pagination{

  }
}
</style>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
<style>
  html{
    font-size: 14px;
  }
  #app{
    position: relative;
  }
  .el-button+.el-button{
    margin-left: 0px;
  }
</style>
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
    
  }
  .el-button+.el-button{
    margin-left: 0px;
  }
</style>
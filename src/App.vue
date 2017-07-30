<template>
  <div id="app" class="all">
    <!-- <el-row type="flex" class="row-bg" justify="space-around">
      <el-col :span="6"><div class="grid-content bg-purple"></div></el-col>
      <el-col :span="6"><div class="grid-content bg-purple-light"><suggestion></suggestion></div></el-col>
      <el-col :span="6"><div class="grid-content bg-purple"></div></el-col>
    </el-row>

    <el-row type="flex" class="row-bg" justify="center">
      <el-col :span="6"><div class="grid-content bg-purple"></div></el-col>
      <el-col :span="6"><div class="grid-content bg-purple-light"><suggestion></suggestion></div></el-col>
      <el-col :span="6"><div class="grid-content bg-purple"></div></el-col>
    </el-row>

    <el-row type="flex" class="row-bg" justify="center">
      <el-col :span="6"><div class="grid-content bg-purple"></div></el-col>
      <el-col :span="6"><div class="grid-content bg-purple-light"><search></search></div></el-col>
      <el-col :span="6"><div class="grid-content bg-purple"></div></el-col>
    </el-row> -->


    <el-row :gutter="0">
      <el-col :xs="0"  :sm="4"  :md="6" :lg="6"><div class="grid-content bg-purple"></div></el-col>
      <el-col :xs="24" :sm="16" :md="12" :lg="12"><div class="grid-content bg-purple-light"><suggestion></suggestion></div></el-col>
      <el-col :xs="0"  :sm="4"  :md="6" :lg="6"><div class="grid-content bg-purple"></div></el-col>
    </el-row>

    <el-row :gutter="0">
      <el-col :xs="0"  :sm="4"  :md="6" :lg="6"><div class="grid-content"></div></el-col>
      <el-col :xs="24" :sm="16" :md="12" :lg="12"><div class="grid-content"><search></search></div></el-col>
      <el-col :xs="0"  :sm="4"  :md="6" :lg="6"><div class="grid-content"></div></el-col>
    </el-row>


  </div>


</template>

<script>
export default {
  data () {
    return {}
  },

  methods: {
    startHacking () {
      this.$notify({
        title: 'It Works',
        message: 'We have laid the groundwork for you. Now it\'s your time to build something epic!',
        duration: 6000
      })
    }
  }
}
</script>

<style>
body {
  font-family: Helvetica, sans-serif;
}

.bg-purple{
  background-color: #D16BFB
}
.bg-purple-light{
  background-color: #C98EE1
}
.el-col {
  border-radius: 4px;
}
.bg-purple-dark {
  background: #99a9bf;
}
.bg-purple {
  background: #d3dce6;
}
.bg-purple-light {
  background: #e5e9f2;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.all{
  color: #1F2D3D
}
</style>

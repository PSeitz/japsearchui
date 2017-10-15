<template>
  <section id="app" class="all section">
    <!-- <el-row type="flex" class="row-bg" justify="space-around">
      <el-col :span="6"><div class="grid-content"></div></el-col>
      <el-col :span="6"><div class="grid-content-light"><suggestion></suggestion></div></el-col>
      <el-col :span="6"><div class="grid-content"></div></el-col>
    </el-row>

    <el-row type="flex" class="row-bg" justify="center">
      <el-col :span="6"><div class="grid-content"></div></el-col>
      <el-col :span="6"><div class="grid-content-light"><suggestion></suggestion></div></el-col>
      <el-col :span="6"><div class="grid-content"></div></el-col>
    </el-row>

    <el-row type="flex" class="row-bg" justify="center">
      <el-col :span="6"><div class="grid-content"></div></el-col>
      <el-col :span="6"><div class="grid-content-light"><search></search></div></el-col>
      <el-col :span="6"><div class="grid-content"></div></el-col>
    </el-row> -->

    <!-- <el-row :gutter="0" >
      <el-col :xs="0"  :sm="4"  :md="6" :lg="6"><div class="grid-content"></div></el-col>
      <el-col :xs="24" :sm="16" :md="12" :lg="12">
      <div class="grid-content-light">
      <h1 class="top" >J - <img class="logo" src="./assets/sleep_60.png"> - Ibiki</h1> 
      </div></el-col>
      <el-col :xs="0"  :sm="4"  :md="6" :lg="6"><div class="grid-content"></div></el-col>
    </el-row>

    <el-row :gutter="0">
      <el-col :xs="0"  :sm="4"  :md="6" :lg="6"><div class="grid-content"></div></el-col>
      <el-col :xs="24" :sm="16" :md="12" :lg="12"><div class="grid-content-light"><suggestion></suggestion></div></el-col>
      <el-col :xs="0"  :sm="4"  :md="6" :lg="6"><div class="grid-content"></div></el-col>
    </el-row> -->

    <div class="container color-primary-0">
      <h1 class="top title" >J - <img class="logo" src="./assets/sleep_40.png"> - Ibiki</h1> 
      <suggestion></suggestion>
      <search></search>
    </div>



    <!-- <el-row :gutter="0">
      <el-col :xs="0"  :sm="4"  :md="6" :lg="6"><div class="grid-content"></div></el-col>
      <el-col :xs="24" :sm="16" :md="12" :lg="12"><div class="grid-content"><mysuggest></mysuggest></div></el-col>
      <el-col :xs="0"  :sm="4"  :md="6" :lg="6"><div class="grid-content"></div></el-col>
    </el-row> -->

    <!-- <el-row :gutter="0">
      <el-col :xs="0"  :sm="4"  :md="6" :lg="6"><div class="grid-content"></div></el-col>
      <el-col :xs="24" :sm="16" :md="12" :lg="12"><div class="grid-content"><search></search></div></el-col>
      <el-col :xs="0"  :sm="4"  :md="6" :lg="6"><div class="grid-content"></div></el-col>
    </el-row> -->


  </section>


</template>

<script>
export default {
  data () {
    return {}
  },

  methods: {
    startHacking () {
    }
  }
}
</script>

<style lang="less">
@import (reference) "colors.less";

.color-primary-0 { color: @color-primary-0; }
.color-primary-1 { color: @color-primary-1; }
.color-primary-2 { color: @color-primary-2; }
.color-primary-3 { color: @color-primary-3; }
.color-primary-4 { color: @color-primary-4; }

.color-secondary-1-0 { color: @color-secondary-1-0; }
.color-secondary-1-1 { color: @color-secondary-1-1; }
.color-secondary-1-2 { color: @color-secondary-1-2; }
.color-secondary-1-3 { color: @color-secondary-1-3; }
.color-secondary-1-4 { color: @color-secondary-1-4; }

.color-secondary-2-0 { color: @color-secondary-2-0; }
.color-secondary-2-1 { color: @color-secondary-2-1; }
.color-secondary-2-2 { color: @color-secondary-2-2; }
.color-secondary-2-3 { color: @color-secondary-2-3; }
.color-secondary-2-4 { color: @color-secondary-2-4; }

body {
  font-family: Helvetica, sans-serif;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.all{
  color: #1F2D3D;
  padding-top: 1em;
}
.logo{
  top: 8px;
  position: relative;
}
.top{
  margin: 0;
  font-weight: normal;
}
</style>

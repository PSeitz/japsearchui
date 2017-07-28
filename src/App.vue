<template>
  <div id="app">
    <el-row type="flex" class="row-bg" justify="space-around">
      <el-col :span="6"><div class="grid-content bg-purple"></div></el-col>
      <el-col :span="6"><div class="grid-content bg-purple-light"><suggestion></suggestion></div></el-col>
      <el-col :span="6"><div class="grid-content bg-purple"><search></search></div></el-col>
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
</style>

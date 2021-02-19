<template>
  <div id="app">
    <spreadsheet/>
  </div>
</template>

<script>
import Spreadsheet from './components/Spreadsheet'

export default {
  name: 'App',
  components: {
    Spreadsheet
  }
}
</script>

<style>
body {
  margin: 0;
}
* {
  box-sizing: border-box;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  overflow: scroll;
  width: 100vw;
  height: 100vh;
  padding: 10px;
}
@media (min-width: 768px) {
  #app {
    overflow: hidden;
  }
}
</style>

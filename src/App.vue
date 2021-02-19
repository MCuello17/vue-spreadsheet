<template>
  <div
    id="app">
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
  :root {
    /* Colors */
    --background: #fff;
    --shadow-color: #00000027;
    --primary: #439aff;
    --separator-highlight: #bbbbbb;
    --separator: #f3f3f3;
    --button: var(--separator);
    --error: #ff5858;
    --text: #000225;
    /* Misc */
    --shadow: 0px 0px 15px 2px var(--shadow-color);
  }

  body {
    margin: 0;
    background: transparent;
  }

  * {
    box-sizing: border-box;
  }

  #app.darkmode {
    --background: #292835;
    --shadow-color: #ffffff27;
    --primary: #3cb823;
    --separator: #444349;
    --separator-highlight: #494a69;
    --button: #151625;
    --error: #ff5858;
    --text: #d1d1d1;
  }

  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    background: var(--background);
    color: var(--text);
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

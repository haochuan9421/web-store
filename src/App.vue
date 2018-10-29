<template>
  <div id="app">
    <img src="./assets/logo.png">
    <p align="center">
      <router-link to="/Cookies">Cookies</router-link>
      <router-link to="/IndexedDB">IndexedDB</router-link>
      <router-link to="/LocalStorage">LocalStorage</router-link>
      <router-link to="/SessionStorage">SessionStorage</router-link>
      <router-link to="/WebSQL">WebSQL</router-link>
    </p>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
html{
  width: 100%;
  height: 100%;
  overflow: auto;
}
body{
  margin: 0;
}
a {
  color: #42b983;
}
</style>

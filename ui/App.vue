<template>
    <div>
        <header>
            <h1>Viremo UI</h1>
        </header>
        <nav>
            <router-link to="/">Home</router-link>
            <router-link to="/Configs">Results</router-link>
        </nav> 
        <main>
            <router-view></router-view>
        </main>
        <footer>
            &copy; 2019
        </footer> 
    </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello World Test',
    };
  },
};
</script>

<style>
#viremo {
  font-size: 18px;
  font-family: 'Roboto', sans-serif;
  color: blue;
}
</style>


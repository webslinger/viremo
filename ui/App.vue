<template>
    <div>
        <header>
            <h1>Viremo UI</h1>
        </header>
        <nav>
            <router-link to="/">Home</router-link>
            <router-link to="/Configs">Websites</router-link>
        </nav> 
        <main>
          <keep-alive>
            <router-view></router-view>
          </keep-alive>
        </main>
        <footer>
            &copy; 2019
        </footer> 
    </div>
</template>

<script>
</script>

<style>
#viremo {
  font-size: 18px;
  font-family: 'Roboto', sans-serif;
  color: blue;
}
</style>


<template>
    <div id="viremo">
        <header>
            <div class="logo"><div></div></div> 
            <h1>Viremo UI</h1>
        </header>
        <nav>
            <router-link to="/">Home</router-link>
            <router-link to="/configuration">Site Configuration</router-link>
            <router-link to="/analysis">Analyze</router-link>
        </nav> 
        <main>
          <router-view></router-view>
        </main>
        <footer>
            &copy; 2019
        </footer> 
    </div>
</template>

<style lang="stylus" src="./web/stylus/app.styl"></style>


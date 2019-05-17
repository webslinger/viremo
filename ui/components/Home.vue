<template>
    <div id="home">
        {{message}} 
    </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Home!',
    };
  }
}; 
</script>

<style>
#home {
  font-size: 18px;
  font-family: 'Roboto', sans-serif;
  color: blue;
}
</style>


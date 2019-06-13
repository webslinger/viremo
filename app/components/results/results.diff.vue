<template>
  <div v-if="diff" class="diff">
    <label>{{filenameTranslator(diff.filename)}}</label>
    <div class="controls">
      <label :class="{ active: mode === 'overlay'}">Overlay <input type="radio" v-model="mode" value="overlay"></label>
      <label :class="{ active: mode === 'original'}">Original <input type="radio" v-model="mode" value="original"></label>
      <label :class="{ active: mode === 'new'}">New <input type="radio" v-model="mode" value="new"></label>
    </div>
    <div v-if="mode === 'overlay'" class="filters">
      <label :class="{ active: filter === 'none'}">None <input type="radio" v-model="filter" value="none"></label>
      <label :class="{ active: filter === 'sepia'}">Sepia <input type="radio" v-model="filter" value="sepia"></label>
      <label :class="{ active: filter === 'saturated'}">Saturated<input type="radio" v-model="filter" value="saturated"></label>
    </div>
    <div class="images" :class="mode">
      <div :class="filter">
        <img :src="diff.reference" alt="">
        <img :src="diff.capture" alt="">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      mode: "overlay",
      filter: "none"
    }
  },
  props: ['diff'],
  methods: {
    filenameTranslator(filename) {
      let selector = filename.replace(/\_vID\_/g,'#');
      selector = selector.replace(/\_vCLS\_/g, '.');
      selector = selector.replace(/\_vSP\_/g, ' ');
      selector = selector.replace(/\.png/g,'');
      return selector;
    }
  }
}
</script>

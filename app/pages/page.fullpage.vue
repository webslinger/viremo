<template>
    <div id="fullpage">
      <div v-if="ready">
          <div class="controls">
            <label :class="{ active: mode === 'overlay' }">Overlay <input type="radio" v-model="mode" value="overlay"></label>
            <label :class="{ active: mode === 'original' }">Original <input type="radio" v-model="mode" value="original"></label>
            <label :class="{ active: mode === 'new' }">New <input type="radio" v-model="mode" value="new"></label>
            <div v-if="mode === 'overlay'" class="filters">
              <label :class="{ active: filter === 'none'}">None <input type="radio" v-model="filter" value="none"></label>
              <label :class="{ active: filter === 'sepia'}">Sepia <input type="radio" v-model="filter" value="sepia"></label>
              <label :class="{ active: filter === 'saturated'}">Saturated<input type="radio" v-model="filter" value="saturated"></label>
            </div>
          </div>
          <div class="fullpage" :class="mode">
            <div :class="filter">
              <img :src="viewport.fullpage" alt="">
              <img :src="viewport.fullpage_ref" alt="">
            </div>
          </div>
      </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      mode: 'overlay',
      filter: 'none',
      website: null,
      path: null,
      viewport: null,
      ready: false
    }
  },
  created() {
    let data = JSON.parse(sessionStorage.getItem('diffs'));
    let path = this.$route.params.path;
    let viewport = this.$route.params.viewport; 
    let viewportData
    for (let diff of data) {
      if (diff.path === path) {
        if (diff.viewport === viewport) {
          let filename = diff.filename;
          let capture = diff.capture.replace(filename,'fullpage.png');
          let reference = diff.reference.replace(filename,'fullpage.png');
          this.viewport = {
            fullpage: capture,
            fullpage_ref: reference
          };
          this.ready = true;
        }
      }
    }
  },
  watch: {
    'this.$route.params.path': function() {
      console.log('change p');
    },
    'this.$route.params.viewport': function() {
      console.log('change v');
    },
    'this.$route.params': function() {
      console.log('general change');
    }
  }
}; 
</script>


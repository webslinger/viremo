<template>
    <div id="result">
      <h2>Results</h2>
      <div class="paths">
        <button v-for="path in diffs" :key="path.label" @click="activePath = path.label" :class="{ active: path.label == activePath }">{{path.label}}</button>
      </div>
      <div v-for="path in diffs" :key="path.label">
        <div v-if="activePath == path.label">
          <div class="viewports">
            <button v-for="viewport in path.viewports" :key="viewport.label" @click="activeViewport = viewport.label" :class="{ active: viewport.label == activeViewport }">{{viewport.label}}</button>
          </div>
          <div v-for="viewport in path.viewports" :key="path.label+':'+viewport.label">
            <div v-if="activeViewport == viewport.label">
              <div class='fullpage-link'>
                <router-link :to="{ name: 'fullpage', params: { path: path.label, viewport: viewport.label }}">View Fullpage Comparison</router-link>
              </div>
              <h5>Selectors</h5>          
              <diff v-for="diff in viewport.diffs" :key="path.label+':'+viewport.label+':'+diff.filename" :diff="diff" />
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import Diff from './../components/results/results.diff.vue';
export default {
  data() {
    return {
      diffs: null,
      mode: 'overlay',
      filter: 'none',
      activePath: null,
      activeViewport: null,
      config: null
    };
  },
  created() {
    let diffs = JSON.parse(sessionStorage.getItem('diffs'));
    let sortedDiffs = [];
    let paths = {};
    for (let diff of diffs) {
      if (!paths.hasOwnProperty(diff.path)) {
        paths[diff.path] = {};
      }
      if (!paths[diff.path].hasOwnProperty(diff.viewport)) {
        paths[diff.path][diff.viewport] = [];
      }
      paths[diff.path][diff.viewport].push(diff);
    }    
    for (let path in paths) {
      let newDiff = {};
      newDiff.label = path;
      newDiff.viewports = [];
      for (let viewport in paths[path]) {
        newDiff.viewports.push({
          label: viewport,
          diffs: paths[path][viewport],
          fullpage: paths[path][viewport][0].capture.replace(paths[path][viewport][0].filename,'fullpage.png'),
          fullpage_ref: paths[path][viewport][0].reference.replace(paths[path][viewport][0].filename,'fullpage.png')
        });
      }
      sortedDiffs.push(newDiff);
    }
    this.diffs = sortedDiffs;
    this.activePath = this.diffs[0].label;
    this.activeViewport = this.diffs[0].viewports[0].label;
    this.config = this.$route.params.file;
  },
  components: {
    Diff
  }
}; 
</script>



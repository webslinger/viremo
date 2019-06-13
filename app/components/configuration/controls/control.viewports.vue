<template>
  <div id="viewports" v-if="data">
    <h3>Viewports</h3>
    <table>
      <thead>
        <th>Label</th>
        <th>Width</th>
        <th>Height</th>
        <th v-bind:colspan="(readonly) ? '1' : '2'"></th>
      </thead>
      <tbody>
        <tr v-for="viewport in data" v-bind:key="viewport.id">
          <td>
            <input type="text" v-bind:readonly="readonly" v-model.lazy="viewport.label">
          </td>
          <td>
            <input type="text" v-bind:readonly="readonly" v-model.number="viewport.width">
          </td>
          <td>
            <input type="text" v-bind:readonly="readonly" v-model.number="viewport.height">
          </td>
          <td>
            <i class="material-icons">{{viewportIcon(viewport.width)}}</i>
          </td>
          <td v-if="!readonly">
            <button v-bind:disabled="data.length <= 1" @click="remove(viewport.id)">
              <i class="material-icons">close</i>
            </button>
          </td>
        </tr>
      </tbody>
      <tfoot v-if="!readonly">
        <tr>
          <td v-bind:colspan="(readonly) ? '4' : '5'">
            <button @click="add">Add Viewport</button>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script>
import ConfigControl from "./_control.vue";
export default {
  extends: ConfigControl,
  created() {
    this.type = "viewport";
  },
  methods: {
    viewportIcon(viewport_width) {
      if (viewport_width > 768) {
        return "tv";
      }
      if (viewport_width > 480) {
        return "tablet_android";
      }
      return "phone_android";
    }
  }
};
</script>


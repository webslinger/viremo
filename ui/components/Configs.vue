<template>
    <div id="configs">
      <div class="menu">
        <h2>Configs</h2>
        <ul>
          <li v-if="loading">Please wait...</li>
          <li v-for="cfg in configs" v-bind:key="cfg.id" v-on:click="config = cfg.name">
            {{cfg.name}} 
          </li>
        </ul>
      </div>
      <div class='config'>
        <config v-bind:config.sync="config"></config>
      </div>
    </div> 
</template>

<script>
import { ServiceFactory } from './../api/serviceFactory';
import Config from './configs/Config.vue';
const configService = ServiceFactory.get('configs');
export default {
  data() {
    return {
      message: 'Configs!',
      configs: [],
      config: null,
      loading: true
    };
  },
  created() {
    this.refreshConfigs();
  },
  methods: {
    async refreshConfigs() {
      const { data } = await configService.get();
      this.configs = data;
      this.loading = false;
    }
  },
  components: {
    Config
  }
};
</script>

<style>
#configs {
  font-size: 18px;
  font-family: 'Roboto', sans-serif;
  color: blue;
}
</style>


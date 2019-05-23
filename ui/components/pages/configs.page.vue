<template>
    <div id="configs">
      <div class="menu">
        <h2>Website Configurations</h2>
        <ul>
          <li v-if="loading">Please wait...</li>
          <li v-for="cfg in configs" v-bind:key="cfg.id" v-on:click="config = cfg.name">
            {{cfg.name}} 
          </li>
        </ul>
        <div>
          <button @click="add">Add New Config</button>
        </div> 
      </div>
      <div class='config'>
          <configs-form v-bind:config.sync="config" @save="save($event)" />
      </div>
    </div> 
</template>

<script>
import { ServiceFactory } from './../../api/serviceFactory';
import ConfigsForm from './configs/configs.form.vue';
import { NewConfig } from './../../classes';
const configService = ServiceFactory.get('configs');
export default {
  data() {
    return {
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
      this.filename = null;
    },
    async save(config) {
      let filename = (config.custom) ? this.filename : this.config;
      await configService.save(filename, config);
      if (config.custom) {
        this.refreshConfigs();
      }
    },
    async add() {
      this.filename = await prompt("Choose a file name.",'new.js');
      this.config = NewConfig();
    }
  },
  components: {
    ConfigsForm
  }
};
</script>

<style>
#configs {
  color: black;
  font-size: 16px;
  display: grid;
  grid-template-columns: 20% 80%;
}
.menu h2 {
  font-size: 16px;
}

.menu ul {
  list-style-type: none;
  padding-left: 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
}
.menu li + li {
  margin-top: 12px;
}

.menu button {
  color: #E30;
  border-color: #E30;
}
</style>


<template>
    <div id="configs">
      <div class="menu">
        <h2>Configurations</h2>
        <ul>
          <li v-if="loading">Please wait...</li>
          <li v-for="cfg in configs" v-bind:key="cfg.id">
            <router-link :to="`/configuration/${cfg.name}`">{{cfg.name}}</router-link>
          </li>
        </ul>
        <div>
          <button @click="add">Add New Config</button>
        </div> 
      </div>
      <div class='config'>
        <configs-form 
          v-bind:config.sync="config" 
          @del="del" 
          @save="save($event)" 
        />
      </div>
    </div> 
</template>

<script>
import { ServiceFactory } from './../api/serviceFactory';
import { NewConfig } from './../app.classes';

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
      if (this.$route.params.file) {
        this.swap(this.$route.params.file);
      }
    }, 
    swap(config) {
      this.config = config;
    },
    async save(config) {
      let filename = (config.data.custom) ? this.filename : this.config;
      await configService.save(filename, config.data);
      if (config.custom) {
        this.refreshConfigs();
      }
    },
    async add() {
      this.filename = await prompt("Choose a file name.",'new.js');
      this.config = NewConfig();
    },
    async del() {
      let filename = (config.custom) ? this.filename : this.config;
      await configService.delete(filename);
      this.config = null;
      this.refreshConfigs();
    }
  },
  watch: {
    '$route.params.file': function(file) {
      this.swap(file);
    }
  },
  components: {
    ConfigsForm: () => import("./../components/configuration/configuration.form.vue")
  }
 
};
</script>


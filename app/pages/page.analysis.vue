<template>
    <div id="analysis">
      <div class="menu">
        <h2>Configurations</h2>
        <ul>
          <li v-if="loading">Please wait...</li>
          <li v-for="cfg in configs" v-bind:key="cfg.id" @click="swap(cfg.name)">
            <router-link :to="`/analysis/${cfg.name}`">{{cfg.name}}</router-link>
          </li>
        </ul> 
      </div>
      <div class='content'>
        <h1 v-if="config">{{config.label}}</h1>
          <button v-if="config" :disabled="testing" @click="setBaselines">
              Set Baseline 
          </button>
          <button v-if="config" :disabled="testing" @click="test">
              Test
          </button>
          <div v-if="error || errors.length" class="error">
            <p v-if="error">{{error}}</p>
            <ul v-if="errors.length">
              <li v-for="err in errors" :key="err.id">{{err.message}}</li>
            </ul>
          </div>
          <div v-if="progress.length">
            <ul>
              <li v-for="update in progress" :key="update.id" v-html="markup(update.message)" :class="decorate(update.message)"></li>
            </ul>
          </div>
          <div v-if="complete">
            <span v-if="diffs.length">Changes Detected.</span>
            <span v-if="!diffs.length">No Changes Detected.</span>
            <router-link :to="`/analysis/${config}/results`">View Results</router-link>
          </div>
      </div>  
    </div> 
</template>  

<script>
import { ServiceFactory } from './../api/serviceFactory';
import io from 'socket.io-client';

const configService = ServiceFactory.get('configs');
const socket = io('http://localhost:3000');

export default {
  data() {
    return {
        configs: [],
        config: null,
        loading: true,
        testing: false,
        diffs: [],
        error: false,
        errors: [],
        warnings: [],
        progress: [],
        complete: false
    }; 
  },
  created() {
      this.getConfigs();
      this.ioListen();
  },
  watch: {
    'this.$route.params.file': function(file) {
      this.swap(file);
    }
  },
  methods: { 
    async getConfigs() {
        const { data } = await configService.get();
        this.configs = data;
        this.loading = false;
        if (this.$route.params.file) {
          this.swap(this.$route.params.file);
        }
    },      
    swap(config) {
      this.reset();
      this.config = config;
    },
    reset() {
        this.errors = [];
        this.error = false;
        this.warnings = [];
        this.progress = [];
        this.diffs = [];
        this.complete = false;
    },
    async test() {   
      this.reset();
      this.testing = true;
      this.progress = [];
      socket.emit('start-test', { config: this.config, mode: false });       
    },
    async setBaselines() {
      this.reset();
      this.testing = true;
      this.progress = [];
      socket.emit('start-test', { config: this.config, mode: true });
    },
    decorate(update) {
      if (update.match(/Analyzing/)) {
        return "level-0";
      }
      if (update.match(/\-\-\|/)) {
        return "level-2";
      }
      if (update.match(/\-\|/)) {
        return "level-1";
      }
      if (update.match('Complete!')) {
        return "complete";
      }
      return "";
    },
    markup(update) {
      let type = this.decorate(update);
      let message = update;
      switch (type) {
        case "level-1":
          message = message.replace('-| ','');
          message = message.replace(/(http.*)/i,'<span>$1</span>')
          break;
        case "level-2":
          message = message.replace('--| ', '');
          break;
      }
      return message;
    },
    ioListen() {     
      let that = this; 
      socket.on('progress-update', function(data) {
        if (data) {
          if (typeof data === 'string') {
            that.progress.push({ message: data, id: that.progress.length });
          }
          if (data.warnings) {
            for (let warning of data.warnings) {
              that.progress.push({ message: warning, id: that.progress.length});
            }
          }
        }
      });
      socket.on('end-test', function(data) {
        that.testing = false;
        if (data) {
          if (data.error) {
            that.error = data.error;
            return;
          }
          if (data.errors) {
            for (let error of data.errors) {
              that.errors.push({ message: error, id: that.errors.length });
            }
            return;
          }
          that.progress.push({ message: 'Complete!', id: that.progress.length });
          if (data.diffs) {
            for (let i = 0; i < data.diffs.length; i++) {
              that.diffs.push({
                filename: data.diffs[i].case.image,
                path: data.diffs[i].case.path,
                viewport: data.diffs[i].case.viewport,
                capture: `/output/captures/new/${data.diffs[i].path}`,
                reference: `/output/captures/reference/${data.diffs[i].path}`
              });
              window.sessionStorage.removeItem('diffs');
              window.sessionStorage.setItem('diffs', JSON.stringify(that.diffs));
              that.complete = true;
            }
          }
          if (data.success) {
            if (data.analysis) {
              let captures = [];
              for (let testcase of data.analysis) {
                captures.push({
                  filename: testcase.image,
                  path: testcase.path,
                  viewport: testcase.viewport,
                  capture: `/output/captures/new/${testcase.website}/${testcase.path}/${testcase.viewport}/${testcase.image}`,
                  reference: `/output/captures/reference/${testcase.website}/${testcase.path}/${testcase.viewport}/${testcase.image}`
                });
              }
              window.sessionStorage.removeItem('diffs');
              window.sessionStorage.setItem('diffs', JSON.stringify(captures));
              that.complete = true;
            }
          }
        }
      });
    }
  }
}; 
</script>


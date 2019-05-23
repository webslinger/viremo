<template>
    <div id="config">
      <div v-if="config_source">
        <form-actions 
          :readonly.sync="readonly"
          :config_source.sync="config_source" 
          @edit="edit"
          @cancel="cancel"
          @save="save"
        />
        <h2 v-if="label"><input type="text" :readonly="readonly" v-model="label"></h2>
        <p v-if="url"><input type="text" :readonly="readonly" v-model="url"></p>
        <shell-control
          :data.sync="shell"
          :readonly.sync="readonly"
          @revert="shell = $event"
          @add="add($event)"
          @remove="remove($event)"
        />
        <viewport-control
          :data.sync="viewports" 
          :readonly.sync="readonly"
          @revert="viewports = $event"
          @add="add($event)"
          @remove="remove($event)"
        />
        <path-control 
          :data.sync="paths"
          :actions="actions"
          :readonly.sync="readonly"
          @revert="paths = $event"
          @add="add($event)"
          @remove="remove($event)"
        />
        <action-control 
          :data.sync="actions"
          :readonly.sync="readonly"
          :paths.sync="paths"
          @revert="actions = $event"
          @add="add($event)" 
          @remove="remove($event)"
        />          
      </div>
    </div>
</template>

<script>
import { ServiceFactory } from './../../../api/serviceFactory';
import ViewportControl from './configs.control.viewports.vue';
import PathControl from './configs.control.paths.vue';
import ActionControl from './configs.control.actions.vue';
import ShellControl from './configs.control.shell.vue';
import FormActions from './configs.form.actions.vue';
import { NewViewport, NewPath, NewAction } from './../../../classes'

const configService = ServiceFactory.get('configs');

export default { 
    data() {
      return {
        config_source: null,
        label: null,
        url: null,
        viewports: null,
        paths: null,
        shell: null,
        actions: null,
        readonly: true
      }
    },
    components: {
      ViewportControl, 
      PathControl, 
      ActionControl, 
      ShellControl, 
      FormActions
    },
    props: ['config'],
    created() {
      if (this.config) {
        this.init(this.config);
      }  
    },
    watch: {
      config: function(cfg) {
        this.init(cfg);
      }
    },
    methods: {
      init(cfg) {
        if (typeof cfg === "string") {
          this.getConfigContents(cfg);
        } else {
          this.applyConfig(cfg);
        }
      },
      async getConfigContents(cfg) {
        let configResponse = await configService.getConfig(cfg);
        this.applyConfig(configResponse.data);
      },
      applyConfig(cfg) {
        this.label = cfg.label;
        this.url = cfg.url;
        this.viewports = cfg.viewports;
        this.shell = cfg.shell;
        this.paths = cfg.paths;
        this.actions = cfg.actions;
        this.config_source = cfg;
      },
      edit() {
        this.readonly = false;
      },
      cancel() {
        this.readonly = "discard";
      },
      save() {
        this.readonly = true;
        this.$emit('save', this.config_source);
      },
      add(type) {
        if (typeof type === 'string') {
          switch (type) {
            case "path":
              this.paths.push(NewPath());
              this.paths[this.paths.length - 1].id = this.paths.length;
              break;
            case "viewport":
              this.viewports.push(NewViewport());
              this.viewports[this.viewports.length - 1].id = this.viewports.length;
              break;
            case "shell":
              this.shell.push({ value: 'New Selector', id: shell.length })
              break;
            case "action":
              this.actions.push(NewAction());
              this.actions[this.actions.length - 1].id = this.actions.length;
              break;
          }
        } else {
          for (let path of this.paths) {
            if (path.id == type.id) {
              switch (type.type) { 
                case "path_selector":
                  path.selectors.push({value: 'New Selector', id: path.selectors.length });
                  break;
                case "path_action":
                  for (let action of this.actions) {
                    if (action.id === type.aid) {
                      path.actions.push(action);
                    }
                  }
                  break;
              }
            }
          }
        }
      },
      remove(type) {
        switch (type.type) {
          case "path":
            this.removeItem(this.paths, type.id);
            break;
          case "path_selector":
            for (let path of this.paths) {
              if (path.id == type.pid) {
                this.removeItem(path.selectors, type.sid);
              }
            }
            break;
          case "viewport":
            this.removeItem(this.viewports, type.id);
            break;
          case "shell":
            this.removeItem(this.shell, type.id);
            break;
          case "action":
            this.removeItem(this.actions, type.id);
            break;
        }
      },
      removeItem(obj, id) {
        for (let i = 0; i < obj.length; i++) {
          if (obj[i].id === id) {
            obj = obj.splice(i,1);
          }
        }
      }
    }
};

</script>

<style>
#configs {
  font-size: 18px;
  font-family: 'Roboto', sans-serif;
}
#configs h2 input {
  font-size: 24px;
}
#config {
  font-size: 14px;
}
.config > div {
  padding: 12px;
  background: white;
  text-align: left;
}
.config h2 {
  text-transform: capitalize;
  margin: 0;
}
.config h3 {
  margin: 0;
  margin: 12px 0;
}
.config table {
  border-collapse: collapse;
  border: 1px solid lightgray;
  width: 100%;
}
.config td, .config th {
  padding: 6px;
}
.selector {
    display: inline-block;
    margin-right: 5px;
    font-size: 11px; 
    background: #f5f2f0;
    color: #690;
    box-shadow: 1px 1px 3px rgba(0,0,0,0.2);
    border-radius: 3px;
    padding: 3px;
}
.selector button {
  background: none;
}
.selector i.material-icons {
  font-size: 12px;
}
.selector input {
    border: 0;
    background: #f5f2f0;
    border-radius: 3px;
    font-size: 11px;
    color: #690;
    font-family: 'Courier New', Courier, monospace;
}

</style>


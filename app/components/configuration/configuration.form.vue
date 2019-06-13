<template>
  <div id="config">
    <div v-if="config_source">
      <form-actions
        :readonly.sync="readonly"
        :config_source.sync="config_source"
        :new_config.sync="new_config"
        @edit="edit"
        @cancel="cancel($event)"
        @save="save"
        @del="del"
      />
      <div><label><span>Name:</span> <input type="text" :readonly="readonly" v-model="config_source.label"></label></div>
      <div><label><span>URL:</span> <input type="text" :readonly="readonly" v-model="config_source.url"></label></div>
      <shell-control v-if="config_source.shell.length"
        :data.sync="config_source.shell"
        :readonly.sync="readonly"
        @revert="config_source.shell = $event"
        @add="add($event)"
        @remove="remove($event)"
      />
      <viewport-control
        :data.sync="config_source.viewports"
        :readonly.sync="readonly"
        @revert="config_source.viewports = $event"
        @add="add($event)"
        @remove="remove($event)"
      />
      <action-control
        :data.sync="config_source.actions"
        :readonly.sync="readonly"
        :paths.sync="config_source.paths"
        @revert="config_source.actions = $event"
        @add="add($event)"
        @remove="remove($event)"
      />
      <path-control
        :data.sync="config_source.paths"
        :actions="config_source.actions"
        :readonly.sync="readonly"
        @revert="config_source.paths = $event"
        @add="add($event)"
        @remove="remove($event)"
      />
    </div>
  </div>
</template>

<script>
import { ServiceFactory } from "./../../api/serviceFactory";
import ViewportControl from "./controls/control.viewports.vue";
import PathControl from "./controls/control.paths.vue";
import ActionControl from "./controls/control.actions.vue";
import ShellControl from "./controls/control.shell.vue";
import FormActions from "./form/form.actions.vue";
import { NewViewport, NewPath, NewAction } from "./../../app.classes";

const configService = ServiceFactory.get("configs");

export default {
  data() {
    return {
      config_source: null,
      readonly: true,
      new_config: false
    };
  },
  components: {
    ViewportControl,
    PathControl,
    ActionControl,
    ShellControl,
    FormActions
  },
  props: ["config"],
  created() {
    if (this.config) {
      this.init(this.config);
    }
  },
  watch: {
    config: function(cfg) {
      if (cfg) {
        this.init(cfg);
      } else {
        this.clear();
      }
    }
  },
  methods: {
    init(cfg) {
      if (typeof cfg === "string") {
        this.getConfigContents(cfg);
        this.readonly = true;
      } else {
        this.new_config = true;
        this.readonly = false;
        this.config_source = cfg;
      }
    },
    async getConfigContents(cfg) {
      let configResponse = await configService.getConfig(cfg);
      this.config_source = configResponse.data;
    },
    clear() {
      this.config_source = null;
    },
    edit() {
      this.readonly = false;
    },
    cancel($event) {
      this.readonly = "discard";
      if ($event.new_config) {
        this.clear();
        this.new_config = false;
      }
    },
    save() {
      this.readonly = true;
      this.$emit("save", { data: this.config_source });
    },
    del() {
      this.readonly = true;
      this.$emit("del");
    },
    add(type) {
      if (typeof type === "string") {
        switch (type) {
          case "path":
            this.config_source.paths.push(NewPath());
            this.config_source.paths[this.config_source.paths.length - 1].id = this.paths.length;
            break;
          case "viewport":
            this.config_source.viewports.push(NewViewport());
            this.config_source.viewports[
              this.config_source.viewports.length - 1
            ].id = this.config_source.viewports.length;
            break;
          case "shell":
            this.config_source.shell.push({ value: "New Selector", id: shell.length });
            break;
          case "action":
            this.config_source.actions.push(NewAction());
            this.config_source.actions[this.config_source.actions.length - 1].id = this.actions.length;
            break;
        }
      } else {
        for (let path of this.config_source.paths) {
          if (path.id == type.pid) {
            switch (type.type) {
              case "path_selector":
                path.selectors.push({
                  value: "New Selector",
                  id: path.selectors.length
                });
                break;
              case "path_action":
                console.log(type);
                path.actions.push(type.aid);
                break;
            }
          }
        }
      }
    },
    remove(type) {
      switch (type.type) {
        case "path":
          this.removeItem(this.config_source.paths, type.id);
          break;
        case "path_selector":
          for (let path of this.config_source.paths) {
            if (path.id == type.pid) {
              this.removeItem(path.selectors, type.sid);
            }
          }
          break;
        case "viewport":
          this.removeItem(this.config_source.viewports, type.id);
          break;
        case "shell":
          this.removeItem(this.config_source.shell, type.id);
          break;
        case "action":
          this.removeItem(this.config_source.actions, type.id);
          break;
      }
    },
    removeItem(obj, id) {
      for (let i = 0; i < obj.length; i++) {
        if (obj[i].id === id) {
          obj = obj.splice(i, 1);
        }
      }
    }
  }
};
</script>


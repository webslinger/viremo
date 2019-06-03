<template>
  <div id="controls">
    <h2>{{config_source.label}}</h2>
    <button v-if="!readonly" class="done" v-on:click="save">Save</button>
    <button v-on:click="switch_mode">{{(readonly) ? 'Edit' : 'Cancel'}}</button>
    <button v-if="!new_config" @click="remove">Delete</button>
    <div class="validator" :class="{ invalid: !validated }">
      {{(validated) ? 'Valid' : 'Invalid'}}
      <i
        class="material-icons"
      >{{(validated) ? 'checked' : 'close'}}</i>
    </div>
    <transition name="fade">
      <div class="errors" v-if="message">{{message}}</div>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      validated: true,
      message: null
    };
  },
  props: ["readonly", "config_source", "new_config"],
  methods: {
    validate() {
      if (typeof this.config_source !== "object") return false;

      let message = null;
      let requiredProperties = ["url", "label", "shell", "paths", "viewports"];

      for (let prop of requiredProperties) {
        if (this.config_source.hasOwnProperty(prop)) continue;
        message = `Missing Property: ${prop}`;
      }

      if (
        !this.config_source.viewports.length ||
        !this.config_source.paths.length
      ) {
        message = "At least 1 path and viewport are required.";
      }

      if (!this.config_source.url.match(/http[s]*:/i)) {
        message = "Invalid URL.";
      }

      for (let viewport of this.config_source.viewports) {
        if (
          !viewport.label ||
          isNaN(viewport.width) ||
          isNaN(viewport.height) ||
          !viewport.width ||
          !viewport.height
        ) {
          message = "Invalid Viewport Configuration.";
        }
      }

      for (let path of this.config_source.paths) {
        if (!path.label || !path.path) {
          message = "Invalid Path Configuration.";
        } else if (!path.shell && !path.selectors.length) {
          message = "Useless path specified. No captures.";
        }
      }
      this.message = message;
      if (message) {
        return false;
      }
      return true;
    },
    switch_mode() {
      if (this.readonly) {
        this.$emit("edit");
        return;
      }
      this.$emit("cancel", { new_config: this.new_config });
    },
    save() {
      this.$emit("save");
    },
    async remove() {
      let confirmed = await confirm(
        "Are you sure you want to delete this config?"
      );
      if (confirmed) this.$emit("del");
    }
  },
  created() {
    if (this.config_source) {
      this.validated = this.validate();
    }
  },
  watch: {
    "config_source": {
      handler: function(value) {
        this.validated = this.validate();
      },
      deep: true
    }
  }
};
</script>


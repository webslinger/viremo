<template>
    <div id="controls">
        <button v-if="!readonly" class="done" v-on:click="save">Save</button>
        <button v-on:click="switch_mode">{{(readonly) ? 'Edit' : 'Cancel'}}</button>
        <button class="validator" v-bind:disabled="validated" v-on:click="validate">
            <span>
                {{(validated) ? 'Valid' : 'Invalid'}}
                <i class="material-icons">
                    {{(validated) ? 'checked' : 'close'}}
                </i>
            </span>
        </button>
        <div class="errors" v-if="message">{{message}}</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            validated: true,
            changed: false,
            message: null,
        }
    },
    props: ['readonly','config_source'],
    methods: {
        validate() {
            if (typeof this.config_source !== "object")
                return false;

            let requiredProperties = [
                'url','label','shell',
                'paths','viewports'
            ];

            for (let prop of requiredProperties) {
                if (this.config_source.hasOwnProperty(prop))
                    continue;
                this.message = `Missing Property: ${prop}`;
                return false;
            }

            if (!this.config_source.viewports.length ||
                !this.config_source.paths.length) {
                this.message = "At least 1 path and viewport are required.";
                return false;
            }

            if (!this.config_source.url.match(/http[s]*:/i)) {
                this.message = "Invalid URL.";
                return false;
            }

            for (let viewport of this.config_source.viewports) {
                if (!viewport.label ||
                    isNaN(viewport.width) ||
                    isNaN(viewport.height)) {
                        this.message = "Invalid Viewport Configuration.";
                        return false;
                    }
            }

            for (let path of this.config_source.paths) {
                if (!path.label || !path.path) {
                    this.message = "Invalid Path Configuration.";
                    return false;
                }
            }

            this.message = null;
            return true;
        },
        switch_mode() {
            if (this.readonly) {
                this.$emit('edit'); 
                return;
            }
            this.$emit('cancel');
        },
        save() {
            if (this.validate()) {
                this.$emit('save');
            }
        }
    },
    created() {
        if (this.config_source) {
            this.validated = this.validate();
        }
    },
    watch: {
        config_source: function(value) {
            console.log('we need to validate');
        }
    }
}; 
</script>
    
<style>
    #controls {
        text-align: right;
        padding-bottom: 12px;
        margin-bottom: 12px;
        border-bottom: 1px solid black;
    }
    button.done { float: left; }
    button {
        border: 1px solid black;
        border-radius: 3px;
        padding: 5px 10px;
        font-weight: bold;
        background: white;
        cursor: pointer;
    }
    button[disabled] {
        border-color: grey;
        cursor: default;
    }
    button i.material-icons {
        font-size: 14px;
        vertical-align: middle;
        display: inline-block;
        width: 14px;
    }
    button.validator {
        border-color: red;
        color: red;
    }
    button[disabled].validator {
        color: green;
        border-color: green;
    }
    button[disabled] i.material-icons {
        color: green;
    }
</style>


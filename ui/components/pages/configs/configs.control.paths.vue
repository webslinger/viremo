<template>
    <div id="paths" v-if="data">
        <h3>Paths</h3>
        <table>
        <thead>
            <tr><th>Label</th><th>Path</th><th>Selectors</th><th v-bind:colspan="(readonly) ? '1' : '2'">Actions</th></tr>
        </thead>
        <tbody>
            <template v-for="path in data">
            <tr v-bind:key="path.id">
                <td><input type="text" v-bind:readonly="readonly" v-model="path.label"></td>
                <td><input type="text" v-bind:readonly="readonly" v-model="path.path"></td>
                <td class="selectors">
                    <label class="selector" v-for="selector in path.selectors" :key="selector.id">
                        <input type="text" :size="selector.value.length + 1" :readonly="readonly" v-model="selector.value">
                        <button v-if="!readonly" @click="removePathselector(path.id, selector.id)">
                            <i class="material-icons">close</i>
                        </button>
                    </label>
                    <button v-if="!readonly" @click="addPathselector(path.id)">
                        <i class="material-icons">add</i>
                    </button>
                </td>
                <td>
                    <label v-for="action_id in path.actions" :key="action_id">
                        {{actions[action_id].label}}
                        <button v-if="!readonly" @click="removePathAction(path.id, action.id)">
                            <i class="material-icons">close</i>
                        </button>
                    </label>
                </td>
                <td v-if="!readonly"><button v-bind:disabled="data.length <= 1" @click="remove(path.id)"><i class="material-icons">close</i></button></td>
            </tr>
            <tr v-bind:key="path.id + '_b'">
                <td v-bind:colspan="(readonly) ? '4' : '5'">
                    <label>Use Persistent Selectors?<input type="checkbox" v-bind:disabled="readonly" v-model="path.shell"></label>
                    <div>
                        <select v-model="addAction" :disabled="readonly">
                            <option :value="null">Actions</option>
                            <option v-for="action in actions" :disabled="actionExists(path.id, action.id)" :value="action.id" :key="action.id">{{action.label}}</option>
                        </select> 
                        <button v-if="!readonly" @click="addPathAction(path.id, addAction)">
                            Add Path Action <i class="material-icons">add</i>
                        </button> 
                    </div> 
                </td>
            </tr>
            </template>
        </tbody>
        <tfoot>
            <tr>
                <td v-bind:colspan="(readonly) ? '4' : '5'">
                    <button v-if="!readonly" @click="add()">Add Path</button>
                </td>
            </tr>
        </tfoot>
        </table>
    </div>
</template>

<script>
import ConfigsControl from './configs.control.vue';
export default {
    extends: ConfigsControl,
    data() {
        return {
            addAction: null
        }
    },
    props: ['actions'],
    created() {
        this.type = "path";
    },
    methods: {
        addPathselector(id) {
            this.$emit('add', { type: 'path_selector', id: id });
        },
        removePathselector(pid, sid) {
            this.$emit('remove', { type: 'path_selector', pid: pid, sid: sid })
        },
        addPathAction(pid, aid) {
            this.$emit('add', { type: 'path_action', pid: pid, aid: aid });
        },
        removePathAction(pid, aid) {
            this.$emit('remove', { type: 'path_action', pid: pid, aid: aid })
        },
        actionExists(pid, aid) {
            let current_path = null;
            let exists = false;
            findPath:
            for (let path of this.data) {
                if (path.id === pid) {
                    current_path = path;
                    break findPath;
                }
            }            
            findAction:
            for (let action of current_path.actions) {
                if (action.id === aid) {
                    exists = true;
                    break findAction;
                }
            }
            return exists;
        }
    }
}; 
</script>

<style>
    table button {
        padding: 0;
        border: 0;
        color: black;
        font-weight: normal;
    }
    td {
        vertical-align: top;
    }
    h3 button {
        float: right;
        border: none;
    }
    .selectors i.material-icons {
        font-size: 18px;
    }
    table label {
        font-size: 12px;
        font-weight: bold;
    }
    table label input {
        vertical-align: middle;
    }
</style>


<template>
    <div id="paths" v-if="data">
        <h3>Paths</h3>
        <table>
        <thead>
            <tr><th>Label</th><th>Path</th><th>Selectors</th><th :colspan="(readonly) ? '1' : '2'">Use Shell</th></tr>
        </thead>
        <tbody>
            <template v-for="(path, index) in data">
            <tr v-bind:key="path.id" :class="{odd: (index+1)%2}">
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
                        Add Selector
                    </button>
                </td>
                <td><input type="checkbox" v-bind:disabled="readonly" v-model="path.shell"></td>
                <td v-if="!readonly"><button v-bind:disabled="data.length <= 1" @click="remove(path.id)"><i class="material-icons">close</i></button></td>
            </tr>
            <tr v-bind:key="path.id + '_b'" :class="{odd: (index+1)%2}">
                <td v-bind:colspan="(readonly) ? '4' : '5'">
                    <div>
                        <h4>Actions</h4>
                        <label v-for="action in actions" :key="action.id">
                            <input type="checkbox" :disabled="readonly" :checked="isInPath(action.id, path)" @change="managePathAction($event, action.id, path)"> {{action.label}}
                        </label>
                    </div>
                </td>
            </tr>
            </template>
        </tbody>
        <tfoot v-if="!readonly">
            <tr>
                <td colspan="5">
                    <button v-if="!readonly" @click="add()">Add Path</button>
                </td>
            </tr>
        </tfoot>
        </table>
    </div>
</template>

<script>
import ConfigControl from './_control.vue';
export default {
    extends: ConfigControl,
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
            this.$emit('add', { type: 'path_selector', pid: id });
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
        isInPath(aid, path) {
            for (let i = 0; i < path.actions.length; i++) {
                if (aid == path.actions[i]) {
                    return true;
                }
            }
            return false;
        },
        managePathAction($event, action, path) {
            if ($event.target.checked) {
                this.addPathAction(path.id, action);
            } else {
                this.removePathAction(path.id, action);
            }
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


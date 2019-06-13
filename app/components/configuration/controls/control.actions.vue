<template>
    <div id="events" v-if="data">
        <h3>Actions</h3>
        <table>
        <thead v-if="data.length">
            <tr><th>Type</th><th>Label</th><th>Selector</th><th v-bind:colspan="(readonly) ? '1' : '2'">Delay</th></tr>
        </thead>
        <tbody v-if="data.length">
            <tr v-for="action in data" v-bind:key="action.id">
                <td>
                    <select v-model="action.event" v-bind:disabled="readonly">
                        <option value="hover">Hover</option>
                        <option value="click">Click</option>
                        <option value="focus">Focus</option>
                        <option value="tap">Tap</option>
                    </select>
                </td>
                <td><input type="text" v-bind:readonly="readonly" v-model="action.label" /></td>
                <td>
                    <label class="selector">
                        <input type="text" v-bind:size="(action.selector) ? action.selector.length + 1 : 20" v-bind:readonly="readonly" v-model="action.selector">
                    </label>
                </td>
                <td>{{action.wait}}</td>
                <td v-if="!readonly">
                    <button @click="remove(action.id)">
                        <i class="material-icons">close</i>
                    </button>
                </td>
            </tr>    
        </tbody>
        <tfoot v-if="!readonly">
            <tr>
                <td colspan="5">
                    <button v-if="!readonly" @click="add">Add Action</button>
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
    created() {
        this.type = "action";
    }
}; 
</script>

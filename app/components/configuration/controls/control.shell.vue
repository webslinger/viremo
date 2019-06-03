<template>
    <div id="shell" v-if="data">
        <h3>Persistent Selectors</h3>
        <table>
            <tbody>
                <tr>
                    <td class="selectors">
                        <label class="selector" v-for="selector in data" v-bind:key="selector.id">
                            <input type="text" v-bind:size="selector.value.length + 1" v-bind:readonly="readonly" v-model="selector.value">
                            <button v-if="!readonly" @click="remove(selector.id)">
                                <i class="material-icons">close</i>
                            </button>
                        </label>
                        <button v-if="!readonly" @click="add">
                            Add Selector
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import ConfigControl from './_control.vue';
export default {
    extends: ConfigControl,
    created() {
        this.type = "shell"
    }
}; 
</script>

<script>
export default {
    data() {
        return {
            tmp: null, 
            type: null
        }
    },
    props: ['data','readonly'],
    methods: {
        revert() {
            this.$emit('revert',this.tmp);
        },
        backup() {
            this.tmp = JSON.parse(JSON.stringify(this.data));
        },
        add() {
            this.$emit('add',this.type);
        },
        remove(id) {
            this.$emit('remove', { type: this.type, id: id})
        }
    },
    watch: {
        readonly: function(value) {
            if (value == 'discard') {
                return this.revert();
            }
            if (value === false) {
                return this.backup();
            }
        }
    }
}
</script>

import Service from "./service";

const resource = "/configs";

export default {
    get() {
        return Service.get(`${resource}`);
    },
    getConfig(config) {
        return Service.get(`${resource}/${config}`)
    }
}
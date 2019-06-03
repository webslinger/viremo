import Service from "./service";

const resource = "/configs";

export default {
    get() {
        return Service.get(`${resource}`);
    },
    getConfig(config) {
        return Service.get(`${resource}/${config}`)
    },
    save(config,contents) {
        let data = {
            file: config,
            contents: contents
        }
        return Service.put(`${resource}/save`, null, {
            headers: {"Content-Type": "application/json"},
            params: data
        });
    },
    delete(config) {
        return Service.delete(`${resource}/delete/${config}`)
    }
}
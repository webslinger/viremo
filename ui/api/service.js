import axios from "axios";

const baseDomain = "http://localhost:3000";
const baseURL = `${baseDomain}/v1`;

export default axios.create({
    baseURL
});
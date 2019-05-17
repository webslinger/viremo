import ConfigService from "./configService";

const services = {
    configs: ConfigService
};

export const ServiceFactory = {
    get: name => services[name]
};
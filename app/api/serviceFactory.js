import ConfigurationService from "./configurationService";

const services = {
    configs: ConfigurationService
};

export const ServiceFactory = {
    get: name => services[name]
};
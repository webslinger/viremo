class Config {
    constructor() {
        this.label = "New Config",
        this.url = "https://...",
        this.viewports = [new Viewport('Desktop')],
        this.paths = [new Path('Home','/',true)],
        this.shell = [],
        this.actions = [],
        this.custom = true
    }
}
class Path {
    constructor(label = null, path = null, shell = null) {
        this.label = label;
        this.path = path;
        this.shell = shell;
        this.elements = [];
        this.actions = [];
    }
}

class Viewport {
    constructor(label = null) {
        this.label = label;
        this.width = 1024;
        this.height = 768;
    }
}

class Action {
    constructor() {
        this.event = null;
        this.label = null;
        this.selector = null;
        this.wait = 200;
    }
}

export const NewConfig = () => {
    return new Config();
}

export const NewAction = () => {
    return new Action();
}

export const NewViewport = () => {
    return new Viewport();
}

export const NewPath = () => {
    return new Path();
}
const config = require('viremo-cli').config;module.exports = config.custom('viremo','http://localhost:3000',[{"label":"desktop","width":1024,"height":768,"id":0},{"label":"mobile","width":375,"height":640,"id":1}],[{"label":"homepage","path":"/","shell":true,"selectors":[],"actions":[],"id":0},{"label":"configuration","path":"/#/configuration/viremo.js","shell":true,"selectors":[{"value":"#controls","id":0},{"value":"#shell","id":1},{"value":"#viewports","id":2},{"value":"#paths","id":3},{"value":".menu","id":4}],"actions":[0],"id":1},{"label":"analysis","path":"/#/analysis","shell":true,"selectors":[{"value":".menu","id":0}],"actions":[],"id":2}],[{"event":"click","label":"Switch to Edit Mode","selector":"#controls button:nth-child(2)","wait":200,"id":0}],[{"value":"#viremo header","id":0},{"value":"#viremo nav","id":1}]);
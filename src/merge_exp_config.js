/**
 * 实验配置的merge工具
 * 把所有layer的实验合并成一个文件，用于发布在页面上
 *
 * 实验号规范：
 *     实验号需要有个明确的规范，便于实验数据统计
 *     比如：
 *         每层的实验号以[ab][xy]来命名，如 0512
 *         ab为层号，即05
 *         12为层内实验编号，即12
 */

let defaultConfig = require('./exp_config/default_config.js');
let layer01Config = require('./exp_config/layer01.js');
let layer02Config = require('./exp_config/layer02.js');
let layer03Config = require('./exp_config/layer03.js');

let expConfig = {
    defaultConfig: defaultConfig,
    layerConfig: [
        layer01Config,
        layer02Config,
        layer03Config
    ]
};

// window['globalExpConfigKey'] = window['globalExpConfigKey'] || expConfig;

module.exports = expConfig;


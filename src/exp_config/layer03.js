/**
 * 实验配置
 * 03层
 */

let fingerPrint = '03';

let config = [{
    name: '试验号03层01',
    flow: [0, 0],
    mode: 1000,
    type: 'cookie',
    fingerPrint: fingerPrint,
    override: [{
        flagName: 'isWoo',
        value: false
    }]
}, {
    name: '试验号03层01',
    flow: [0, 1000],
    mode: 1000,
    type: 'cookie',
    fingerPrint: fingerPrint,
    override: [{
        flagName: 'isWoo',
        value: true
    }]
}];

module.exports = config;

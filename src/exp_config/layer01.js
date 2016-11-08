/**
 * 实验配置
 * 01层
 */

let fingerPrint = '01';

let config = [{
    // 比如：0101
    name: '试验号01层01',
    flow: [0, 500],
    mode: 1000,
    type: 'cookie',
    fingerPrint: fingerPrint,
    override: []
}, {
    // 比如0102
    name: '试验号01层02',
    flow: [500, 1000],
    mode: 1000,
    type: 'cookie',
    fingerPrint: fingerPrint,
    override: []
}];

module.exports = config;

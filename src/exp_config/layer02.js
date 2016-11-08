/**
 * 实验配置
 * 02层
 */

let fingerPrint = '02';

let config = [{
    name: '试验号02层01',
    flow: [0, 100],
    mode: 1000,
    type: 'cookie',
    fingerPrint: fingerPrint,
    override: [{
        condition: '条件key',
        arg: '条件value',
        // 比如：useBigFont
        flagName: '实验开关',
        value: false
    }]
}, {
    name: '试验号02层01',
    flow: [100, 200],
    mode: 1000,
    type: 'cookie',
    fingerPrint: fingerPrint,
    override: [{
        condition: 'network',
        arg: 'wifi',
        flagName: 'isFoo',
        value: true
    }]
}];

module.exports = config;

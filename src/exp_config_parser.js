/**
 * 实验模块
 * 
 * cookie操作使用过的是 jquery-cookie
 *     https://github.com/carhartl/jquery-cookie
 */

const $ = require('jquery');
const _ = require('lodash');
const md5 = require('md5');

const appConfig = require('./app_config.js');
const expConfig = require('./merge_exp_config.js');

class ExpConfigParser {

    constructor() {
        // 实验框架是否被初始化
        this.isInitialized = false;
        // app的配置
        this.appConfig = appConfig;
        // 原始的配置
        this.originalConfig = expConfig;
        // 解析后的配置
        this.config = null;
        // 命中的实验号列表
        this.hitExps = [];
        // 用户的cookie id的key
        this.cookieId = 'EXP_ADAPTER_COOKIE';
    }

    isInit() {
        return this.isInitialized === true;
    }

    /**
     * 拉取原始的实验配置内容
     * 目前实验配置放在 html>head 里，所以不需要发起网络请求
     */
    fetchExpConfig() {
        // this.originalConfig = expConfig;
    };

    /**
     * 检查实验配置是否合法
     * @return {boolean} 合法 true，不合法 false
     */
    checkConfig() {
        /**
         * 暂不实现
         * 如果 this.originalConfig 不合法，则需要 this.originalConfig = null;
         */

        return true;
    };

    /**
     * 检查实验配置是否合法
     * @return {boolean} 合法 true，不合法 false
     */
    checkConfig() {
        /**
         * 暂不实现
         * 如果 this.originalConfig 不合法，则需要 this.originalConfig = null;
         */

        return true;
    };

    /**
     * 解析实验配置
     * @return {boolean} 解析成功 true，解析失败 false
     */
    parseConfig() {
        if (!this.originalConfig) {
            return false;
        }
        if (!this.checkConfig()) {
            return false;
        }

        // 用默认配置初始化
        this.config = _.extend({}, this.originalConfig.defaultConfig);

        // 此时配置已经初始化
        this.isInitialized = true;
        return true;
    };

    /**
     * 生成cookie字符串，16进制字符组成
     * @param  {number} cookieLen cookie值的长度
     */
    genCookie(cookieLen) {
        let retCookieStr = '';
        // 防止死循环，设置的最大循环数保险
        let loopMaxNum = 10;
        while (retCookieStr.length < cookieLen && loopMaxNum > 0) {
            retCookieStr += Math.random().toString(16).slice(2);
            loopMaxNum -= 1;
        }
        // 经过最大循环数之后，避免字符数不够，强制检查一下，不够头部补0
        loopMaxNum = cookieLen - retCookieStr.length;
        // 该逻辑最多只调用一次，因此忽略字符串+的性能消耗
        while (loopMaxNum > 0) {
            retCookieStr = '0' + retCookieStr;
            loopMaxNum -= 1;
        }

        return retCookieStr.substr(0, cookieLen);
    };

    /**
     * 种cookie的逻辑
     * @param  {string} cookieValue cookie的值
     */
    growCookie(cookieValue) {
        // 使用JQuery默认的cookie设置
        // 注：如果制定了非默认配置，则删除cookie时，需要指明相同的非默认配置
        $.cookie(this.cookieId, cookieValue);
    };

    /**
     * 把cookie的字符串转化为int值，类似于hash算法
     * @param  {string} cookieStr cookie字符串
     * @param  {string} fingerPrint 混淆字符串，一般用每一层的fingerPrint
     * @param  {number} stepLen   hash时候的步长，返回值 % Math.pow(10, stepLen)，默认4
     * @return {number}           hash后得到的int值
     */
    hashCookieToInt(cookieStr, fingerPrint, stepLen) {
        cookieStr = cookieStr || '';
        fingerPrint = fingerPrint || '';
        stepLen = stepLen || 4;

        cookieStr = md5(fingerPrint + cookieStr + fingerPrint);

        let retInt = 0;
        let mod = Math.pow(10, stepLen);
        let cookieLen = cookieStr.length;

        for (let i = 0; i < cookieLen; i += stepLen) {
            let intVal = parseInt(cookieStr.substr(i, stepLen), 16);
            if (!_.isNumber(intVal)) {
                continue;
            }
            retInt = (retInt + intVal) % mod;
        }

        return retInt;
    };

    /**
     * 开始做实验
     * 根据实验配置 和 用户特征，来命中实验
     */
    doExp() {
        if (!this.originalConfig) {
            return;
        }

        // 获取用户的cookie，用它来做实验的随机种子
        let cookieStr = $.cookie(this.cookieId);
        // 如果获取失败，可能是因为用户第一次访问
        // 给用户种一个cookie
        if (!cookieStr) {
            this.growCookie(this.genCookie(32));
        }
        // 重新获取一下cookie
        // 为了防止种cookie失败，导致用户会随机命中实验
        cookieStr = $.cookie(this.cookieId);

        if (!cookieStr) {
            // 浏览器可能禁用了cookie
            return;
        }

        // 遍历每个层
        _.each(this.originalConfig.layerConfig, (expLayer, key) => {
            if (this.appConfig.isDebug()) {
                // console.log(expLayer);
            }
            // 当前层是否找到了对应实验的flow满足条件
            let isHitCurrentLayer = false;
            // 每一层的cookie+fingerPrint hash 出来的 int值，用来生成seed
            let cookieInt = null;

            // 遍历当前层的所有实验
            _.each(expLayer, (expItem, key) => {
                if (this.appConfig.isDebug()) {
                    // console.log(expItem);
                }
                // 一个层，只会有一个实验满足条件，所以后面的不需要再遍历了
                // 加快遍历速度
                if (isHitCurrentLayer) {
                    return;
                }

                // 获得cookieInt，一层内的cookieInt一定是相同的（因为fingerPrint相同）
                // 所以只计算一次
                if (_.isNull(cookieInt)) {
                    cookieInt = this.hashCookieToInt(cookieStr, expItem.fingerPrint);
                }

                // 获取 实验的命中区间 [a, b)
                let a = expItem.flow[0];
                let b = expItem.flow[1];
                let seed = cookieInt % parseInt(expItem.mode || 1000, 10);

                // 如果没有命中该试验，则直接跳过
                if (seed < a || seed >= b) {
                    return;
                }
                // 找到了实验flow满足seed
                isHitCurrentLayer = true;

                // 过滤后的override，因为有condition，所以需要过滤
                let filteredOverride = {};
                // 过滤override
                _.each(expItem.override, (overrideItem, key) => {
                    if (!_.isUndefined(overrideItem.condition)
                        && overrideItem.arg !== this.appConfig.get(overrideItem.condition)
                    ) {
                        return;
                    }
                    filteredOverride[overrideItem.flagName] = overrideItem.value;
                });

                _.extend(this.config, filteredOverride);
                this.hitExps.push(expItem.name);

            });

        });
    };

    /**
     * 根据key获取配置
     * @param  {string} key     配置的key
     * @param  {*} defaultValue 如果没有该配置，应该返回的值
     * @return {*}              配置值
     */
    get(key, defaultValue) {
        let value = this.config[key];

        if (_.isUndefined(value)) {
            return defaultValue;
        }
        return value;
    };

    /**
     * 获取命中实验的exp列表，用来发送日志统计
     * @return {string} 实验号列表，多个实验用 _ 分割，如：23_45
     */
    getExpList() {
        return this.hitExps.join('_');
    };

    /**
     * 实验框架入口函数
     */
    main() {
        this.fetchExpConfig();

        if (!this.parseConfig()) {
            return;
        }
        this.doExp();
        if (this.appConfig.isDebug()) {
            console.log(this.hitExps);
        }
    };
}


let parser = new ExpConfigParser();
parser.main();

module.exports = parser;


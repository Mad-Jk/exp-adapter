/**
 * 当前app的配置
 */

class AppConfig {
    constructor() {
        this.config = {
            // 对应exp_config/layer*.js里的 condition [条件key]
            network: 'wifi',
            debug: true
        };
    }

    get(key, defaultValue) {
        let value = this.config[key];

        if (value === undefined) {
            return defaultValue;
        }
        return value;
    }

    isDebug() {
        return this.get('debug') === true;
    }
}

let appConfig = new AppConfig();

module.exports = appConfig;

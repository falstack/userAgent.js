function getUserAgent(ua) {
    "use strict";

    var userAgentRules = {
        browser: [{
            criteria: "PhantomJS",
            identity: "PhantomJS"
        }, {
            criteria: /Edge/,
            identity: "Edge",
            versionSearch: "Edge"
        }, {
            criteria: /MSIE|Trident|Windows Phone/,
            identity: "IE",
            versionSearch: "IEMobile|MSIE|rv"
        }, {
            criteria: /SAMSUNG|SamsungBrowser/,
            identity: "SBrowser",
            versionSearch: "Chrome"
        }, {
            criteria: /Chrome|CriOS/,
            identity: "Chrome"
        }, {
            criteria: /Android/,
            identity: "default"
        }, {
            criteria: /iPhone|iPad/,
            identity: "Safari",
            versionSearch: "Version"
        }, {
            criteria: "Apple",
            identity: "Safari",
            versionSearch: "Version"
        }, {
            criteria: "Firefox",
            identity: "Firefox"
        }],
        os: [{
            criteria: /Windows Phone|Windows NT/,
            identity: "Window",
            versionSearch: "Windows Phone|Windows NT"
        }, {
            criteria: "Windows 2000",
            identity: "Window",
            versionAlias: "5.0"
        }, {
            criteria: /iPhone|iPad/,
            identity: "iOS",
            versionSearch: "iPhone OS|CPU OS"
        }, {
            criteria: "Mac",
            versionSearch: "OS X",
            identity: "MAC"
        }, {
            criteria: /Android/,
            identity: "Android"
        }],

        webview: [{
            criteria: /iPhone|iPad/,
            browserVersionSearch: "Version",
            webviewBrowserVersion: /-1/
        }, {
            criteria: /iPhone|iPad|Android/,
            webviewToken: /NAVER|DAUM|; wv/

        }],
        defaultString: {
            browser: {
                version: "-1",
                name: "default"
            },
            os: {
                version: "-1",
                name: "unknown"
            }
        }
    };

    function getBrowserName(browserRules) {
        return getIdentityStringFromArray(
            browserRules,
            userAgentRules.defaultString.browser
        );
    }

    function getBrowserVersion(browserName) {
        var browserVersion;
        var versionToken;

        if (!browserName) {
            return;
        }
        versionToken = getBrowserRule(browserName).versionSearch || browserName;
        browserVersion = extractBrowserVersion(versionToken, ua);
        return browserVersion;
    }

    function extractBrowserVersion(versionToken, ua) {
        var browserVersion = userAgentRules.defaultString.browser.version;
        var versionIndex;
        var versionTokenIndex;
        var versionRegexResult =
            (new RegExp("(" + versionToken + ")", "i")).exec(ua);

        if (!versionRegexResult) {
            return browserVersion;
        }

        versionTokenIndex = versionRegexResult.index;
        versionToken = versionRegexResult[0];
        if (versionTokenIndex > -1) {
            versionIndex = versionTokenIndex + versionToken.length + 1;
            browserVersion = ua.substring(versionIndex)
                .split(" ")[0]
                .replace(/_/g, ".")
                .replace(/\;|\)/g, "");
        }
        return browserVersion;
    }

    function getOSName(osRules) {
        return getIdentityStringFromArray(
            osRules,
            userAgentRules.defaultString.os
        );
    }

    function getOSVersion(osName) {
        var osRule = getOSRule(osName) || {};
        var defaultOSVersion = userAgentRules.defaultString.os.version;
        var osVersion;
        var osVersionToken;
        var osVersionRegex;
        var osVersionRegexResult;
        if (!osName) {
            return;
        }
        if (osRule.versionAlias) {
            return osRule.versionAlias;
        }
        osVersionToken = osRule.versionSearch || osName;
        osVersionRegex =
            new RegExp(
                "(" + osVersionToken + ")\\s([\\d_\\.]+|\\d_0)",
                "i"
            );

        osVersionRegexResult = osVersionRegex.exec(ua);
        if (osVersionRegexResult) {
            osVersion = osVersionRegex.exec(ua)[2].replace(/_/g, ".")
                .replace(/\;|\)/g, "");
        }
        return osVersion || defaultOSVersion;
    }

    function getOSRule(osName) {
        return getRule(userAgentRules.os, osName);
    }

    function getBrowserRule(browserName) {
        return getRule(userAgentRules.browser, browserName);
    }

    function getRule(rules, targetIdentity) {
        var criteria;
        var identityMatched;

        for (var i = 0, rule; rule = rules[i]; i++) {
            criteria = rule.criteria;
            identityMatched =
                new RegExp(rule.identity, "i").test(targetIdentity);
            if (criteria ?
                identityMatched && isMatched(ua, criteria) :
                    identityMatched) {
                return rule;
            }
        }
    }

    function getIdentityStringFromArray(rules, defaultStrings) {
        for (var i = 0, rule; rule = rules[i]; i++) {
            if (isMatched(ua, rule.criteria)) {
                return rule.identity || defaultStrings.name;
            }
        }
        return defaultStrings.name;
    }

    function isMatched(base, target) {
        return target &&
        target.test ? !!target.test(base) : base.indexOf(target) > -1;
    }

    function isWebview() {
        var webviewRules = userAgentRules.webview;
        var ret = false;
        var browserVersion;

        for (var i = 0, rule; rule = webviewRules[i]; i++) {
            if (!isMatched(ua, rule.criteria)) {
                continue;
            }

            browserVersion =
                extractBrowserVersion(rule.browserVersionSearch, ua);

            if (isMatched(ua, rule.webviewToken) ||
                isMatched(browserVersion, rule.webviewBrowserVersion)) {
                ret = true;
                break;
            }
        }

        return ret;
    }

    var agent = {
        os: {},
        browser: {}
    };
    agent.browser.name = getBrowserName(userAgentRules.browser);
    agent.browser.version = getBrowserVersion(agent.browser.name);
    agent.os.name = getOSName(userAgentRules.os);
    agent.os.version = getOSVersion(agent.os.name);
    agent.browser.webview = isWebview();

    agent.browser.name = agent.browser.name.toLowerCase();
    agent.os.name = agent.os.name.toLowerCase();

    return agent;
}
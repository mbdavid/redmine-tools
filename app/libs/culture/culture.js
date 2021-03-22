//
// Culture.js - javascript culture extensions - Date/Number parser/formatter
//

// preciso adicionar parserDate com local/utc e .ffff -timezoneOffset

const Culture = (function (window, undefined) {

    const languages = {
        'enus': {
            lang: 'en-US',
            date: {
                patterns: ['M/d', 'M/d/y', 'h:m', 'h:m t'],
                // http://msdn.microsoft.com/en-us/library/az4se3k1(v=vs.110).aspx
                format: {
                    'd': 'MM/dd/yyyy',
                    'D': 'dddd, MMMM dd, yyyy',
                    'f': 'dddd, MMMM dd, yyyy - hh:mm tt',
                    'F': 'dddd, MMMM dd, yyyy - hh:mm:ss tt',
                    'g': 'MM/dd/yyyy hh:mm tt',
                    'G': 'MM/dd/yyyy hh:mm:ss tt',
                    'm': 'MMMM dd',
                    's': 'yyyy-MM-ddTHH:mm:ss',
                    't': 'hh:mm tt',
                    'T': 'hh:mm:ss tt',
                    'y': 'MMMM, yyyy',
                    'u': 'UTC:yyyy-MM-ddTHH:mm:ssZ'
                },
                ampm: ["AM", "PM"]
            },
            number: {
                group: [',', 3],
                decimal: ['.', 2],
                currency: ['($ |)', '$ |']
            },
            calendar: {
                dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                shortDayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                shortMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                duration: ['now', ['second', 'seconds'], ['minute', 'minutes'], ['hour', 'hours'], ['day', 'days'], ['month', 'months'], ['year', 'years']]
            }
        },
        'ptbr': {
            lang: 'pt-BR',
            date: {
                patterns: ['d', 'd/M', 'd/M/y', 'd/M/y h:m', 'd/M/y h:m:s', 'h:m', 'h:m:s'],
                format: {
                    'd': 'dd/MM/yyyy',
                    'D': 'dddd, dd "de" MMMM "de" yyyy',
                    'f': 'dddd, dd "de" MMMM "de" yyyy - HH:mm',
                    'F': 'dddd, dd "de" MMMM "de" yyyy - HH:mm:ss',
                    'g': 'dd/MM/yyyy HH:mm',
                    'G': 'dd/MM/yyyy HH:mm:ss',
                    'm': 'dd de MMMM',
                    's': 'yyyy-MM-ddTHH:mm:ss',
                    't': 'HH:mm',
                    'T': 'HH:mm:ss',
                    'y': 'MMMM/yyyy',
                    'u': 'UTC:yyyy-MM-ddTHH:mm:ssZ'
                },
                ampm: null
            },
            number: {
                group: ['.', 3],
                decimal: [',', 2],
                currency: ['-R$ |', 'R$ |']
            },
            calendar: {
                dayNames: ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'],
                shortDayNames: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
                monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
                shortMonthNames: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                duration: ['agora', ['um segundo', '{0} segundos'], ['um minuto', '{0} minutos'], ['uma hora', '{0} horas'], ['um dia', 'dias'], ['um mes', '{0} meses'], ['um ano', '{0} anos']]
            }
        }
    };

    var cache = {};

    // return new Culture
    return function (lang) {

        var culture = languages[(lang || 'enus').toLowerCase().replace('-', '')];

        // initial parser patterns
        var patterns = ['y-M-d', 'y-M-dTh:m:s(\\.f)?(o)?', 'y-M-dTh:m:s(\\.f)?Z'];

        for (var p = 0; p < culture.date.patterns.length; p++) {
            patterns.push(culture.date.patterns[p]);
        }

        if (!culture) console.error('Language not defined: ' + lang);

        // Parse any string to Date object using current culture info. Returns null if not a valid date
        var parseDate = function (str) {

            if (str === null || isDate(str) || typeof (str) === 'undefined') return str || null;

            var result = null;

            //console.log(patterns);

            for (var i = 0; i < patterns.length; i++) {
                result = keyMatch(str.toString(), patterns[i]);
                if (result !== null) break;
            }

            if (result === null) return null;
            var now = new Date();

            result.d = parseInt(result.d) || now.getDate();
            result.M = parseInt(result.M) || (now.getMonth() + 1);
            result.y = parseInt(result.y) || now.getFullYear();
            result.h = parseInt(result.h) || 0;
            result.m = parseInt(result.m) || 0;
            result.s = parseInt(result.s) || 0;
            result.f = parseInt(result.f) || 0;

            if (culture.date.ampm && new RegExp(culture.date.ampm[1], 'i').test(result.t)) result.h += 12;
            if (result.M < 1 || result.M > 12) return null;
            if (result.y < 50) result.y += 2000;
            if (result.y > 50 && result.y < 99) result.y += 1900;
            if (result.h > 23) return null;
            if (result.m > 59) return null;
            if (result.s > 59) return null;
            if (result.d < 1 || result.d > getDaysInMonth(result.M - 1, result.y)) return null;

            return result.utc ?
                new Date(Date.UTC(result.y, result.M - 1, result.d, result.h, result.m, result.s, result.f)) :
                new Date(result.y, result.M - 1, result.d, result.h, result.m, result.s, result.f);
        };

        // Parse any string to Number object using current culture info. Returns null if not a valid number
        var parseNumber = function (str) {

            if (str === null || isNumber(str) || typeof (str) === 'undefined') return str || null;

            var group = new RegExp(culture.number.group[0].replace('.', '\\.'), 'g');
            var decimal = new RegExp(culture.number.decimal[0].replace('.', '\\.'), 'g');

            var num = str.toString()
                .replace(group, '')
                .replace(decimal, '.');

            var val = parseFloat(num);

            if (isNaN(val)) return null;

            return val;
        };

        // Format String (like string.Format in C#), Number or Date according value object type
        var format = function (value, fmt) {

            var args = arguments;

            if (value === null || value === undefined)
                return '';

            if (isDate(value))
                return dateFormat(value, fmt, false);

            if (isNumber(value)) {
                var mask = fmt || 'n';
                var decimals = /^[nc](\d+)$/i.test(mask) ? mask.match(/^[nc](\d+)$/i)[1] : culture.number.decimal[1];

                if (/^c\d*$/i.test(mask)) {
                    var str = numberFormat(Math.abs(value), decimals, culture.number.decimal[0], culture.number.group[0], culture.number.group[1]);
                    var currency = value < 0 ? culture.number.currency[0] : culture.number.currency[1];
                    return currency.replace('|', str);
                }
                else if (/^n\d*$/i.test(mask)) {
                    return numberFormat(value, decimals, culture.number.decimal[0], culture.number.group[0], culture.number.group[1]);
                }
            }

            if (isString(value)) {
                return value.replace(/{(\d+(:[^}]*)?)}/, function (k, m) {
                    var mask = m.replace(/^\d+:?/, '');
                    var index = parseInt(m.match(/^\d+/)[0]);
                    var arg = args[index + 1];
                    return mask ? format(arg, mask) : arg;
                });
            }

            return value.toString();
        };

        // Add an interval into a Date returning a new Date
        var dateAdd = function (datepart, number, date) {

            var d = new Date(date.getTime());
            var m = '';

            switch (datepart) {
                case 'y': m = 'FullYear'; break;
                case 'M':
                    var n = date.getDate();
                    d.setDate(1);
                    d.setMonth(d.getMonth() + parseInt(number || 0));
                    d.setDate(Math.min(n, getDaysInMonth(d.getMonth(), d.getFullYear())));
                    return d;
                case 'd': m = 'Date'; break;
                case 'h': m = 'Hour'; break;
                case 'm': m = 'Minute'; break;
                case 's': m = 'Second'; break;
                case 'f': m = 'Milliseconds'; break;
                default: throw 'i18n.dateAdd : part no recognize. Use y, M, d, h, m, s or f';
            }

            d['set' + m](d['get' + m]() + parseInt(number || 0));

            return d;
        };

        // Get difference between two dates. Must specify datepart
        var dateDiff = function (datepart, start, end) {

            var t2 = end.getTime();
            var t1 = start.getTime();
            var ms = 0;

            switch (datepart) {
                case 'y':
                case 'M':
                    var months = end.getMonth() - start.getMonth() + (12 * (end.getFullYear() - start.getFullYear()));
                    if (end.getDate() < start.getDate()) {
                        months--;
                    }
                    return datepart === 'M' ? months : Math.ceil(months / 12);
                case 'd': ms = 24 * 60 * 60 * 1000; break;
                case 'h': ms = 60 * 60 * 1000; break;
                case 'm': ms = 60 * 1000; break;
                case 's': ms = 1000; break;
                case 'f': ms = 1; break;
                default: throw 'i18n.dateDiff: part no recognize. Use y, M, d, h, m, s or f';
            }

            return parseInt((t2 - t1) / ms);
        };

        // Returns a string with time ago from a Date
        var timeAgo = function (date) {

            var diff = (new Date()).getTime() - date.getTime();

            var r = {
                y: parseInt(diff / (365 * 24 * 60 * 60 * 1000)),
                M: parseInt(diff / (30 * 24 * 60 * 60 * 1000)),
                d: parseInt(diff / (24 * 60 * 60 * 1000)),
                h: parseInt(diff / (60 * 60 * 1000)),
                m: parseInt(diff / (60 * 1000)),
                s: parseInt(diff / (1000))
            };

            return r.y >= 1 ? format(culture.calendar.duration[6][r.y === 1 ? 0 : 1], r.y) :
                r.M >= 1 ? format(culture.calendar.duration[5][r.M === 1 ? 0 : 1], r.M) :
                    r.d >= 1 ? format(culture.calendar.duration[4][r.d === 1 ? 0 : 1], r.d) :
                        r.h >= 1 ? format(culture.calendar.duration[3][r.h === 1 ? 0 : 1], r.h) :
                            r.m >= 1 ? format(culture.calendar.duration[2][r.m === 1 ? 0 : 1], r.m) :
                                r.s >= 1 ? format(culture.calendar.duration[1][r.s === 1 ? 0 : 1], r.s) :
                                    culture.calendar.duration[1][1];
        };

        var keyMatch = function (str, pattern) {

            var expr = { keys: {}, re: '' };
            var result = {};

            if (cache[pattern]) {
                expr = cache[pattern];
            }
            else {

                var re = '^' + pattern
                    .replace('d', '(?<d>\\d{1,2})')
                    .replace('y', '(?<y>\\d{2,4})')
                    .replace('M', '(?<M>\\d{1,2})')
                    .replace('h', '(?<h>\\d{1,2})')
                    .replace('m', '(?<m>\\d{1,2})')
                    .replace('s', '(?<s>\\d{1,2})')
                    .replace('f', '(?<f>\\d{1,12})')
                    .replace('o', '(?<o>[+-]?\\d{1,2}:?\\d{1,2})')+ '$';

                if (culture.date.ampm)
                    re = re.replace('t', '(?<t>(' + culture.date.ampm[0] + ')|(' + culture.date.ampm[1] + '))');

                var keysIndex = re.match(/(?!\(\?\<)(\w+)(?=\>)/g);
                if (!keysIndex) {  // no keys, do a regular match
                    return str.match(re);
                }
                else {
                    for (var i = 0; i < keysIndex.length; i++) {
                        expr.keys[i + 1] = keysIndex[i];
                    }

                }
                expr.re = RegExp(re.replace(/\?\<\w+\>/g, ''), 'i');
                cache[re] = expr;
            }

            var match = str.match(expr.re);

            if (match) {
                var keys = Object.keys(expr.keys);
                for (i = 0; i < keys.length; i++) {
                    result[expr.keys[keys[i]]] = match[i + 1];
                }
                result.utc = pattern.indexOf('Z') >= 0;
                return result;
            }
            else {
                return null;
            }
        };

        // http://blog.stevenlevithan.com/archives/date-time-format
        var dateFormat = function () {

            var token = /d{1,4}|M{1,4}|yy(?:yy)?|f{1,3}|z{1,3}|([Hhmst])\1?|"[^"]*"|'[^']*'/g;
            var pad = function (val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) val = "0" + val;
                return val;
            };

            // regexes and supporting functions are cached through closure
            return function (date, mask, utc) {

                // fixed mask 'ago' uses timeAgo function
                if (mask === 'ago') return timeAgo(date);

                mask = String(culture.date.format[mask] || mask || culture.date.format["d"]);

                // allow setting the utc argument via the mask
                if (mask.slice(0, 4) == "UTC:") {
                    mask = mask.slice(4);
                    utc = true;
                }

                var ampm = culture.date.ampm || ['', ''];

                // http://msdn.microsoft.com/en-us/library/8kb3ddd4(v=vs.110).aspx
                var _ = utc ? "getUTC" : "get",
                    d = date[_ + "Date"](),
                    D = date[_ + "Day"](),
                    M = date[_ + "Month"](),
                    y = date[_ + "FullYear"](),
                    H = date[_ + "Hours"](),
                    m = date[_ + "Minutes"](),
                    s = date[_ + "Seconds"](),
                    f = date[_ + "Milliseconds"](),
                    o = utc ? 0 : date.getTimezoneOffset(),
                    flags = {
                        d: d,
                        dd: pad(d),
                        ddd: culture.calendar.shortDayNames[D],
                        dddd: culture.calendar.dayNames[D],
                        M: M + 1,
                        MM: pad(M + 1),
                        MMM: culture.calendar.shortMonthNames[M],
                        MMMM: culture.calendar.monthNames[M],
                        yy: String(y).slice(2),
                        yyyy: y,
                        h: H % 12 || 12,
                        hh: pad(H % 12 || 12),
                        H: H,
                        HH: pad(H),
                        m: m,
                        mm: pad(m),
                        s: s,
                        ss: pad(s),
                        f: pad(f, 3).substring(0, 1),
                        ff: pad(f, 3).substring(0, 2),
                        fff: pad(f, 3),
                        t: H < 12 ? ampm[0].substring(0, 1) : ampm[1].substring(0, 1),
                        tt: H < 12 ? ampm[0] : ampm[1],
                        z: (o > 0 ? "-" : "+") + Math.floor(Math.abs(o) / 60),
                        zz: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4).substring(0, 2),
                        zzz: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4)
                    };

                return mask.replace(token, function ($0) {
                    return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
                });
            };
        }();

        var numberFormat = function (n, c, d, t, g) {
            c = isNaN(c = Math.abs(c)) ? 2 : c;
            d = d === undefined ? "." : d;
            t = t === undefined ? "," : t;
            var s = n < 0 ? "-" : "";
            var i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "";
            var j = (j = i.length) > g ? j % g : 0;
            return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(new RegExp('(\\d{' + g + '})(?=\\d)', 'g'), "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
        };

        var isLeapYear = function (year) {
            return (year % 4 === 0) && (year % 100 !== 0) || (year % 400 === 0);
        };

        var getDaysInMonth = function (month, year) {
            return [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        };

        var isObject = function (a) {
            return (!!a) && (a.constructor === Object);
        };

        var isString = function (s) {
            return typeof s === 'string' || typeof s === 'object' && s.constructor === String;
        };

        var isNumber = function (n) {
            return typeof n === 'number' || typeof n === 'object' && n.constructor === Number;
        };

        var isDate = function (d) {
            return Object.prototype.toString.call(d) === '[object Date]';
        };

        // exposing methods
        this.culture = culture;
        this.format = format;
        this.parseDate = parseDate;
        this.parseNumber = parseNumber;
        this.timeAgo = timeAgo;
        this.dateAdd = dateAdd;
        this.dateDiff = dateDiff;
    };

})(this);

// export as ES functions a current instance of Culture

let current = new Culture("en-US");

export const culture = () => current.culture;
export const format = (value, fmt) => current.format(value, fmt);
export const parseDate = (str) => current.parseDate(str);
export const parseNumber = (str) => current.parseNumber(str);
export const timeAgo = (date) => current.timeAgo(date);
export const dateAdd = (datepart, number, date) => current.dateAdd(datepart, number, date);
export const dateDiff = (datepart, start, end) => current.dateDiff(datepart, start, end);
export const change = (lang) => current = new Culture(lang);

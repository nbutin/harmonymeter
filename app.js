window.prop_profiles = [...characters];
//~ window.prop_selected = 1;
//~ var app_selected_character = 1;


window.embodying_triggers = {
    '^-main(-.*)?$': embodyMain,
    '^-select$': embodySelect,
    '^-matching-\\d+$': embodyMatching,
    '^-spec-p-\\d+$': embodySpec,
    '^-edit(-.*)?$': embodyEdit,
    '^-test-s-': embodyTestS,
    '^-test-p-': embodyTestP,
};

window.prop_stored = {
    prop_profiles: [],
    //~ 'image-12': '',
};

document.addEventListener('DOMContentLoaded', () => {
    prepareSelectors();
    appLoadProps();
    //~ engageTriggers();
    //~ embodyMain();
    vkInit();
});

function calcSocRating(type_id) {
    if (type_id < 0 || window.prop_profiles[appGetSelected()][1] < 0) return [-1, -1, []];
    const selected = soc_types[window.prop_profiles[appGetSelected()][1]];
    const tested = soc_types[type_id];
    var n1 = 0;
    var r = 0;
    var comment = {};
    var txt_comment = [];
    tested[2].split('').slice(0, 2).forEach(i => {
        n1 += 1;
        let n2 = selected[2].indexOf(i) + 1;
        let k = [n1, n2].sort().join('');
        if (k in soc_scale) {
            r += soc_scale[k][0];
            if (!(soc_scale[k][1] in comment)) {
                comment[soc_scale[k][1]] = [];
            }
            comment[soc_scale[k][1]].push(soc_areas[i].replace(' ', '&nbsp;'));
        }
    });
    var n1 = 0;
    selected[2].split('').slice(0, 2).forEach(i => {
        n1 += 1;
        let n2 = tested[2].indexOf(i) + 1;
        let k = [n1, n2].sort().join('');
        if (k in soc_scale) {
            r += soc_scale[k][0];
            if (!(soc_scale[k][1] in comment)) {
                comment[soc_scale[k][1]] = [];
            }
            if (!comment[soc_scale[k][1]].includes(soc_areas[i].replace(' ', '&nbsp;'))) {
                comment[soc_scale[k][1]].push(soc_areas[i].replace(' ', '&nbsp;'));
            }
        }
    });
    var order = [];
    Object.values(soc_scale).sort((a, b) => b[2] - a[2]).forEach(i => {order.push(i[1])});
    Object.keys(comment).sort((a, b) => order.findIndex(x => x == a) - order.findIndex(x => x == b)).forEach(k => {
        txt_comment.push(`${k} по&nbsp;${comment[k].join(" и ")}`);
    });
    var result = parseInt(((r + 26) / 52) * 100);
    return [result, result, txt_comment];
}

function calcPsyRating(type_id) {
    if (type_id < 0 || window.prop_profiles[appGetSelected()][2] < 0) return [-1, -1, []];
    const selected = psy_types[window.prop_profiles[appGetSelected()][2]];
    const tested = psy_types[type_id];
    var n1 = 0;
    var r = 0;
    var comment = {};
    var txt_comment = [];
    tested[0].split('').forEach(i => {
        n1 += 1;
        let n2 = selected[0].indexOf(i) + 1;
        let k = [n1, n2].sort().join('');
        if (k in psy_scale) {
            r += psy_scale[k][0];
            if (!(psy_scale[k][1] in comment)) {
                comment[psy_scale[k][1]] = [];
            }
            comment[psy_scale[k][1]].push(psy_areas[i]);
        }
    });
    var order = [];
    Object.values(psy_scale).sort((a, b) => b[2] - a[2]).forEach(i => {order.push(i[1])});
    Object.keys(comment).sort((a, b) => order.findIndex(x => x == a) - order.findIndex(x => x == b)).forEach(k => {
        txt_comment.push(`${k} по&nbsp;${comment[k].join("&nbsp;и&nbsp;")}`);
    });
    var result = parseInt(((r + 12) / 24) * 100);
    return [result, result, txt_comment];
}

function calcRating(profile_id) {
    const soc_rating = calcSocRating(window.prop_profiles[profile_id][1]);
    const psy_rating = calcPsyRating(window.prop_profiles[profile_id][2]);
    const min_rating = parseInt((
        parseInt(soc_rating[0] >= 0 && `${soc_rating[0]}` || 0) +
        parseInt(psy_rating[0] >= 0 && `${psy_rating[0]}` || 0)
    ) / 2);
    const max_rating = parseInt((
        parseInt(soc_rating[1] >= 0 && `${soc_rating[1]}` || 100) +
        parseInt(psy_rating[1] >= 0 && `${psy_rating[1]}` || 100)
    ) / 2);
    return [min_rating, max_rating, soc_rating[0], psy_rating[0], soc_rating, psy_rating, profile_id];
}


function sumRating(numbers) {
    var sum = 0;
    numbers.slice(0, 4).forEach(i => {
        if (i > -1) sum += i;
        else sum += 50;
    });
    return sum;
}


// ok
function calcAllRatings() {
    var map = [];
    window.prop_profiles.forEach((val, i) => {
        if (val && appGetSelected() != i) {
            map.push(calcRating(i));
        }
    });
    return map.sort((a, b) => (sumRating(b) + b[2] / 1000000) - (sumRating(a) + a[2] / 1000000));
}


function appGetSelected() {
    if (window.prop_selected != undefined) {
        return window.prop_selected;
    } else {
        const selfdeterminated = window.prop_profiles[0][1] + window.prop_profiles[0][1] > -2;
        if (selfdeterminated) {
            return 0;
        } else {
            return 1;
        }
    }
}


// ok
function embodyMain() {
    const first = calcRating(appGetSelected());
    const empty = [-1, -1, -1, -1, [], []];
    var items = [first, ...calcAllRatings(), empty, empty, empty, empty, empty];
    items = items.slice(0, (-items.length % 4) || -4);
    var html = '';
    items.forEach((v, i) => {
        const profile = window.prop_profiles[v[6]];
        let sr = `soc${percentToText(v[4][0], v[4][1])}`;
        let pr = `psy${percentToText(v[5][0], v[5][1])}`;
        if (profile && profile[2] in psy_types) {
            var f1 = psy_types[profile[2]][0].slice(0, 1);
            var f2 = psy_types[profile[2]][0].slice(1, 2);
        } else {
            var f1 = 'В';
            var f2 = 'Э';
        }
        f1 = {'Ф': 'P1', 'В': 'V1', 'Э': 'E1', 'Л': 'L1'}[f1];
        f2 = {'Ф': 'P2', 'В': 'V2', 'Э': 'E2', 'Л': 'L2'}[f2];
        if (profile && profile[1] in psy_types) {
            let x = soc_types[profile[1]][2].slice(0, 1);
            if (x == x.toLowerCase()) var ie = 'sI';
            else var ie = 'sE';
            x = soc_types[profile[1]][0].slice(0, 1);
            if ('ис'.includes(x.toLowerCase())) var jp = 'sP';
            else var jp = 'sJ';
        } else {
            var ie = 'sE';
            var jp = 'sJ';
        }
        var url = appStoredImage(v[6]);
        var href = `-matching-${v[6]}`;
        if (i == 0) href = '-select';
        else if (v[6] === undefined) href = '-edit-';
        else if (v[6] === 0 && (profile[1] + profile[2]) > -2) href = '-matching-0';
        else if (v[6] === 0) href = '-edit-0';
        if (!i || v[6] === undefined) var flag = 'sepia';
        else var flag = '';
        html += appBadge(v[6], [sr, pr, f1, f2, ie, jp, flag]).replace('onclick=""', `onclick="location.hash = '${href}'"`);
    });
    document.getElementById('map').innerHTML = html;
    return html;
}


// ok
function embodySelect() {
    var items = [0, ...Object.keys(window.prop_profiles).slice(1).reverse()];
    var html = '';
    items.filter(x => ![null].includes(window.prop_profiles[x])).forEach(i => {
        let url = appStoredImage(i);
        html += coreBadge(url, window.prop_profiles[i][0], `window.prop_selected = ${i}; location.hash = '-main'`);
    });
    if (items.length % 4) html += `<b class="badge" style="width: calc(100% * ${4 - items.length % 4} / 4); aspect-ratio:${4 - items.length % 4}"></b>`;
    document.getElementById('selector').innerHTML = html;
}


// ok
function appStoredImage(profile_id) {
    return coreStoredImage(profile_id)
        || ('1 2 3 4 5 6 7 8 9'.includes(parseInt(profile_id))
        && `images/${profile_id}.jpg`) || '';
}



// ok
function appBadge(profile_id, modifiers) {
    const image = appStoredImage(profile_id);
    var label = '';
    if (window.prop_profiles[profile_id]) {
        label = coreAcronym(window.prop_profiles[profile_id][0]);
    }
    const featured = modifiers && true || false;
    return coreBadge(image, label, null, featured, modifiers);
}


// ok
function percentToText(n1, n2) {
    if (n1 < 0 || n2 - n1 > 50) return 'none';
    else if (n1 >= 80) return 'best';
    else if (n1 >= 60) return 'good';
    else if (n1 >= 45) return 'norm';
    else if (n1 >= 30) return 'poor';
    else return 'sick';
}


// ok
function getColorMark(text) {
    var result = '';
    Object.entries(marks).some(i => {
        if (i[1].includes(text.split(' ')[0])) {
            result = i[0];
            return true;
        }
    });
    return result;
}


// ok
function formatRatingDetails(items) {
    var html = '';
    items.forEach(i => {
        html += `<li class="${getColorMark(i)}-marked">✔ ${i.replace(' и ', ' и&nbsp;')},</li>`;
    });
    return html && html.slice(0, -6) + '.</li>' || '';
}


// ok
function embodyMatching() {
    const id1 = appGetSelected();
    const selected = window.prop_profiles[id1];
    const matched = appGetProfileByHash();
    const id2 = matched[9];
    if (id1 == 0) link1e = '-edit-0';
    else if ([1,2,3,4,5,6,7,8,9].includes(id1)) link1e = `-edit-r-${id1}`;
    else link1e = `-edit-w-${id1}`;
    if (id2 == 0) link2e = '-edit-0';
    else if ([1,2,3,4,5,6,7,8,9].includes(id2)) link2e = `-edit-r-${id2}`;
    else link2e = `-edit-w-${id2}`;
    var link1s = `-spec-s-${selected[1]}`;
    var link2s = `-spec-s-${matched[1]}`;
    var link1p = `-spec-p-${selected[2]}`;
    var link2p = `-spec-p-${matched[2]}`;
    var url1 = appStoredImage(id1);
    var url2 = appStoredImage(id2);
    var badge1 = coreBadge(url1, selected[0], `location.hash = '${link1e}'`);
    var badge2 = coreBadge(url2, matched[0], `location.hash = '${link2e}'`);
    const rating = calcRating(id2);
    if (rating[0] == rating[1]) var sum_percent = rating[0];
    else var sum_percent = `от ${rating[0]} до ${rating[1]}`;
    if (rating[4][0] > -1) var soc_percent = rating[4][0] + '%';
    else var soc_percent = 'неизвестно';
    if (rating[5][0] > -1) var psy_percent = rating[5][0] + '%';
    else var psy_percent = 'неизвестно';
    var sum_rating = percentToText(rating[0], rating[1]);
    var soc_rating = percentToText(rating[4][0], rating[4][1]);
    var psy_rating = percentToText(rating[5][0], rating[5][1]);
    var soc_details = formatRatingDetails(rating[4][2]);
    var psy_details = formatRatingDetails(rating[5][2]);
    document.getElementById('sum-percent').innerText = sum_percent;
    var html = `
        <tr class="${sum_rating}">
            <td>${badge1}</td>
            <td>${badge2}</td>
        </tr>
        <tr>
            <td colspan="2">
                <h3>По социотипу — ${soc_percent}</h3>
            </td>
        </tr>
        <tr class="${soc_rating}">
            <td>
                <div><button onclick="location.hash = '${selected[1] >= 0 && link1s || link1e}'">${selected[1] >= 0 && soc_types[selected[1]][1] || '&nbsp; ? &nbsp;'}</button></div>
            </td>
            <td>
                <div><button onclick="location.hash = '${matched[1] >= 0 && link2s || link2e}'">${matched[1] >= 0 && soc_types[matched[1]][1] || '&nbsp; ? &nbsp;'}</button></div>
            </td>
        </tr>
        <tr>
            <td colspan="2">
                <ul id="soc-details">
                    ${soc_details}
                </ul>
            </td>
        </tr>
        <tr>
            <td colspan="2">
                <h3>По психотипу — ${psy_percent}</h3>
            </td>
        </tr>
        <tr class="${psy_rating}">
            <td>
                <div><button onclick="location.hash = '${selected[2] >= 0 && link1p || link1e}'">${selected[2] >= 0 && psy_types[selected[2]][1] || '&nbsp; ? &nbsp;'}</button></div>
            </td>
            <td>
                <div><button onclick="location.hash = '${matched[2] >= 0 && link2p || link2e}'">${matched[2] >= 0 && psy_types[matched[2]][1] || '&nbsp; ? &nbsp;'}</button></div>
            </td>
        </tr>
        <tr>
            <td colspan="2">
                <ul id="psy-details">
                    ${psy_details}
                </ul>
            </td>
        </tr>
        <tr>
            <td>
                <button onclick="location.hash = '${link1e}'">Исправить</button>
            </td>
            <td>
                <button onclick="location.hash = '${link2e}'">Исправить</button>
            </td>
        </tr>
    `;
    document.querySelector('#matching table').innerHTML = html;
}


// ok
function embodySpec(type_id) {
    var type = psy_types[type_id || location.hash.split('-').slice(-1)[0]];
    document.querySelector('.-spec-p h3').innerText = `${type[1]} (${type[0]})`;
    document.querySelectorAll('.-spec-p strong').forEach((node, i) => {
        node.innerText = functions[type[0][i]];
    });
}


// ok
function appGetProfileByHash() {
    const profile_id = parseInt(location.hash.split('-').slice(-1)[0]);
    const profile = [...(window.prop_profiles[profile_id] || ['', -1, -1])];
    profile[9] = profile_id;
    return profile;
}


// 
function fromCacheOrProfile(index) {
    const profile = appGetProfileByHash();
    const cached = appCachedProfileValue(index);
    if (index == 8) {
        return cached || coreStoredImage(profile[9]) || `images/${profile[9]}.jpg`;
    } else {
        if (cached != undefined) {
            return cached;
        } else {
            return profile[index];
        }
    }
}


// ok
function appCachedProfileValue(i, value) {
    if (!window._cached_ || [undefined].includes(i)) {
        window._cached_ = [];
    }
    if (value !== undefined) {
        window._cached_[i] = value;
    } else {
        return window._cached_[i];
    }
}

// ok
function embodyEdit() {
    if (core_history_of_embodyings[1].slice(0, 6) != '-test-') {
        appCachedProfileValue();
    }
    const profile = appGetProfileByHash();
    const [input_name, soc_selector, psy_selector] = document.querySelectorAll('.-edit input[name="name"], .-edit select');
    const [soc_hint, psy_hint] = document.querySelectorAll('.-edit.hint div');
    const image = document.querySelector('.-edit :has(>b.badge)');
    const button = document.querySelector('.-edit button');
    input_name.disabled = false;
    soc_selector.disabled = false;
    psy_selector.disabled = false;
    soc_hint.innerHTML = '';
    psy_hint.innerHTML = '';
    input_name.value = fromCacheOrProfile(0);
    soc_selector.value = fromCacheOrProfile(1);
    changedProfile(soc_selector.name, soc_selector.value);
    psy_selector.value = fromCacheOrProfile(2);
    changedProfile(psy_selector.name, psy_selector.value);
    image.innerHTML = coreBadge(fromCacheOrProfile(8), input_name.value);
    if (profile[9] === 0) {
        input_name.disabled = true;
    } else if ('1 2 3 4 5 6 7 8 9'.includes(profile[9])) {
        //~ input_name.disabled = true;
        soc_selector.disabled = true;
        psy_selector.disabled = true;
    }
    button.innerText = 'Сохранить'
    button.disabled = true;
}


// ok
function prepareSelectors() {
    const [soc_selector, psy_selector] = document.querySelectorAll('.-edit select');
    var items = [
        '<option value="-1">Социотип ( ? )</option>', 
        '<option value="test">Определить с помощью теста...</option>',
    ];
    soc_types.forEach((v, i) => {
        items.push(`<option value="${i}">${v[0]}, ${v[1]}</option>`);
    });
    soc_selector.innerHTML = items.join('\n');
    items = [
        '<option value="-1">Психотип ( ? )</option>',
        '<option value="test">Определить с помощью теста...</option>',
    ];
    psy_types.forEach((v, i) => {
        items.push(`<option value="${i}">${v[0]}, ${v[1]}</option>`);
    });
    psy_selector.innerHTML = items.join('\n');
}


// ok
function changedProfile(name, value) {
    name = name || event.target.name;
    value = value || event.target.value;
    const profile = appGetProfileByHash();
    const edited = getEditedProfileValues();
    const button = document.querySelector('.-edit button');
    if (name != 'name' && value == 'test') {
        console.log(11111111, window._cached_);
        //~ let id = ![NaN].includes(profile[9]) && profile[9] || '';
        location.hash = `${name}-${profile[9]}`;
        return;
    }
    if (name == 'name' && value == '-reset') {
        localStorage.clear();
        location.hash = '';
        location.reload();
        return;
    }
    setTimeout(() => {
        if ((profile[0] || edited[0]) && edited.toString() != profile.toString()) {
            button.disabled = false;
        } else {
            button.disabled = true;
        }
        const hints = document.querySelectorAll('.-edit.hint div');
        if (name == 'name') {
            document.querySelector('.-edit input[name="name"]').value = value.replaceAll(/[<>]/g, '');
            if (!value && profile[0]) button.innerText = 'Удалить';
            else button.innerText = 'Сохранить';
            let image = document.querySelector('.-edit :has(>b.badge)');
            let image_url = image.querySelector('a[style]').style.backgroundImage.slice(5, -2);
            image.innerHTML = coreBadge(image_url, value);
            appCachedProfileValue(0, value);
        } else if (name.split('-').slice(-1)[0] == 's') {
            if (parseInt(value) >= 0) {
                hints[0].innerHTML = document.querySelector(`.-spec-s-${value}`).innerHTML;
            } else {
                hints[0].innerHTML = '';
            }
        } else if (name.split('-').slice(-1)[0] == 'p') {
            if (parseInt(value) >= 0) {
                embodySpec(value);
                hints[1].innerHTML = document.querySelector('.-spec-p:not(.header)').innerHTML;
            } else {
                hints[1].innerHTML = '';
            }
        }
    }, 1);
}


// 
function getEditedProfileValues() {
    const [input_name, soc_selector, psy_selector] = document.querySelectorAll('.-edit input[name="name"], .-edit select');
    const values = [input_name.value, parseInt(soc_selector.value), parseInt(psy_selector.value)];
    values[9] = appGetProfileByHash()[9];
    return values;
}


// ok
function saveProfile() {
    const values = getEditedProfileValues();
    var ok = true;
    window.prop_profiles.some((val, i) => {
        if (val[0] == values[0] && i != values[9]) {
            ok = confirm('Профиль с таким именем уже существует. Продолжить сохранение?');
            return true;
        }
    });
    if (!ok) return;
    if ([NaN].includes(values[9])) {
        coreStoredImage(window.prop_profiles.length, appCachedProfileValue(8));
        window.prop_profiles.push(values.slice(0, 3));
        history.back();
    } else if (!values[0]) {
        window.prop_profiles[values[9]] = null;
        while (window.prop_profiles.length > 10 && !window.prop_profiles.slice(-1)[0]) {
            window.prop_profiles.pop();
        }
        coreStoredImage(values[9], null);
        location.hash = '-main';
    } else {
        window.prop_profiles[values[9]] = values.slice(0, 3);
        coreStoredImage(values[9], appCachedProfileValue(8));
        history.back();
    }
    appSaveProps('prop_profiles');
}



function toStorage(key, val) {
    localStorage[key] = JSON.stringify(val);
}

function selectFile() {
    document.getElementById('uploaded').click();
}

function listStoredProps() {
    return {prop_version: 0, prop_stored: {}, ...(window.prop_stored  || {})};
}


function updateProps(props) {
    const actual_version = window.prop_version;
    if (!props.prop_version || props.prop_version <= actual_version) {
        if (!window.prop_version) {
            window.prop_version = 1;
            console.log(`embodied with initial props`)
            embody();
        } else {
            console.log(`actual version of props - ${actual_version}, loaded version - ${props.prop_version}`)
        }
        return;
    }
    if (props.prop_stored && typeof(window.prop_stored) == typeof(props.prop_stored) && props.prop_stored.toString() == "[object Object]") {
        window.prop_stored = props.prop_stored;
    }
    for (let name in props) {
        if (name in window.prop_stored && typeof(window.prop_stored[name]) == typeof(props[name])) {
            if (typeof(props[name]) == 'object' && props[name]) {
                if (!window[name] && Object.entries(props[name]).length) {
                    window[name] = props[name];
                } else {
                    for (let k in props[name]) {
                        window[name][k] = props[name][k];
                    }
                }
            } else if (props[name] && props[name] != window.prop_stored[name]) {
                window[name] = props[name];
            }
        }
    }
    window.prop_version = props.prop_version;
    console.log(`props version updated from '${actual_version}' to ${window.prop_version}`)
    embody();
}


// ok
function applyImage() {
    const file = document.getElementById('uploaded').files[0];
    if (!['image/jpeg', 'image/gif', 'image/svg+xml', 'image/png'].includes(file.type)) {
        alert('Неверный тип файла.\nПодойдут: png, jpeg, svg и gif');
        return;
    }
    const url = URL.createObjectURL(file);
    compressImage(url, data => {
        appCachedProfileValue(9, appGetProfileByHash()[9]);
        appCachedProfileValue(8, data);
        const image = document.querySelector('.-edit .badge a[style]');
        image.style.backgroundImage = `url('${data}')`;
        const input_name = document.querySelector('.-edit input[name="name"]');
        if (input_name.value) {
            const button = document.querySelector('.-edit button');
            button.disabled = false;
        }
    });
}


// ok
function compressImage(url, callback) {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    const img = new Image;
    img.onload = function() {
        ctx.drawImage(img, 0, 0, 240, 240);
        [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1].some(x => {
            let result = canvas.toDataURL('image/jpeg', x);
            if (result.length <= 50 * 1024) {
                callback(result);
                return true;
            }
        });
    }
    img.src = url;
}



function coreStoredImage(id, data) {
    const name = `image-${id}`;
    if (data === undefined) {
        return window[name];
    } else if (data === null) {
        delete window[name];
        delete window.prop_stored[name];
        appSaveProps([name, 'prop_stored']);
    } else {
        window[name] = data;
        window.prop_stored[name] = '';
        appSaveProps([name, 'prop_stored']);
    }
}



function appLoadProps() {
    _loadPropsLocal();
    //~ _loadPropsVk();
    //~ _loadPropsTg();
}

function appSaveProps(list, locally) {
    window.prop_version += 1;
    list = typeof(list) == 'object' && list.length && ['prop_version', ...list]
        || typeof(list) == 'string' && ['prop_version', list]
        || Object.keys(listStoredProps()).filter(name => name.slice(0, 5) == 'prop_');
    _savePropsLocal(list);
    if (!locally) {
        //~ _savePropsVk();
        //~ _savePropsTg();
    }
}

function _loadPropsLocal() {
    const props = {};
    const prop_stored = JSON.parse(localStorage['prop_stored'] || 'null');
    for (name in Object.assign(listStoredProps(), prop_stored)) {
        if (!['undefined', 'NaN'].includes(localStorage[name])) {
            props[name] = JSON.parse(localStorage[name] || 'null');
        }
    }
    updateProps(props);
}

function _savePropsLocal(list) {
    list.forEach(name => {
        if ([undefined, null].includes(window[name])) {
            delete localStorage[name];
            console.log(`${name} deleted`);
        } else {
            localStorage[name] = JSON.stringify(window[name]);
            console.log(`${name} stored locally`);
        }
    });
}

function altMain() {
    if (location.hash == '#-main') location.hash = '-select';
    else location.hash = '-main';
}

//~ function test(v) {
    //~ location.hash = `-test-${v && 'p' || 's'}-${location.hash.split('-').slice(-1)[0]}`;
//~ }


// ok
function embodyTestS() {
    //~ const profile = appGetProfileByHash();
    //~ const profile_id = parseInt(location.hash.split('-').slice(-1)[0]);
    document.querySelector('.-test-s button:first-of-type').disabled = true;
    document.querySelectorAll('.-test-s input[type="radio"]').forEach(node => {
        node.checked = false;
        if (!node.onchange) {
            node.onchange = checkTestS;
        }
    });
}


function checkTestS() {
    var checked = 0;
    document.querySelectorAll('.-test-s input').forEach(node => {
        if (node.checked) checked += 1;
    });
    if (checked == 4) {
        document.querySelector('.-test-s button:first-of-type').disabled = false;
    }
}


// ok
function acceptTestS() {
    const form = document.querySelector('.-test-s form');
    const type_code = `${form.EI.value}${form.NS.value}${form.TF.value}${form.JP.value}`;
    appCachedProfileValue(9, appGetProfileByHash()[9]);
    //~ const tested_id = parseInt(location.hash.split('-').slice(-1)[0]);
    //~ window._cached_[9] = tested_id;
    soc_types.forEach((v, i) => {
        if (v[3] == type_code) appCachedProfileValue(1, i); // window._cached_[1] = i;
    });
    history.back();
}


function embodyTestP() {
    //~ const profile_id = parseInt(location.hash.split('-').slice(-1)[0]);
    const units = document.getElementsByClassName('-test-p');
    units[2].querySelector('button').disabled = true;
    units[1].querySelectorAll('input[type="radio"]').forEach(node => {
        node.checked = false;
        node.removeAttribute('data-checked');
        if (!node.onchange) {
            node.onchange = checkTestP;
        }
    });
    units[1].querySelectorAll('.step2').forEach(node => {
        node.classList.add('hidden');
    });
}



function checkTestP(step) {
    const units = document.getElementsByClassName('-test-p');
    const [form1, form2, form3] = units[1].querySelectorAll('form p');
    const checked1 = form1.querySelectorAll('input[data-checked]');
    const checked2 = form2.querySelectorAll('input[data-checked]');
    const checked3 = form3.querySelectorAll('input[data-checked]');
    if (event.target.parentNode.parentNode.childElementCount == 4 && checked1.length > 1) {
        embodyTestP();
    }
    event.target.checked = true;
    event.target.dataset.checked = true;
    //~ const block
    if (checked1.length == 1) {
        units[1].querySelectorAll('.step2').forEach(node => {
            node.classList.remove('hidden');
            form2.innerText = '';
            form3.innerText = '';
            form1.querySelectorAll('input').forEach(node => {
                let clone = node.parentNode.cloneNode(true);
                if (node.checked) {
                    form3.appendChild(clone);
                } else {
                    form2.appendChild(clone);
                }
                form2.querySelectorAll('input').forEach(node => {
                    node.checked = false;
                    node.removeAttribute('data-checked');
                    node.name = '13';
                    node.onchange = checkTestP;
                });
                form3.querySelectorAll('input').forEach(node => {
                    node.checked = false;
                    node.removeAttribute('data-checked');
                    node.name = '24';
                    node.onchange = checkTestP;
                });
            });
        });
    } else if (event.target.name == '13' && checked2.length) {
        form2.querySelectorAll('input').forEach(node => {
            if (node.value != event.target.value) {
                node.checked = false;
                node.removeAttribute('data-checked');
            } 
        });
    } else if (event.target.name == '24' && checked3.length) {
        form3.querySelectorAll('input').forEach(node => {
            if (node.value != event.target.value) {
                node.checked = false;
                node.removeAttribute('data-checked');
            } 
        });
    }
    if (units[1].querySelectorAll('input[data-checked]').length == 4) {
        units[2].querySelector('button').disabled = false;
    }
}


// ok
function acceptTestP() {
    const [f13, f24] = document.querySelectorAll('.-test-p form:not(:first-of-type)');
    const f1 = f13.querySelector('[data-checked]');
    const f3 = f13.querySelector('input:not([data-checked])');
    const f2 = f24.querySelector('[data-checked]');
    const f4 = f24.querySelector('input:not([data-checked])');
    const type_code = `${f1.value}${f2.value}${f3.value}${f4.value}`;
    appCachedProfileValue(9, appGetProfileByHash()[9]);
    psy_types.forEach((v, i) => {
        if (v[0] == type_code) {
            appCachedProfileValue(2, i);
        }
    });
    history.back();
}


function visit(name) {
    var map = {
        'default': 'https://vk.com/shorewards',
        'lexigo': 'https://vk.com/lexigo2',
        'antimatrix': 'https://vk.com/antimatriks',
        'lifetuner': 'https://vk.com/progressinator',
    }
    window.open(map[name || 'default']);
}

function share() {
    //replace with opening an external link to the corresponding post
    if (window.vk_user_id) {
        var theme = 'story-theme';
        sticker = 'sticker';
        vkBridge.send('VKWebAppShowStoryBox', {
            "background_type": "image",
            "url": `${location.origin}/story.png`,
            "locked": true,
        });
    } else {
        //
    }
}

function setup() {
    if (window.vk_user_id) {
        vkBridge
        .send("VKWebAppRecommend")
        .finally(() => {
            vkBridge
            .send("VKWebAppAddToFavorites")
            .finally(() => {
                vkBridge
                .send("VKWebAppAllowNotifications")
                .finally(() => {
                });
            });
        });
    } else {
        location.hash = '-settings';
    }
}

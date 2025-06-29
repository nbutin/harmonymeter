const app_initial_characters = [...characters];
var app_selected_character = 1;


window.leap_triggers = {
    '^-main(-.*)?$': buildMap,
    '^-select$': buildSelector,
    '^-diagnosis-\\d+$': buildDiagnosis,
    '^-spec-p-\\d+$': buildSpec,
    '^-edit(-.*)?$': prepareEditForm,
    '^-test-s-\\d+$': prepareTestS,
    '^-test-p-\\d+$': prepareTestP,
};

document.addEventListener('DOMContentLoaded', () => {
    prepareSelectors();
    loadValues();
    engageTriggers();
    buildMap();
    vkInit();
});

function calcSocRating(type_id) {
    if (type_id < 0 || characters[app_selected_character][1] < 0) return [-1, -1, []];
    const selected = soc_types[characters[app_selected_character][1]];
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
    if (type_id < 0 || characters[app_selected_character][2] < 0) return [-1, -1, []];
    const selected = psy_types[characters[app_selected_character][2]];
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
    const soc_rating = calcSocRating(characters[profile_id][1]);
    const psy_rating = calcPsyRating(characters[profile_id][2]);
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


function calcAllRatings() {
    var map = [];
    for (let i = 0; i < characters.length; i++) {
        if (`${characters[app_selected_character]}` != `${characters[i]}`) {
            map.push(calcRating(i));
        }
    }
    return map.sort((a, b) => sumRating(b) - sumRating(a));
}


function buildMap() {
    const first = calcRating(app_selected_character);
    const empty = [-1, -1, -1, -1, [], []];
    var items = [first, ...calcAllRatings(), empty, empty, empty, empty, empty];
    items = items.slice(0, (-items.length % 4) || -4);
    var html = '';
    for (let x = 0; x < items.length; x++) {
        const i = items[x];
        const profile = characters[i[6]];
        let sr = `soc${percentToText(i[4][0], i[4][1])}`;
        let pr = `psy${percentToText(i[5][0], i[5][1])}`;
        let f1 = '';
        try {
            f1 = psy_types[profile[2]][0].slice(0, 1);
        } catch {
            f1 = 'В';
        }
        f1 = {'Ф': 'P1', 'В': 'V1', 'Э': 'E1', 'Л': 'L1'}[f1];
        let f2 = '';
        try {
            f2 = psy_types[profile[2]][0].slice(1, 2);
        } catch {
            f2 = 'Э';
        }
        f2 = {'Ф': 'P2', 'В': 'V2', 'Э': 'E2', 'Л': 'L2'}[f2];
        let ie = '';
        try {
            let x = soc_types[profile[1]][2].slice(0, 1);
            if (x == x.toLowerCase()) ie = 'sI';
            else throw new Error();
        } catch {
            ie = 'sE';
        }
        let jp = '';
        try {
            let x = soc_types[profile[1]][0].slice(0, 1);
            if ('ис'.includes(x.toLowerCase())) jp = 'sP';
            else throw new Error();
        } catch {
            jp = 'sJ';
        }
        var url = getImageUrl(i[6]);
        var href = `-diagnosis-${i[6]}`;
        if (x == 0) href = '-select';
        else if (i[6] === undefined) href = '-edit-';
        else if (i[6] === 0 && (profile[1] + profile[2]) > -2) href = '-diagnosis-0';
        else if (i[6] === 0) href = '-edit-0';
        var flag = '';
        if (!x || i[6] === undefined) flag = 'special';
        var name = getAbbr(i[6]);
        html += `
<div class="item ${sr} ${pr} ${f1} ${f2} ${ie} ${jp} ${flag}">
    <div>
        <p>
            <a onclick="location.hash = '${href}'" style="background-image:url(${url})"><i><b>${(!url && name) || (!url && '?') || ''}</b></i></a>
        </p>
    </div>
</div>
`;
    }
    document.getElementById('map').innerHTML = html;
    return html;
}

function buildSelector() {
    var items = [0, ...Object.keys(characters).slice(1).reverse()];
    var html = '';
    items.forEach(i => {
        let url = getImageUrl(i);
        if (url) var image = `<img src="${url}" />`;
        else var image = `<b>${getAbbr(i)}</b>`;
        let selected = (app_selected_character == i) && 'selected' || '';
        html += `<i class="${selected}"><a onclick="app_selected_character = ${i}; location.hash = '-main'">${image}</a></i>`;
    });
    if (items.length % 4) html += `<i style="width: calc(100% * ${4 - items.length % 4} / 4); aspect-ratio:${4 - items.length % 4}"></i>`;
    document.getElementById('selector').innerHTML = html;
}

function getImageUrl(character_id) {
    if (character_id && '1 2 3 4 5 6 7 8 9'.includes(character_id)) {
        return `images/${character_id}.jpg`;
    } else {
        return localStorage[`image-${character_id}`];
    }
}

function getAbbr(character_id, name) {
    var name = (name && [name] || characters[character_id] || [''])[0].split(' ');
    var abbr = '';
    if (name.length > 1) name.forEach(i => {abbr += i[0].toUpperCase()});
    return (abbr || name[0]).slice(0, 3);
}


function percentToText(n1, n2) {
    if (n1 < 0 || n2 - n1 > 50) return 'none';
    else if (n1 >= 80) return 'best';
    else if (n1 >= 60) return 'good';
    else if (n1 >= 45) return 'norm';
    else if (n1 >= 30) return 'poor';
    else return 'sick';
}

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

function formatRatingDetails(items) {
    var html = '';
    items.forEach(i => {
        html += `<li class="${getColorMark(i)}-marked">✔ ${i.replace(' и ', ' и&nbsp;')},</li>`;
    });
    return html && html.slice(0, -6) + '.</li>' || '';
}

function buildDiagnosis() {
    const id1 = app_selected_character;
    const id2 = parseInt(location.hash.split('-').slice(-1)[0]);
    const tested = characters[id2];
    const selected = characters[id1];
    if (id1 == 0) link1e = '-edit-0';
    else if ([1,2,3,4,5,6,7,8,9].includes(id1)) link1e = `-edit-r-${id1}`;
    else link1e = `-edit-w-${id1}`;
    if (id2 == 0) link2e = '-edit-0';
    else if ([1,2,3,4,5,6,7,8,9].includes(id2)) link2e = `-edit-r-${id2}`;
    else link2e = `-edit-w-${id2}`;
    var link1s = `-spec-s-${selected[1]}`;
    var link2s = `-spec-s-${tested[1]}`;
    var link1p = `-spec-p-${selected[2]}`;
    var link2p = `-spec-p-${tested[2]}`;
    var url1 = getImageUrl(id1);
    var url2 = getImageUrl(id2); ///////////////////////////////
    if (url1) var image1 = `<img src="${url1}" onclick="location.hash = '${link1e}'" />`;
    else var image1 = `<a onclick="location.hash = '${link1e}'"><b>${getAbbr(id1)}</b></a>`;
    if (url2) var image2 = `<img src="${url2}" onclick="location.hash = '${link2e}'" />`;
    else var image2 = `<a onclick="location.hash = '${link2e}'"><b>${getAbbr(id2)}</b></a>`;
    const rating = calcRating(id2);
    if (rating[0] == rating[1]) var sum_percent = rating[0];
    else var sum_percent = `от ${rating[0]} до ${rating[1]}`;
    if (rating[4][0] > -1) var soc_percent = rating[4][0] + '%';
    else var soc_percent = 'не известно';
    if (rating[5][0] > -1) var psy_percent = rating[5][0] + '%';
    else var psy_percent = 'не известно';
    var sum_rating = percentToText(rating[0], rating[1]);
    var soc_rating = percentToText(rating[4][0], rating[4][1]);
    var psy_rating = percentToText(rating[5][0], rating[5][1]);
    var soc_details = formatRatingDetails(rating[4][2]);
    var psy_details = formatRatingDetails(rating[5][2]);
    document.getElementById('sum-percent').innerText = sum_percent;
    var html = `
        <tr class="${sum_rating}">
            <td>
                <i>${image1}</i>
            </td>
            <td>
                <i>${image2}</i>
            </td>
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
                <div><button onclick="location.hash = '${tested[1] >= 0 && link2s || link2e}'">${tested[1] >= 0 && soc_types[tested[1]][1] || '&nbsp; ? &nbsp;'}</button></div>
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
                <div><button onclick="location.hash = '${tested[2] >= 0 && link2p || link2e}'">${tested[2] >= 0 && psy_types[tested[2]][1] || '&nbsp; ? &nbsp;'}</button></div>
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
    document.querySelector('#diagnosis table').innerHTML = html;
}


function buildSpec(type_id) {
    var type = psy_types[type_id || location.hash.split('-').slice(-1)[0]];
    document.querySelector('.-spec-p h3').innerText = `${type[1]} (${type[0]})`;
    document.querySelectorAll('.-spec-p strong').forEach((node, i) => {
        node.innerText = functions[type[0][i]];
    });
}


function prepareEditForm() {
    console.log(22222, window.accepted_p);
    function fromTestOr(s_or_p, id, v) {
        try {
            return window[`accepted_${s_or_p}`][0] == id && window[`accepted_${s_or_p}`][1] || v
        } catch {
            return v
        }
    }
    var profile_id = parseInt(location.hash.split('-').slice(-1)[0]);
    const profile = characters[profile_id];
    //~ const headers = document.querySelectorAll('.-edit.header h2');
    const [input_id, input_file, input_name, soc_selector, psy_selector] = document.querySelectorAll('.-edit input, .-edit select');
    const [soc_hint, psy_hint] = document.querySelectorAll('.-edit.hint div');
    const button = document.querySelector('.-edit button');
    const image = document.getElementById('userpic');
    //~ headers.forEach(node => {node.classList.add('hidden')});
    input_name.disabled = false;
    soc_selector.disabled = false;
    psy_selector.disabled = false;
    soc_hint.innerHTML = '';
    psy_hint.innerHTML = '';
    button.disabled = true;
    if (!profile) {
        input_id.value = '';
        //~ headers[1].classList.remove('hidden');
        input_name.value = '';
        
        soc_selector.value = fromTestOr('s', profile_id, -1);
        changedProfile(0, soc_selector.value);
        psy_selector.value = fromTestOr('p', profile_id, -1);
        changedProfile(1, psy_selector.value);
        image.innerHTML = `<i><b>?</b></i>`;
    } else {
        input_id.value = profile_id;
        input_name.value = profile[0];
        soc_selector.value = fromTestOr('s', profile_id, profile[1]);
        changedProfile(0, soc_selector.value);
        psy_selector.value = fromTestOr('p', profile_id, profile[2]);
        changedProfile(1, psy_selector.value);
        image_url = getImageUrl(profile_id);
        if (image_url) image.innerHTML = `<img src="${image_url}" />`;
        else image.innerHTML = `<i><b>${getAbbr(profile_id)}</b></i>`;
        if (profile[1] >= 0) {
            soc_hint.innerHTML = document.querySelector(`.-spec-s-${profile[1]}`).innerHTML;
        }
        if (profile[2] >= 0) {
            buildSpec(profile[2]);
            psy_hint.innerHTML = document.querySelector('.-spec-p:not(.header)').innerHTML;
        }
        if (profile_id === 0) {
            //~ headers[0].classList.remove('hidden');
            input_name.disabled = true;
        } else if ('1 2 3 4 5 6 7 8 9'.includes(profile_id)) {
            //~ headers[2].classList.remove('hidden');
            input_name.disabled = true;
            soc_selector.disabled = true;
            psy_selector.disabled = true;
        } else {
            //~ headers[3].classList.remove('hidden');
        }
    }
}

function prepareSelectors() {
    const [soc_selector, psy_selector] = document.querySelectorAll('.-edit select');
    var items = ['<option value="-1">Социотип ( ? )</option>', '<option value="test">Определить с помощью теста...</option>'];
    soc_types.forEach((v, i) => {
        items.push(`<option value="${i}">${v[0]}, ${v[1]}</option>`);
    });
    soc_selector.innerHTML = items.join('\n');
    items = ['<option value="-1">Психотип ( ? )</option>', '<option value="test">Определить с помощью теста...</option>'];
    psy_types.forEach((v, i) => {
        items.push(`<option value="${i}">${v[0]}, ${v[1]}</option>`);
    });
    psy_selector.innerHTML = items.join('\n');
}

function changedProfile(i, value) {
    if (value == 'test') test(i);
    setTimeout(() => {
        document.querySelector('.-edit button').disabled = false;
        const image = document.getElementById('userpic');
        const hints = document.querySelectorAll('.-edit.hint div');
        const profile_id = location.hash.split('-').slice(-1)[0];
        const image_url = getImageUrl(profile_id);
        if (i == 2) {
            if (!image_url) image.innerHTML = `<i>${getAbbr(-1, value)}</i>`;
            return;
        } else if (i == 0) {
            if (parseInt(value) >= 0) {
                hints[i].innerHTML = document.querySelector(`.-spec-s-${value}`).innerHTML;
            } else {
                hints[i].innerHTML = '';
            }
        } else if (i == 1) {
            if (parseInt(value) >= 0) {
                buildSpec(value);
                hints[i].innerHTML = document.querySelector('.-spec-p:not(.header)').innerHTML;
            } else {
                hints[i].innerHTML = '';
            }
        }
    }, 1);
}

function saveProfile() {
    const [input_id, input_file, input_name, soc_selector, psy_selector] = document.querySelectorAll('.-edit input, .-edit select');
    const value = [input_name.value.slice(0, 23).trim(), parseInt(soc_selector.value), parseInt(psy_selector.value)];
    if (input_id.value === '') {
        characters.push(value);
    } else if (input_name.value.trim() === '') {
        characters[input_id.value] = [];
    } else {
        characters[input_id.value] = value;
    }
    toStorage('characters', characters);
}

function fromStorage(key) {
    let val = JSON.parse(localStorage[key] || '""');
    return val;
}

function toStorage(key, val) {
    localStorage[key] = JSON.stringify(val);
}

function selectFile() {
    document.getElementById('uploaded').click();
}

function loadValues() {
    var stored = fromStorage('characters');
    (typeof(stored) == 'object'&& stored.length && stored || {}).forEach((v, i) => {
        if (!'1 2 3 4 5 6 7 8 9 '.includes(i)) {
            characters[i] = v;
        }
    });
}

function switchHome() {
    if (location.hash == '#-main') location.hash = '-select';
    else location.hash = '-main';
}

function test(v) {
    location.hash = `-test-${v && 'p' || 's'}-${location.hash.split('-').slice(-1)[0]}`;
}

function prepareTestS() {
    window.accepted_s = [];
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


function acceptTestS() {
    const form = document.querySelector('.-test-s form');
    const type_code = `${form.EI.value}${form.NS.value}${form.TF.value}${form.JP.value}`;
    const tested_id = parseInt(location.hash.split('-').slice(-1)[0]);
    soc_types.forEach((v, i) => {
        if (v[3] == type_code) window.accepted_s = [tested_id, i];
    });
    history.back();
}


function prepareTestP() {
    window.accepted_p = [];
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
    const checked = form1.querySelectorAll('input[data-checked]');
    if (event.target.parentNode.parentNode.childElementCount == 4 && checked.length > 1) {
        prepareTestP();
    }
    event.target.checked = true;
    event.target.dataset.checked = true;
    if (checked.length == 1) {
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
    }
    if (units[1].querySelectorAll('input[data-checked]').length == 4) {
        units[2].querySelector('button').disabled = false;
    }
}

function acceptTestP() {
    const [f13, f24] = document.querySelectorAll('.-test-p form:not(:first-of-type)');
    const f1 = f13.querySelector('[data-checked]');
    const f3 = f13.querySelector('input:not([data-checked])');
    const f2 = f24.querySelector('[data-checked]');
    const f4 = f24.querySelector('input:not([data-checked])');
    const type_code = `${f1.value}${f2.value}${f3.value}${f4.value}`;
    const tested_id = parseInt(location.hash.split('-').slice(-1)[0]);
    psy_types.forEach((v, i) => {
        if (v[0] == type_code) window.accepted_p = [tested_id, i];
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

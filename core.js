var core_history_of_embodyings = ['', '', ''];

document.addEventListener('DOMContentLoaded', () => {
    //~ if ('serviceWorker' in navigator) {
        //~ navigator.serviceWorker.register('sw.js')
        //~ .then(() => {
            //~ console.log('Service Worker Registered');
        //~ });
    //~ }
    window.addEventListener('hashchange', embody);
});


function embody(){
    var hash = location.hash.slice(1) || '-main';
    console.log('embodied', hash);
    document.querySelectorAll(':is(div, button).part-of').forEach(node => {
        let context = hash;
        while (context) {
            if (node.classList.contains(context)) {
                node.hidden = false;
                break;
            }
            context = context.split('-').slice(0, -1).join('-');
        }
        if (!context) {
            node.hidden = true;
        }
    });
    scroll(0, 0);
    core_history_of_embodyings.unshift(hash);
    core_history_of_embodyings = core_history_of_embodyings.slice(0, 5);
    Object.entries(window.embodying_triggers || {}).forEach(i => {
        if (hash.match(new RegExp(i[0]))) i[1]();
    });
}


function coreGetSuiteParam() {
    var param = coreGetSuiteParamsAll().slice(-1)[0];
    if (parseFloat(param) == param) {
        return parseFloat(param);
    } else {
        return param;
    }
}


function coreGetSuiteParamsAll() {
    return location.hash.slice(1).split('-');
}


// ok
function coreAcronym(name) {
    var name = name && `${name}`.split(' ') || '';
    var abbr = '';
    if (name.length > 1) name.forEach(i => {abbr += i[0] && i[0].toUpperCase() || ''});
    return (abbr || name[0] || '').slice(0, 3);
}

function embedded(scheme) {
    var tag = scheme.shift();
    if (!scheme.length) return `<${tag}></${tag}>`;
    else return `<${tag}>${embedded(scheme)}</${tag}>`;
}

// ok
//~ function coreBadge(label, action, scheme, modifiers) {
    //~ if (label && label.search(/.\.(png|jpe?g|svg|gif)$|^data:image\//) >= 0) var [url, abbr] = [label, ''];
    //~ else var [url, abbr] = ['', label && coreAcronym(label) || '?'];
    //~ action = action && action.replaceAll('"', "'");
    //~ scheme = scheme && typeof(scheme) != 'string' && 'buabui' || scheme || 'ai';
    //~ modifiers = typeof(modifiers) == 'string' && modifiers.trim().split(/\s+/) || modifiers;
    //~ var html = `<b class="badge${modifiers && ' ' + modifiers.join(' ') || ''}">${embedded(scheme.split(''))}</b>`;
    //~ html = html.replace('</a>', `</a><a${url && ' style="background-image:url(\'' + url + '\')"' || ''}${action && ' onclick="' + action + '"' || ''}></a>`);
    //~ html = html.replace('<i></i>', `<i>${abbr || '?'}</i>`);
    //~ return html;
//~ }


function coreBadge(image, label, onclick, featured, modifiers) {
    onclick = onclick && onclick.replaceAll('"', "'");
    featured = featured && typeof(featured) != 'string' && 'buai' || featured || 'ai';
    modifiers = typeof(modifiers) == 'string' && modifiers.trim().split(/\s+/) || modifiers;
    var html = `<b class="badge${modifiers && ' ' + modifiers.join(' ') || ''}">${embedded(featured.split(''))}</b>`;
    html = html.replace('<i></i>', `<i>${coreAcronym(label) || '?'}</i>`);
    html = html.replace('</a>', `</a><a style="background-image:url('${image || ''}')" onclick="${onclick || ''}"><b></b></a>`);
    return html;
}


// OK
function vkInit() {
    vkBridge
    .send('VKWebAppInit')
    .then(data => {
        console.log('vkBridge.VKWebAppInit returns', data)
        if (!data.result) throw new Error();
        console.log('vkBridge initialized');
        document.body.classList.add('-vk');
        window.vk_user_id = 
            location.search.match(/vk_user_id=(\d+)/)[1];
        window.vk_is_recommended = 
            location.search.includes('vk_is_recommended=1');
        window.vk_are_notifications_enabled = 
            location.search.includes('vk_are_notifications_enabled=1');
        window.vk_is_favorite = 
            location.search.includes('vk_is_favorite=1');
    })
    .catch(error => {
        console.error(error);
    });
}


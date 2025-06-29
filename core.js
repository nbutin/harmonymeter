document.addEventListener('DOMContentLoaded', () => {
    //~ if ('serviceWorker' in navigator) {
        //~ navigator.serviceWorker.register('sw.js')
        //~ .then(() => {
            //~ console.log('Service Worker Registered');
        //~ });
    //~ }
    window.addEventListener('hashchange', leap);
    leap();
});


function engageTriggers() {
    Object.entries(window.leap_triggers || {}).forEach(i => {
        if (location.hash.slice(1).match(new RegExp(i[0]))) i[1]();
    });
}


function leap(){
    // by style.display = none|unset        && 
    var hash = location.hash.slice(1) || '-main';
    console.log('Leap to', hash);
    document.querySelectorAll(':is(div, button).unit-at').forEach(node => {
        let context = hash;
        while (context) {
            if (node.classList.contains(context)) {
                node.classList.remove('hidden');
                break;
            }
            context = context.split('-').slice(0, -1).join('-');
        }
        if (!context) {
            node.classList.add('hidden');
        }
    });
    scroll(0, 0);
    engageTriggers();
}

function acronym(name) {
    var name = name.split(' ');
    var abbr = '';
    if (name.length > 1) name.forEach(i => {abbr += i[0].toUpperCase()});
    return (abbr || name[0]).slice(0, 3);
}

function embedded(scheme) {
    var tag = scheme.shift();
    if (!scheme.length) return `<${tag}></${tag}>`;
    else return `<${tag}>${embedded(scheme)}</${tag}>`;
}

function badge(label, action, scheme, modifiers) {
    if (label && label.search(/.\.(png|jpe?g|svg|gif)$|^data:image\//) >= 0) var [url, abbr] = [label, ''];
    else var [url, abbr] = ['', label && acronym(label) || '?'];
    action = action && action.replaceAll('"', "'");
    scheme = scheme && typeof(scheme) != 'string' && 'buabui' || scheme || 'ai';
    modifiers = typeof(modifiers) == 'string' && modifiers.trim().split(/\s+/) || modifiers;
    var html = `<b class="badge${modifiers && ' ' + modifiers.join(' ') || ''}">${embedded(scheme.split(''))}</b>`;
    html = html.replace('<a>', `<a${url && ' style="background-image:url(\'' + url + '\')"' || ''}${action && ' onclick="' + action + '"' || ''}>`);
    html = html.replace('<i></i>', `<i>${abbr || ''}</i>`);
    return html;
}


// OK
function vkInit() {
    vkBridge.send('VKWebAppInit')
    .then(data => {
        console.log('vkBridge.VKWebAppInit returns', data)
        if (!data.result) throw new Error();
        console.log('vkBridge initialized');
        document.body.classList.add('-vk');
        window.vk_user_id = location.search.match(/vk_user_id=(\d+)/)[1];
        window.vk_is_recommended = location.search.includes('vk_is_recommended=1');
        window.vk_are_notifications_enabled = location.search.includes('vk_are_notifications_enabled=1');
        window.vk_is_favorite = location.search.includes('vk_is_favorite=1');
    })
    .catch(error => {
        console.error(error);
    });
}


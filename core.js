//~ var previous_place = '';
//~ var location_params = [];

document.addEventListener('DOMContentLoaded', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
        .then(() => {
            console.log('Service Worker Registered');
        });
    }
    window.addEventListener('hashchange', rebuild);
    location.hash = `at-home-${Date.now()}`;
});

function rebuild(){
    console.log('New context:', location.hash);
    const context = location.hash.slice(1);
    document.querySelectorAll('.contextual').forEach(node => {
        node.classList.add('hidden');
        var hash = 'at';
        context.split('-').slice(1).forEach(x => {
            hash += `-${x}`;
            if (node.classList.contains(hash)) {
                node.classList.remove('hidden');
            }
        });
    });
    scroll(0, 0);
    window.built = context;
    Object.entries(hashchange_triggers || {}).forEach(i => {
        if (context.match(new RegExp(i[0]))) i[1]();
    });
}


//~ function relocate(){
    //~ console.log('New location:', location.hash);
    //~ const hash = location.hash.slice(1);
    //~ const [placed, params] = hash.split('__');
    //~ location_params = (params || '').split('_');
    //~ if (placed != previous_place) {
        //~ document.querySelectorAll('.placed').forEach(node => {
            //~ if (node.classList.contains(placed) || node.classList.contains(placed.split('--')[0])) {
                //~ node.classList.remove('hidden');
            //~ } else {
                //~ node.classList.add('hidden');
            //~ }
        //~ });
        //~ scroll(0, 0);
    //~ }
    //~ previous_place = placed;
    //~ let triggers;
    //~ try {triggers = hashchange_triggers}
    //~ catch {triggers = {}}
    //~ Object.entries(triggers).forEach(kv => {
        //~ if (hash.match(new RegExp(kv[0]))) kv[1]();
    //~ });
//~ }

export function debounce(fn, delay = 400) {
    let timer = null;

    function debounced(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    }

    debounced.cancel = () => {
        clearTimeout(timer);
        timer = null;
    };

    return debounced;
}
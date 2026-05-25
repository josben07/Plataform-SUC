/* ========================= */
/* DARK MODE */
/* ========================= */

const themeToggle =
    document.getElementById('theme-toggle');

/* LOAD SAVED THEME */

if(localStorage.getItem('theme') === 'dark'){

    document.body.classList.add('dark-mode');

    themeToggle.innerHTML = '☀️';
}

/* TOGGLE */

themeToggle.addEventListener('click', () => {

    document.body.classList.toggle('dark-mode');

    /* SAVE THEME */

    if(document.body.classList.contains('dark-mode')){

        localStorage.setItem('theme', 'dark');

        themeToggle.innerHTML = '☀️';

    }else{

        localStorage.setItem('theme', 'light');

        themeToggle.innerHTML = '🌙';
    }
});
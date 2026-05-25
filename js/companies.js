/* ========================= */
/* MOUSE LIGHT EFFECT */
/* ========================= */

const growthPanels =
document.querySelectorAll(
    ".growth-panel"
);

growthPanels.forEach(panel => {

    panel.addEventListener(
        "mousemove",
        e => {

            const rect =
            panel.getBoundingClientRect();

            const x =
            e.clientX - rect.left;

            const y =
            e.clientY - rect.top;

            panel.style.setProperty(
                "--x",
                `${x}px`
            );

            panel.style.setProperty(
                "--y",
                `${y}px`
            );

        }
    );

});

/* ========================= */
/* SCROLL REVEAL */
/* ========================= */

const reveals =
document.querySelectorAll(
    ".reveal"
);

window.addEventListener(
    "scroll",
    revealSections
);

function revealSections(){

    const triggerBottom =
    window.innerHeight * 0.85;

    reveals.forEach(section => {

        const sectionTop =
        section.getBoundingClientRect().top;

        if(
            sectionTop < triggerBottom
        ){

            section.classList.add(
                "active"
            );

        }

    });

}

/* INITIAL */

revealSections();

/* ========================= */
/* COUNTER */
/* ========================= */

const counters =
document.querySelectorAll(
    ".counter"
);

const speed = 120;

counters.forEach(counter => {

    const updateCounter = () => {

        const target =
        +counter.dataset.target;

        const count =
        +counter.innerText;

        const increment =
        target / speed;

        if(count < target){

            counter.innerText =
            Math.ceil(
                count + increment
            );

            setTimeout(
                updateCounter,
                20
            );

        }else{

            counter.innerText =
            target.toLocaleString();
        }

    };

    updateCounter();

});
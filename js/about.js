/* ========================= */
/* COUNTER */
/* ========================= */

const counters =
document.querySelectorAll(".counter");

counters.forEach(counter => {

    const updateCounter = () => {

        const target =
        +counter.dataset.target;

        const current =
        +counter.innerText;

        const increment =
        target / 100;

        if(current < target){

            counter.innerText =
            Math.ceil(
                current + increment
            );

            setTimeout(
                updateCounter,
                25
            );

        }else{

            counter.innerText =
            target.toLocaleString();
        }

    };

    updateCounter();

});
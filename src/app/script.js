function hand_appButton(btn) {
    btn.addEventListener(() => {
        const appName = btn.id;

        window.history.pushState(null, "", null);
        location.pathname = '/app/' + appName;
        console.log();
    });
}

function setHand_appButton() {
    Array.from(document.getElementById('apps').children).forEach((btn) => {
        hand_appButton(btn);
    });
}
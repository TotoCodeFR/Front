function hand_appButton(btn) {
    btn.addEventListener('click', () => {
        const appName = btn.id;

        window.history.pushState(null, "", `/app/${appName}`);

        location.reload();
    });
}

function setHand_appButton() {
    for (const btn of document.getElementById('apps').children) {
        console.log(btn);
        hand_appButton(btn);
    };
}

setHand_appButton();
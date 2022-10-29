let count;

function getPhotos() {
    var x = new XMLHttpRequest();
    x.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var y = JSON.parse(this.responseText);
            count = y.length;
            document.getElementById("product-list").innerHTML = '${count} Photos';

            y.forEach((obj) => {
                document.getElementById(
                    "test"
                ).innerHTML += `<div id=${obj.id} class="list" onClick="fadeOutEffect(${obj,id})">
                    <img src=${obj.url} width="600" height="400"/>
                    <div class="description">${obj.title}</div>
                </div>`;
            });
            }
        }
        x.open(
            "Get",
            "https://jsonplaceholder.typicode.com/albums/2/photos",
            true
        );
        x.send();
}

function fadeOutEffect(imgtarget) {
    const image = document.getElementById(imgtarget);

    let opacity = 1;

    const fadeTimer = setInterval(function () {
        if (opacity <= 0.1) {
            clearInterval(fadeTimer);
            image.remove();
            count--
            document.getElementById("product-list").innerHTML = `<div>${count} Photos</div>`;
        }
        image.style.opacity = opacity;
        opacity -= 0.1;
    }, 50);
}
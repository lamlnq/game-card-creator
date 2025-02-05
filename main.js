function ucFirst(str, all = false) {
    if (str === undefined || str === null) {
        return str;
    }
    if (!all) {
        return str.trim().substring(0, 1).toUpperCase() + str.substring(1);
    } else {
        const nameArray = str.trim().split(' ');
        let result = [];
        for (let i = 0; i < nameArray.length; i++) {
            if (nameArray[i][0]) {
                result.push(nameArray[i][0].toUpperCase() + '' + nameArray[i].substring(1));
            }
        }
        return result.join(' ');
    }
}

//=============================

const card = new fabric.Canvas('cardViewer');
const nameOption = {
    fill: '#e8e7b8',
    fontSize: 26,
    fontFamily: 'Be Vietnam',
    fontWeight: 'bold',
    textAlign: 'center',
    left: 100,
    top: 60
};
const detailOption = {
    fill: '#1e1d1d',
    fontSize: 22,
    fontFamily: 'Be Vietnam',
    fontWeight: 'normal',
    textAlign: 'left',
    left: 70,
    top: 550,
    width: 400,
    height: 90
}


fabric.Image.fromURL('./card-frame.png', (oImg) => {
    oImg.scaleToWidth(512);
    oImg.selectable = false;
    card.insertAt(oImg, 1);
},{crossOrigin: "anonymous"});
let sourceStar = null;
fabric.Image.fromURL('./star.png', (oImg) => {
    oImg.scaleToWidth(35);
    oImg.selectable = false;
    sourceStar = oImg;
    addStar(5)
    addDetail("Card detail")
    addName('Card Name');
},{crossOrigin: "anonymous"});

let cardName = null;
let cardDetail = null;
let cardImage = null;
let cardStar = [];
let currentCard = null;

function addName(cardNameStr) {
    if (cardName) {
        card.remove(cardName)
    }
    cardName = new fabric.Text(ucFirst(cardNameStr, true), nameOption);
    card.add(cardName)
    cardName.centerH()
    cardName.selectable = false;
}

function addPhoto(e) {
	if(cardImage) {
		card.remove(cardImage);
	}
    const reader = new FileReader();
    reader.onload = function (event){
        let imgObj = new Image();
        imgObj.src = event.target.result;
        imgObj.onload = function () {
            cardImage = new fabric.Image(imgObj);
            cardImage.scaleToWidth(450);
            cardImage.set({
                left: 30,
                top: 115
            })
            card.insertAt(cardImage, 0);
            card.renderAll();
        }
    }
    reader.readAsDataURL(e.files[0]);
}
function addDetail(detail) {
    if (cardDetail) {
        card.remove(cardDetail)
    }
    cardDetail = new fabric.Textbox(ucFirst(detail), detailOption);
    card.add(cardDetail)
    cardDetail.selectable = false;
}

function addStar(value) {
    if (cardStar.length > 0) {
        for (const star of cardStar) {
            card.remove(star);
        }
    }
    for (let i = 1; i <= value; i++) {
        sourceStar.clone(cloned => {
            cardStar.push(cloned)
            cloned.set({
                left: 18 + (i * 40),
                top: 648
            })
            card.insertAt(cloned, 2);
        });
    }
}

function updateCard() {
    if (document.getElementById('cardName').value.length > 1) {
        addName(document.getElementById('cardName').value);
    }
    if (document.getElementById('cardDetail').value.length > 0) {
        addDetail(document.getElementById('cardDetail').value);
    }
    if (document.getElementById('cardRating').value > 0) {
        addStar(document.getElementById('cardRating').value);
    }
    const card = {
        name: document.getElementById('cardName').value,
        detail: document.getElementById('cardDetail').value,
        rate: document.getElementById('cardRating').value,
        photo: {
            data: cardImage.toDataURL(),
            left: cardImage.left,
            top: cardImage.top
        },
    }
    window.api.send('save', JSON.stringify(card))
}
function saveCard() {
    card.getElement().toBlob(function(blob) {
        if (currentCard.name) {
            saveAs(blob, currentCard.name + ".png");
        } else {
            saveAs(blob, "card.png");
        }
    });
}

function clearCard() {
    addName('Card')
    document.getElementById('cardName').value = ''
    addDetail('')
    document.getElementById('cardDetail').value = ''
    addStar(1)
    document.getElementById('cardRating').value = 1
    if (cardImage) {
        card.remove(cardImage)
    }
}
function loadCard(name) {
    window.api.send('get', name)
}

window.api.receive('get', (dataStr) => {
    const data = JSON.parse(dataStr)
    currentCard = data;
    addName(data.name)
    document.getElementById('cardName').value = data.name
    addDetail(data.detail)
    document.getElementById('cardDetail').value = data.detail
    addStar(data.rate)
    document.getElementById('cardRating').value = data.rate
    if (cardImage) {
        card.remove(cardImage)
    }
    new fabric.Image.fromURL(data.photo.data,(oim) => {
        cardImage = oim
        cardImage.scaleToWidth(450);
        cardImage.set({
            left: data.photo.left,
            top: data.photo.top
        })
        card.insertAt(cardImage, 0);
        card.renderAll();
    },{crossOrigin: "anonymous"});
    card.renderAll()
})
window.api.receive('list', (dataStr) => {
    const data = JSON.parse(dataStr);
    const mainDiv = document.getElementById('cardList')
    mainDiv.innerHTML = ''
    for (const card of data) {
        const sub = document.createElement('li')
        const img = document.createElement('img')
        const label = document.createElement('span')
        img.src = card.photo.data
        label.innerText = card.name
        sub.append(img)
        sub.append(label)
        mainDiv.append(sub)
        sub.onclick = () => {
            loadCard(card.name)
        }
    }

})


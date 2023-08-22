/**  @class*/
class Card {
  /** 
   * @constructor
   * @param {number} type Для сравнения
   * @property {string} state - false||true состояние карты
   * @property {string} color - rgb в строке
   *  */
  constructor(type) {
    this.type = type;
    /**@type {string} */
    this.state = "false";
    /**@type {string} */
    this.color
  }

  /**  
     * @static фабрика
     * @param {number} cardsPairs сколько пар карточек создать
     * @returns {[[Card,Card]]}
    */
  static cards(cardsPairs) {
    /**@type {[[Card,Card]]} */
    let cards = Array(cardsPairs).fill(null); // делим на 2 для создания пар

    cards = cards.map((v, i) => {
      return [new Card(i), new Card(i)];
    });
    return cards;
  }

  /**  
    * @static Смешиваем массив
    * @param {number} cardsPairs сколько пар карточек создать
    * @returns {Card[]}
    */
  static mixingCards(cardsPairs) {
    let mixin = [];

    /**@type {[[Card,Card]]} */
    let cards = Card.cards(cardsPairs);
    cards.forEach(v => mixin.push(v[0], v[1]));
    return mixinArr(mixin);
  }
}

/**
 *  Смешивает массив
 * @param {Array} mixin 
 * @returns {Array} массив смешан
 */
function mixinArr(mixin) {
  let mixinTrue = [];
  while (mixin.length) {
    let randomNumber = Math.floor(Math.random() * mixin.length);
    let randomValue = mixin.splice(randomNumber, 1);
    mixinTrue.push(...randomValue);
  }
  return mixinTrue;
}

/** @class управляет состоянием */
class Synk {
  /** @param {number} cardsPairs*/
  constructor(cardsPairs) {
    /** @type {Card[]} */
    this.mixingCards = Card.mixingCards(cardsPairs);
  }
}

/**Функция рисует картачки
 * @param {Synk} synk Смешанные картачки
 * @returns {[HTMLDivElement]} 
 * */
function eltHtml(synk) {
  let arrElement = [];
  synk = synk.mixingCards.forEach((card, i, a) => {
    let divCard = document.createElement("div");

    arrElement.push(divCard);
  });
  return arrElement;
}

/**@class занимается отрисовкой карт */
class DomDraw {
  /** @param {Synk} synk */
  constructor(synk) {
    /**Коробка где будет находиться игра */
    let boxGame = document.getElementById("box_game");

    /**@type {[HTMLDivElement]} */
    let draw = eltHtml(synk);
    boxGame.append(...draw);

    this.draw = draw;
    this.synk = synk;
  }

  /**
     * @param {number} time  время действия анимации
     * @returns {this}
     */
  startAnim(time) {
    let mixingCards=this.synk.mixingCards

    /**укороченный способ нахождения типов карт */
    let getCard = i => {
      return mixingCards[i].type; 
    };
    let timeCardAnim = time => {
      return (time-2) / ((mixingCards.length) / 2);
    };
    
    /** @type {[string]|rgb[]} */
    let arrColorCard=DomDraw.randomColor(mixingCards)

    this.draw.map((divCard, i, a) => {
      divCard.classList.add("card");
      divCard.style.animationDuration = `${(getCard(i)+1) * timeCardAnim(time)}s`;
      divCard.style.animationDelay = `${(getCard(i)+1) * timeCardAnim(time)}s`;

      divCard.style.backgroundColor=arrColorCard[getCard(i)]
      setTimeout(()=>{
        
        divCard.style.backgroundColor=""
        

      },(time*1000))
      return divCard;
    });
    return this;
  }

  /**
   * функция возвращает промис который разрешиться после завершения анимации
   * @param {number} time 
   * @param {DomDraw} domDraw 
   * @returns {Promise<DomDraw>}
   */
  static awaitTimeAnim(time,domDraw) {

    let anim=domDraw.startAnim(time)
    
   return new Promise(resolve=>{
    setTimeout(()=>{
      resolve(anim) 
    },time*1000)
   })
  }


  /**
   * @param {[Card]} mixingCards
   * @returns {[string]|rgb[]}
   */
  static randomColor(mixingCards){

    let getRandomRgb=()=>{
     let random= Math.random()*256
     return Math.floor(random)
    }

    let arrRgb=[]
    for(let i=0;i<mixingCards.length/2;i++){
      let rgb=`rgba(${getRandomRgb()},${getRandomRgb()},${getRandomRgb()},1)`
      arrRgb.push(rgb)
    }
    mixingCards.map(card=>card.color=arrRgb[card.type])
  return arrRgb;
  }
}

/**
 * назначает событие клика
 * @param {Synk} synk
 * @return
 */
DomDraw.prototype.eventClick = function(health) {
 return new Promise(resolve => {


    let mixingCards = this.synk.mixingCards;
    /**@type {{card:Card,numberCard:number}} */
    let lastCard;
    let active = true;
    this.draw.forEach((divCard, numberCard, divCardArray) => {
      /**
 * функция для клика
 * @param {Event} event 
 */
      function eventClickCouple(event) {
     
        if(health<=0) resolve(false)
        if (!active) return;
        let lastDivCard = false;
        let card = mixingCards[numberCard];
        if (lastCard) {
          lastDivCard = divCardArray[lastCard.numberCard];
        }
        card.state = "true";

        let boolean =
          lastCard &&
          lastCard.numberCard !== numberCard &&
          lastCard.card.type == card.type;

        if (boolean) {
          lastCard.card.state = "true";
          card.state = "true";
          divCard.removeEventListener("click", eventClickCouple);
          lastDivCard.removeEventListener("click", eventClickCouple);
        } else if (lastCard) {
          if(lastCard.card!==card) {health--}
          lastCard.card.state = "false";
          card.state = "false";
        }

        mixingCards.forEach((cardDraw, numberCard, arrCard) => {
          if (cardDraw.state == "true") {
            divCardArray[numberCard].style.backgroundColor = cardDraw.color;
          } else {
              !boolean && lastCard && divCardArray[numberCard] === divCard
            if (!boolean && lastCard && divCardArray[numberCard] === divCard) {
              divCardArray[numberCard].style.backgroundColor = cardDraw.color;
              setTimeout(() => {
                active = true;
                divCardArray[numberCard].style.backgroundColor = "";
              }, 500);
            } else {
              if (lastCard && lastCard.card !== card) {
                setTimeout(() => {
                  active = true;
                  divCardArray[numberCard].style.backgroundColor = "";
                }, 500);
              } else {
                divCardArray[numberCard].style.backgroundColor = "";
              }
            }
          }
        });


        let healthElelment=document.getElementById("health")
        healthElelment.replaceChildren("hp:"+health)
        

        if(mixingCards.every(card=>card.state=="true")) {
          resolve(true)
        }

        if (!lastCard) {
          lastCard = { card: card, numberCard: numberCard };
          return;
        }
        active = false;

        lastCard = false;
      }

      divCard.addEventListener("click", eventClickCouple);
    });
  });
};

DomDraw.prototype.clearDivBlock=function(){
 return new Promise(resolve=>{
  this.draw.map(divElement=>{
    divElement.style.opacity="0%"
  })
  setTimeout(()=>{
    this.draw.map(divBlock=>divBlock.remove())
    resolve()
  
  },500)
 

 })
}

async function start() {
  let gameStartButton = document.getElementById("gameStart");
  gameStartButton.style.scale = "0%";
    gameStartButton.style.opacity = "0%";
  // let {time,colCard,health}=object
  // time=colCard
  document.getElementById("box_game").replaceChildren("");
  /**Время для анимации */
  let time = 4;
  /**количество карт */
  let colCard = 2;
  /**количество карт */
  let health = 2;
  document.getElementById("health").append(health)
  let game = true;
  for (let i = 0; i < 3 && game; i++) {
    let synk = new Synk(colCard + i);
    let domDrawAnim = new DomDraw(synk);
    let domDraw = await DomDraw.awaitTimeAnim(time, domDrawAnim);

    game = await domDraw.eventClick(health);
    await domDraw.clearDivBlock();
  }
  console.log(game);
  if (!game) {
    let gameOver = document.getElementById("gameDear");
    await stop(gameOver, 1.5);

    gameStartButton.style.scale = "100%";
    gameStartButton.style.opacity = "100%";
  } else {
    let gameWean = document.getElementById("gameWean");
    await stop(gameWean, 5);
    gameStartButton.style.scale = "100%";
    gameStartButton.style.opacity = "100%";
  }
  /**
 * @param {HTMLElement} element 
 */
  function stop(element, time) {
    return new Promise(resolve => {
      element.style.opacity = "100%";
      element.style.scale = "100%";
      setTimeout(() => {
        element.style.opacity = "";
        element.style.scale = "";
        resolve();
      }, time * 1000);
    });
  }
}


document.getElementById("gameStart").addEventListener("click",()=>{
  
  start()})

class Modaler{
    constructor (){
        const _ = this;
        _.body = document.querySelector('body');
        _.zindex = 0;
        _.conts = [];
    }

    // Главный метод который обрабатывает входящие данные и запускает нужные методы
    isInner(elem){
        return elem.tagName === 'MODALINNER';
    }
    showModal(modalData){
        const _ = this;
        let type = modalData.type ? modalData.type : 'html';
        if(!_.isInner(_.body.querySelector(`${modalData.content}`).parentNode)){
            _.createModalCont(modalData);
            let innerCont = _.createModalInner(modalData);
            _.modalCont.append(innerCont);
            _.body.append(_.modalCont);
            if(type === 'html'){
                innerCont.append(document.querySelector(`${modalData.content}`));
            }
            if(modalData.closeBtn !== 'false') {
                if(!modalData.closeBtn) _.createCloseBtn();
            }
        } else {
            console.log('Модальное окно уже открыто')
        }
    }

    // Создает контейнер модалки
    createModalCont(data){
        const _ = this;
        if(!_.modalCont){
            _.modalCont = _.createHtmlEl('MODALCONT',{},[
                _.createHtmlEl('STYLE',{
                    textContent : `modalcont{position:fixed;top:0;left:0;right:0;z-index:10000;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;}`
                })
            ]);
        }
    }

    // Создает обертку для модалки
    createModalInner(data= {}){
        const _ = this;

        let
            topStr = data.top ? `top: ${data.top};` : '' ,
            rightStr = data.right ? `right: ${data.right};` : '' ,
            leftStr = data.left ? `left: ${data.left};` : '' ,
            bottomStr = data.bottom ? `bottom: ${data.bottom};` : '' ,
            modalInner = _.createHtmlEl('MODALINNER',{},[
                _.createHtmlEl('STYLE',{
                    textContent: `modalcont{background-color:${data.contBgc ? data.contBgc : 'rgba(0,0,0,.5)'};}`})
            ]);

        if((data.type === 'html') || (!data.type)){
            let modalInnerCont = document.querySelector(`${data.content}`).parentElement;
            _.conts.push(modalInnerCont);
            modalInner.setAttribute(`data-conts-number`,`${_.conts.length - 1}`);
        }

        modalInner.setAttribute(`class`,`modalinner-${_.body.querySelectorAll('modalInner').length}`);
        modalInner.querySelector('style').textContent += `
            .${modalInner.className}{
                position:${data.position ? data.position : 'absolute'};
                z-index:${_.zindex += 1};
                background-color:${data.bgc ? data.bgc : '#fff'};
                padding:${data.padding ? data.padding : 0};
                ${topStr}${rightStr}${leftStr}${bottomStr};
                box-shadow: 0 0 15px rgba(0,0,0,.6)
            }
        `;

        return modalInner;
    }

    // Создает кнопку закрытия модального окна
    createCloseBtn(){
        const _ = this;
        let closeBtn =  _.createHtmlEl('BUTTON',{class:'close-modal'},[
            _.createHtmlEl('SPAN'),_.createHtmlEl('SPAN')
        ]);
        return closeBtn;
    }

    // Удаляет со страницы контейнер модалки
    removeModalCont(){
        const _ = this;
        if(_.modalCont.childElementCount <= 1) {
            _.modalCont.remove();
            _.zindex = 0;
            _.conts = [];
        }
    }

    // Закрывает модальное окно и удаляет контейнер, если все модалки закрыты
    closeModal(e){
        const _ = this;
        let modalInner = e.target.closest('modalinner');
        let modalObject = modalInner.children[1];
        let modalObjectCont = _.conts[modalInner.getAttribute('data-conts-number')];
        modalObjectCont.append(modalObject);
        modalInner.remove();
        _.removeModalCont();
    }

    // Создает HTML элементы
    createHtmlEl(tag,data = {},childs = []){
        const _ = this;
        let temp = document.createElement(`${tag}`);
        for(let key in data){
            if(key == 'class') temp.className = data[key];
            else if(key == 'textContent') temp.textContent = data[key];
            else if(key == 'innerHTML') temp.innerHTML = data[key];
            else temp.setAttribute(`${key}`,`${data[key]}`);
        }
        if(childs) childs.forEach(function (el) {
            temp.append(el)
        });
        return temp;
    }

}

let modaler = new Modaler();

document.querySelectorAll('.show-form-first').forEach(function (el) {
    el.addEventListener('click',function (e) {
        e.preventDefault();
        modaler.showModal({
            content: '.form-first',
            contBgc: 'rgba(0,0,0,1)'
        });
    });
});
document.querySelector('.show-form-second').addEventListener('click',function (e) {
    e.preventDefault();
    modaler.showModal({
        content: '.form-second',
        padding: '50px',
        bottom: '50px',
    });
});


document.querySelectorAll('.form-cancel').forEach(function (el) {
    el.addEventListener('click',function (e) {
        e.preventDefault();
        modaler.closeModal(e);
    })
});
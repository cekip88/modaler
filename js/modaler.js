class Modaler{
    constructor (){
        const _ = this;
        _.body = document.querySelector('body');
        _.zindex = 0;
        _.conts = [];
    }

    // Главный метод который обрабатывает входящие данные и запускает нужные методы
    showModal(modalData){
        const _ = this;
        _.createModalCont();
        let innerCont = _.createModalInner(modalData);
        _.modalCont.append(innerCont);
        _.body.append(_.modalCont);
        if(modalData.type === 'html'){
            innerCont.append(document.querySelector(`${modalData.content}`));
        }
        if(modalData.closeBtn !== 'false') {
            if(!modalData.closeBtn) _.createCloseBtn();
        }
    }

    // Создает контейнер модалки
    createModalCont(){
        const _ = this;
        if(!_.modalCont){
            _.modalCont = _.createHtmlEl('MODALCONT',{},[
                _.createHtmlEl('STYLE',{
                    textContent : `modalcont{position:fixed;top:0;left:0;right:0;z-index:10000;width:100vw;height:100vh;background-color:rgba(0,0,0,.5);}`
                })
            ]);
        }
    }

    // Создает обертку для модалки
    createModalInner(data){
        const _ = this;
        _.zindex += 1;
        let padding = 0,
            zindex = _.zindex,
            modalInnerCont = document.querySelector(`${data.content}`).parentElement;
        _.conts.push(modalInnerCont);
        if(data.padding) padding = data.padding;
        let modalInner = _.createHtmlEl('MODALINNER',{'data-conts-number':`${_.conts.length - 1}`},[
            _.createHtmlEl('STYLE',{
                textContent: `
                    modalinner{
                        display:block;
                        position:absolute;
                        z-index:${zindex};
                        background-color:#fff;
                        padding:${padding};
                    }
                `})
        ]);

        return modalInner
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
            type: 'html',
            padding: 0,
        });
    });
});
document.querySelector('.show-form-second').addEventListener('click',function (e) {
    e.preventDefault();
    modaler.showModal({
        content: '.form-second',
        type: 'html',
        padding: '50px',
    });
});


document.querySelectorAll('.form-cancel').forEach(function (el) {
    el.addEventListener('click',function (e) {
        e.preventDefault();
        modaler.closeModal(e);
    })
});
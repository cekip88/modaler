import {Lib} from './Lib.js';
import {MainEventBus} from './MainEventBus.lib.js';

class Modaler extends Lib{
    constructor (){
        super();
        const _ = this;
        _.body = document.querySelector('body');
        _.zindex = 0;
        _.conts = [];
        _.openedModals = new Map();
        _.openedModals.set('int',0);
        _.allModals = [];
        _.modalCont = '';

        MainEventBus.add('Modaler','showModal', _.showModal.bind(_));
        MainEventBus.add('Modaler','closeModal', _.closeModal.bind(_));
        MainEventBus.add('Modaler','log',_.showLog.bind(_));

    }
    showLog(){
        //this.log(this)
    }

    // Проверяет есть ли данная модалка в объекте открытых модалок, если нет, то добавляет
    modalOpenedCheck(modalData){
        const _ = this;

        let check = false,
            name,
            modal = modalData.content;

        for(let value of _.openedModals.values()){
            if(modal === value) {
                check = true;
                console.warn('Модальное окно уже открыто');
            }
        }

        if(!check){
            name = 'modal-' + _.openedModals.get('int');
            _.openedModals.set(name, modal);
            _.openedModals.set('int',_.openedModals.get('int') + 1);
        }

        let answer = [check];
        if(name) answer.push(name);

        return answer;
    }

    // Проверяет контент и тип на соответствие
    innerDataCheck(data){
        const _ = this;
        let answer = false;
        let type = data.type,
            content = data.content;

        if(!content) {
            _.log('Предупреждение: content не передан','error');
        } else {
            if(type && ((type !== 'html') && (type !== 'string') && (type !== 'object'))) {
                _.log('Предупреждение: Type указан не верно','error');
            } else if ((type === 'object' && (type !== typeof content)) || (type === 'string' && (type !== typeof content)) || (type === 'html' && !document.querySelector(`${content}`))){
                _.log('Предупреждение: Type не соответствует Content')
            } else if(!type){
                let findedType = typeof content;
                if(findedType === 'string'){
                    content.trim();
                    if(content[0] === '.' || content[0] === '#'){
                        findedType = 'html';
                    }
                }
                data.type = findedType;
                answer = true;
            } else {
                answer = true;
            }

        }
        return {check : answer, modalData : data};
    }

    // Проверяет была ли данная модалка уже открыта, если да то открывает ее повторно


    // Главный метод который обрабатывает входящие данные и запускает нужные методы
    showModal(clickData){
        const _ = this;

        let modalData = JSON.parse(clickData['data']),
            checkData = _.innerDataCheck(modalData),
            modalInner;
        modalData = checkData['modalData'];

        if(checkData['check']){
            let checkOpened = _.modalOpenedCheck(modalData),
                name = checkOpened[1];

            if(!checkOpened[0]){

                if(!modalData.cascad){
                    _.closeAllModals();
                }

                _.createModalCont();
                _.body.append(_.modalCont);

                let savedModal = false;
                _.allModals.forEach(function (el) {
                    let data = el['data'];
                    if(data['content'] === modalData.content){
                        savedModal = el;
                    }
                });

                if(!savedModal){
                    modalInner = _.createModalInner(modalData,name);
                    if(modalData.closeBtn !== false){
                        let closeBtn = _.createCloseBtn(modalData);
                        if(closeBtn) modalInner.append(closeBtn);
                    }

                    _.allModals.push({'inner':modalInner,'data':modalData});
                } else {
                    modalInner = savedModal['inner']
                }
                _.modalCont.append(modalInner);
                _.modalInnerFilling({'inner':modalInner,'data':modalData});
            }
        }
        console.log(_.openedModals)
    }

    // Создает контейнер модалок
    createModalCont(){
        const _ = this;
        if(!_.modalCont){
            _.modalCont = _.createEl('MODALCONT',null,{},[
                _.createEl('STYLE',null,{
                    'text' : `modalcont{position:fixed;top:0;left:0;right:0;z-index:10000;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;}`
                })
            ]);
        }
    }

    // Создает обертку для модалки
    createModalInner(data= {},name){
        const _ = this;

        let modalInner = _.createEl('MODALINNER',name,{'inner-name':name});

        let styleText = `
            modalcont{
                background-color:${data.contBgc ? data.contBgc : 'rgba(0,0,0,.5)'};
            }
            .${modalInner.className} img{
                display:block;
            }
            
            .${modalInner.className}{
                position:${data.position ? data.position : 'absolute'};
                z-index:${_.zindex += 1};
                background-color:${data['background-color'] ? data['background-color'] : '#fff'};
                box-shadow: ${data['box-shadow'] ? data['box-shadow'] : '0 0 15px rgba(0,0,0,.6)'};
        `;
        for(let key in data){
            if(key !== 'content' && key !== 'type' && key !== 'position' && key !== 'background-color' && key !== 'box-shadow' && key !== 'id' && key !== 'closeBtn'){
                styleText += `${key}: ${data[key]};`;
            }
        }
        styleText+='}';

        if(!data.closeBtn || data.closeBtn == true){
            styleText += `
                .closeModal{transition:.35s ease;border:none;border-radius:100%;background-color:#fff;width:30px;height:30px;padding:1px 5px 3px;position:absolute;top:-15px;right:-15px;box-shadow: 0 0 3px rgba(0,0,0,.5)}
                .closeModal:before,.closeModal:after{width:20px;height:2px;background-color:#000;display:block;content:'';}
                .closeModal:before{transform: rotate(45deg) translate(1.5px,1.5px);}
                .closeModal:after{transform:rotate(-45deg)}
                .closeModal:hover{transform:rotate(180deg)}
            `
        }

        if(data.id) modalInner.setAttribute('id', data.id);

        modalInner.append(_.createEl('STYLE','modalStyle',{
            text: styleText
        }));

        return modalInner;
    }

    modalInnerFilling(data){
        const _ = this;

        let modalInner = data['inner'],
            modalData = data['data'];

        if (modalData.type === 'object') {
            modalInner.append(modalData.content);}

        else if (modalData.type === 'html') {
            let innerParent = document.querySelector(`${modalData.content}`).parentElement;
            if(modalData.append === false){
                let clone = _.body.querySelector(`${modalData.content}`).cloneNode(true);
                for(let value of _.openedModals.values()){
                    if(value === _.body.querySelector(`${modalData.content}`)){
                        value = clone;
                    }
                }
                modalInner.append(clone);
            } else {
                _.conts.push(innerParent);
                modalInner.setAttribute(`data-conts-number`,`${_.conts.length - 1}`);
                modalInner.append(_.body.querySelector(`${modalData.content}`));
            }
        }

        else {
            modalInner.innerHTML += modalData.content;
        }
    }

    // Создает кнопку закрытия модального окна
    createCloseBtn(data){
        const _ = this;

        if(data.closeBtn == false)  return false;

        let closeButton;
        if(!data.closeBtn || data.closeBtn == true){
            closeButton =  _.createEl('BUTTON','closeModal',{'data-click-action':`Modaler:closeModal`});
        } else {
            console.warn('Предупреждение: неверные данные переданы для кнопки закрытия');
        }

        return closeButton;
    }

    // Удаляет со страницы контейнер модалки
    removeModalCont(){
        const _ = this;
        if(_.modalCont.childElementCount <= 1) {
            _.modalCont.remove();
            _.zindex = 0;
            _.conts = [];
            _.openedModals.set('int',0)
        }
    }

    // Закрывает все модалки
    closeAllModals(){
        const _ = this;
        let modals = document.querySelectorAll('modalInner');
        modals.forEach(function (el) {
            _.closeModal({'selector':`.${el.className}`})
        })
    }

    // Закрывает модальное окно и удаляет контейнер, если все модалки закрыты
    // clickData может быть как событием клика так и selector-ом
    closeModal(clickData){
        const _ = this;

        let modalObject,
            modalInner;

        if(clickData['item']){
            let elem = clickData['item'];
            modalInner = elem.closest('modalinner');
        }
        if(clickData['selector']){
            modalInner = document.querySelector(`${clickData['selector']}`)
        }

        for(let i = 0; i < modalInner.children.length; i++){
            let el = modalInner.children[i];
            if((el.className !== 'closeModal') && (el.className !== 'styleModal')){
                modalObject = el;
            }
        }

        let modalsName = modalInner.getAttribute('inner-name');
        console.log(modalsName);
        _.openedModals.delete(modalsName);

        if(modalInner.getAttribute('data-conts-number')){
            let modalObjectCont = _.conts[modalInner.getAttribute('data-conts-number')];
            modalObjectCont.append(modalObject);
        } else modalObject.remove();

        modalInner.remove();
        _.removeModalCont();
        console.log(_.openedModals)
    }

}

let modaler = new Modaler();

function closeSecond(){
    modaler.closeModal({'selector':'#first'})
}

document.querySelector('.asd').onclick = closeSecond;

document.querySelector('body').addEventListener('click',function(e){
    e.preventDefault();
    let target = e.target;
    if(target.hasAttribute('data-click-action')){
        let rAction = target.getAttribute('data-click-action'),
            rawAction = rAction.split(':'),
            component = rawAction[0],
            action = rawAction[1],
            data = target.getAttribute('data-object');
        MainEventBus.trigger(`${component}`,`log`);
        MainEventBus.trigger(`${component}`,`${action}`,{'item':target,'event':e, 'data': data ? data : ''})
    }
});


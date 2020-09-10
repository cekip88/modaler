import {Lib} from './Lib.js';
import {MainEventBus} from './MainEventBus.lib.js';

class Modaler extends Lib{
    constructor (){
        super();
        const _ = this;
        _.body = document.querySelector('body');
        _.zindex = 0;
        _.conts = [];
        _.modals = new Map();
        _.modals.set('int',0);
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

        for(let value of _.modals.values()){
            if(modal === value) {
                check = true;
                console.warn('Модальное окно уже открыто');
            }
        }

        if(!check){
            name = 'modal-' + _.modals.get('int');
            _.modals.set(name, modal);
            _.modals.set('int',_.modals.get('int') + 1);
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

    // Главный метод который обрабатывает входящие данные и запускает нужные методы
    showModal(clickData){
        const _ = this;

        let modalData = JSON.parse(clickData['data']);
        let check = _.innerDataCheck(modalData);
        modalData = check['modalData'];

        if(check['check']){
            let checkResult = _.modalOpenedCheck(modalData),
                name = checkResult[1];

            if(!checkResult[0]){

                if(!modalData.cascad){
                    _.closeAllModals();
                }

                _.createModalCont();
                _.body.append(_.modalCont);

                let modalInner = _.createModalInner(modalData,name);

                if(modalData.closeBtn !== false){
                    let closeBtn = _.createCloseBtn(modalData);
                    if(closeBtn) modalInner.append(closeBtn);
                }

                _.modalCont.append(modalInner);
                _.modalInnerFilling(modalInner,modalData);
            }
        }
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

        if(data.id) modalInner.setAttribute('data-id', data.id);

        let styleText = `
            modalcont{
                background-color:${data.contBgc ? data.contBgc : 'rgba(0,0,0,.5)'};
            }
            .${modalInner.className}{
                position:${data.position ? data.position : 'absolute'};
                z-index:${_.zindex += 1};
                background-color:${data['background-color'] ? data['background-color'] : '#fff'};
                box-shadow: ${data['box-shadow'] ? data['box-shadow'] : '0 0 15px rgba(0,0,0,.6)'};
        `;

        for(let key in data){
            if(key !== 'content' && key !== 'type' && key !== 'position' && key !== 'background-color' && key !== 'box-shadow'){
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

        modalInner.append(_.createEl('STYLE','modalStyle',{
            text: styleText
        }));

        return modalInner;
    }

    modalInnerFilling(modalInner,data){
        const _ = this;
        if (data.type === 'object') {
            modalInner.append(modalInner.content);
        } else if (data.type === 'string') {
            modalInner.innerHTML += data.content;
        } else if (data.type === 'html') {
            let innerParent = document.querySelector(`${data.content}`).parentElement;
            if(data.append === 'false'){
                let clone = _.body.querySelector(`${data.content}`).cloneNode(true);
                for(let value of _.modals.values()){
                    if(value === _.body.querySelector(`${data.content}`)){
                        value = clone;
                    }
                }
                modalInner.append(clone);
            } else {
                _.conts.push(innerParent);
                modalInner.setAttribute(`data-conts-number`,`${_.conts.length - 1}`);
                modalInner.append(_.body.querySelector(`${data.content}`));
            }
        }
    }

    // Создает кнопку закрытия модального окна
    createCloseBtn(data){
        if(data.closeBtn == false)  return false;
        const _ = this;
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
            _.modals.set('int',0)
        }
    }

    // Закрывает все модалки
    closeAllModals(){
        const _ = this;
        let modals = document.querySelectorAll('modalInner');
        modals.forEach(function (el) {
            _.closeModal(null,null,el.className)
        })
    }

    // Закрывает модальное окно и удаляет контейнер, если все модалки закрыты
    // clickData может быть как событием клика так и строкой data-id также и selector-ом
    closeModal(clickData){
        const _ = this;

        let modalObject,
            modalInner;

        if(clickData['item']){
            let elem = clickData['item'];
            modalInner = elem.closest('modalinner');
        }
        if(clickData['data-id']){
            let modalInnerArr = _.body.querySelectorAll('modalInner');
            modalInnerArr.forEach(function (el) {
                if(el.getAttribute('data-id') === clickData['data-id']){
                    modalInner = el;
                }
            })
        }
        if(clickData['modIn']){
            modalInner = document.querySelector(`.${clickData['modIn']}`)
        }

        for(let i = 0; i < modalInner.children.length; i++){
            let el = modalInner.children[i];
            if((el.className !== 'closeModal') && (el.className !== 'styleModal')){
                modalObject = el;
            }
        }

        let modalsName = modalInner.getAttribute('inner-name');
        _.modals.delete(modalsName);

        if(modalInner.getAttribute('data-conts-number')){
            let modalObjectCont = _.conts[modalInner.getAttribute('data-conts-number')];
            modalObjectCont.append(modalObject);
        } else modalObject.remove();

        modalInner.remove();
        _.removeModalCont();
    }

}

let modaler = new Modaler();

function closeSecond(){
    modaler.closeModal({'data-id':'first'})
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


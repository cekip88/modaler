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
    modalCheck(modalData){
        const _ = this;

        let check = false,
            name,
            modal = modalData.content;

        for(let value of _.modals.values()){
            if(modal === value) {
                check = true;
                console.log('Модальное окно уже открыто');
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
            _.log('Ошибка: content не передан','error');
        } else {
            if(type && ((type !== 'html') && (type !== 'string') && (type !== 'object'))) {
                _.log('Ошибка: Type указан не верно','error');
            } else if ((type === 'object' && (type !== typeof content)) || (type === 'string' && (type !== typeof content)) || (type === 'html' && !document.querySelector(`${content}`))){
                _.log('Ошибка: Type не соответствует Content')
            } else if(!type){
                let findedType = typeof content;
                if(findedType === 'string'){
                    if(_.body.querySelector(`${content}`)) findedType = 'html'
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
            let checkResult = _.modalCheck(modalData),
                name = checkResult[1];

            if(!checkResult[0]){
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

    // Создает контейнер модалки
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

        let
            topStr = data.top ? `top: ${data.top};` : '' ,
            rightStr = data.right ? `right: ${data.right};` : '' ,
            leftStr = data.left ? `left: ${data.left};` : '' ,
            bottomStr = data.bottom ? `bottom: ${data.bottom};` : '';

        let modalInner = _.createEl('MODALINNER',name,{'inner-name':name});

        modalInner.append(_.createEl('STYLE','modalStyle',{
            text:`modalcont{background-color:${data.contBgc ? data.contBgc : 'rgba(0,0,0,.5)'};}
                .${modalInner.className}{
                    position:${data.position ? data.position : 'absolute'};
                    z-index:${_.zindex += 1};
                    background-color:${data.bgc ? data.bgc : '#fff'};
                    padding:${data.padding ? data.padding : 0};
                    ${topStr}${rightStr}${leftStr}${bottomStr};
                    box-shadow: ${data.shadow ? data.shadow : '0 0 15px rgba(0,0,0,.6)'}
                }`
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
        const _ = this;
        let closeBtn;

        if(!data.closeBtn){
            closeBtn =  _.createEl('BUTTON','closeModal',{'data-click-action':`Modaler:closeModal`},[
                _.createEl('SPAN'),_.createEl('SPAN')
            ]);
        } else {
            console.log('Ошибка: неверные данные переданы для кнопки закрытия');
        }
        return closeBtn;
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

    // Закрывает модальное окно и удаляет контейнер, если все модалки закрыты
    closeModal(clickData){
        const _ = this;

        let elem = clickData['item'];
        let modalInner = elem.closest('modalinner');
        let modalObject;

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


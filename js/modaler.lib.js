import {Lib} from './Lib.js';
import {Ctrl} from './Ctrl.js';
import {MainEventBus} from './MainEventBus.lib.js';
import { TweenMax,TimelineMax } from './gsap/GreenSock.lib.js'

class _Modaler extends Lib{
    constructor (){
        super();
        const _ = this;
        _.body = document.querySelector('body');
        _.modalerAppendPlace = document.querySelector('body');
        _.zindex = 0;
        _.conts = [];
        _.openedModals = new Map();
        _.int = 0;
        _.allModals = [];
        _.modalCont = '';
        _.gsap = TweenMax;
        _.libName = "Modaler";
        _.coord = {};
        MainEventBus.add(_.libName,'showModal', _.showModal.bind(_));
        MainEventBus.add(_.libName,'closeModal', _.closeModal.bind(_));
        MainEventBus.add(_.libName,'closeAllModals', _.closeAllModals.bind(_));
        MainEventBus.add(_.libName,'closeLastModal', _.closeLastModal.bind(_));
        MainEventBus.add(_.libName,'drag', _.drag.bind(_));
        MainEventBus.add(_.libName,'dragStart', _.dragStart.bind(_));
        MainEventBus.add(_.libName,'dragEnd', _.drag.bind(_));

    }

    // Проверяет есть ли данная модалка в объекте открытых модалок, если нет, то добавляет
    modalOpenedCheck(content){
        const _ = this;

        let check = false;

        for(let value of _.openedModals.values()){
            if(content === value['content']) {
                check = true;
                console.warn('Модальное окно уже открыто');
            }
        }

        return check;
    }

    // Проверяет контент и тип на соответствие
    innerDataCheck(data){
        const _ = this;
        let answer = false;
        let type = data.contentType = data.type,
            content = data.content;

        if(!content) {
            console.warn('Предупреждение: content не передан','error');
        } else {
            if(type && ((type !== 'html') && (type !== 'string') && (type !== 'object'))) {
                console.warn('Предупреждение: Type указан не верно','error');
            } else if ((type === 'object' && (type !== typeof content)) || (type === 'string' && (type !== typeof content)) || (type === 'html' && !document.querySelector(`${content}`))){
                console.warn('Предупреждение: Type не соответствует Content')
            } else if(!type){
                let findedType = typeof content;
                if(findedType === 'string'){
                    content.trim();
                    if(content[0] === '.' || content[0] === '#'){
                        findedType = 'html';
                    }
                }
                data.contentType = data.type = findedType;
                answer = true;
            } else {
                answer = true;
            }

        }
        return {check : answer, modalData : data};
    }

    // Главный метод который обрабатывает входящие данные и запускает нужные методы
    showModal(rawData){
        const _ = this;

        let btn = rawData['item'];
        rawData['data'] = btn.dataset.object;
        let modalData;

        if(typeof rawData['data'] === 'string'){
            modalData = JSON.parse(rawData['data'])
        } else {
            modalData = rawData;
        }

        let checkData = _.innerDataCheck(modalData);
        modalData = checkData['modalData'];

        if(checkData['check']){
            let checkOpened = _.modalOpenedCheck(modalData.content);

            if(!checkOpened){

                if(!modalData['cascad']) _.closeAllModals();

                _.createModalCont();
                _.modalerAppendPlace.append(_.modalCont);

                let
                    savedModal = _.modalExistCheck(modalData),
                    modalInner,
                    name = 'modal-' + _.int;

                if(!savedModal){
                    modalInner = _.createModalInner(modalData,name);
                    _.createCloseBtn(modalData,modalInner);
                    _.allModals.push({'inner':modalInner,'data':modalData});
                } else {
                    modalInner = savedModal['inner'];
                    modalInner.setAttribute('inner-name',`${name}`)
                }

                _.openedModals.set(name, {'inner':modalInner,'content':modalData.content});
                _.int += 1;

                _.modalInnerFilling({'inner':modalInner,'data':modalData});
                _.modalCont.append(modalInner);
                _.animationStart(modalInner,{from:{scale:0.7,opacity:0},to:{scale:1,opacity:1,duration:0.5,ease:'back.out(4)'}})
            }
        }
    }

    // Проверяет создан ли modalInner
    modalExistCheck(modalData){
        const _ = this;

        let savedModal = false;
        _.allModals.forEach(function (el) {
            let data = el['data'];
            if(data['content'] === modalData.content){
                savedModal = el;
            }
        });

        return savedModal;
    }

    // Создает контейнер модалок
    createModalCont(){
        const _ = this;
        if(!_.modalCont){
            _.modalCont = _.createEl('MODALCONT',null,{'data-click-action' : `${_.libName}:closeLastModal`},[
                _.createEl('STYLE',null,{
                    'text' : `modalcont{position:fixed;top:0;left:0;right:0;z-index:10000;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;}
                                button{cursor:pointer}`
                })
            ]);
        }
    }

    // Создает обертку для модалки
    createModalInner(data= {},name){
        const _ = this;

        let modalInner = _.createEl('MODALINNER',name,{'inner-name':name,'data-click-action':''});
        if(data['draggable'] === true){
            modalInner.setAttribute('data-drag-start-action',`${_.libName}:dragStart`);
            modalInner.setAttribute('data-drag-action',`${_.libName}:drag`);
            modalInner.setAttribute('data-drag-end-action',`${_.libName}:dragEnd`);
            modalInner.setAttribute('draggable','true');
        }

        let styleText = `
            modalcont{
                background-color:${data['contBgc'] ? data['contBgc'] : 'rgba(0,0,0,.5)'};
            }
            .${modalInner.className}>img{
                display:block;
            }
            
            .${modalInner.className}{
                position:${data.position ? data.position : 'absolute'};
                z-index:${_.zindex += 1};
                background-color:${data['background-color'] ? data['background-color'] : '#fff'};
                box-shadow: ${data['box-shadow'] ? data['box-shadow'] : '0 0 15px rgba(0,0,0,.6)'};
        `;

        for(let key in data){
            if(key !== 'content' && key !== 'type' && key !== 'contentType' && key !== 'position' && key !== 'background-color' && key !== 'box-shadow' && key !== 'id' && key !== 'closeBtn' && key !== 'cascad' && key !== 'append'){
                styleText += `${key}: ${data[key]};`;
            }
        }
        styleText+='}';

        if(!data.closeBtn || data.closeBtn == true){
            styleText += `
                .closeModal{transition:.35s ease;border:none;z-index:10;border-radius:100%;background-color:#fff;width:30px;height:30px;padding:1px 5px 3px;position:absolute;top:-15px;right:-15px;box-shadow: 0 0 3px rgba(0,0,0,.5);outline:0;}
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

    // Наполняет модалку контентом
    modalInnerFilling(data){
        const _ = this;

        let modalInner = data['inner'],
            modalData = data['data'];

        if (modalData.contentType === 'object') {
            modalInner.append(modalData.content);}

        else if (modalData.contentType === 'html') {
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

    // Задает анимацию открытия модалки
    animationStart(selector,params){
        this.gsap.fromTo(selector,params.from,params.to);
    }

    // Задает анимацию закрытия модалки
    animationEnd(selector,params={}){
        this.gsap.to(selector,params);
    }

    // Создает кнопку закрытия модального окна
    createCloseBtn(data,modalInner){
        const _ = this;

        if(data['closeBtn'] === false)  return false;

        let closeButton;

        if(!data['closeBtn'] || data['closeBtn'] === true){
            closeButton = _.createEl('BUTTON','closeModal',{'data-click-action':`${_.libName}:closeModal`});
            modalInner.append(closeButton);
        }

        else if (data['closeBtn']){
            if(typeof data['closeBtn'] === 'string'){
                if(data['closeBtn'][0] === '.'){
                    closeButton = _.body.querySelector(`${data['closeBtn']}`).cloneNode(true);
                    closeButton.setAttribute('data-click-action',`${_.libName}:closeModal`);
                    modalInner.append(closeButton);
                } else{
                    closeButton = data['closeBtn'];
                    modalInner.innerHTML += closeButton;
                    modalInner.children[1].setAttribute('data-click-action',`${_.libName}:closeModal`)
                }
            } else if(typeof data['closeBtn'] === 'object'){
                closeButton = data['closeBtn'];
                closeButton.setAttribute('data-click-action',`${_.libName}:closeModal`);
                modalInner.append(closeButton);
            }
        }

        else {
            console.warn('Предупреждение: неверные данные переданы для кнопки закрытия');
        }
    }

    // Удаляет со страницы контейнер модалки
    removeModalCont(){
        const _ = this;
        if(_.modalCont.childElementCount <= 1) {
            _.modalCont.remove();
            _.zindex = 0;
            _.conts = [];
            _.int = 0;
        }
    }

    // Закрывает все модалки
    closeAllModals(){
        const _ = this;
        if(_.openedModals.size > 0){
            for(let value of _.openedModals.values()){
                _.closeModal({'item':value['inner']})
            }
        }
    }

    // Закрывает последнее открытое окно
    closeLastModal(){
        const _ = this;

        if(_.openedModals.size > 0){

            let lastOpenedNumber = 0;
            for(let key of _.openedModals.keys()){
                let
                    clsParts = key.split('-'),
                    openedModalNumber = clsParts[clsParts.length - 1];

                if(openedModalNumber > lastOpenedNumber){
                    lastOpenedNumber = openedModalNumber;
                }
            }

            let lastModal = _.openedModals.get(`modal-${lastOpenedNumber}`);
            _.closeModal({'item':lastModal['inner']})
        }
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
        if(clickData['id']){
            _.allModals.forEach(function (el) {
                if(el['inner'].getAttribute('id') === clickData['id']) modalInner = el['inner'];
            })
        }

        for(let i = 0; i < modalInner.children.length; i++){
            let el = modalInner.children[i];
            if((el.className !== 'closeModal') && (el.className !== 'styleModal')){
                modalObject = el;
            }
        }

        let modalsName = modalInner.getAttribute('inner-name');
        _.openedModals.delete(modalsName);

        _.animationEnd(modalInner,{opacity:0,scale:.8,duration: .5,ease:'back.in(4)',onComplete:function () {
            if(modalInner.getAttribute('data-conts-number')){
                let modalObjectCont = _.conts[modalInner.getAttribute('data-conts-number')];
                modalObjectCont.append(modalObject);
            } else modalObject.remove();
            modalInner.remove();
            _.removeModalCont();
        }});
    }

    dragStart(clickData){
        const _ = this;
        let e = clickData['event'];
        let item = clickData['item'];

        let data = e.dataTransfer;
        let img = document.createElement('IMG');
        data.setDragImage(img,0,0);

        let name = item.className;
        _.coord[name] = {'x':e.pageX,'y':e.pageY};
        let transform = item.style.transform;
        if(transform.indexOf('translate') >= 0){
            let str = transform.substring(transform.indexOf('(') + 1,transform.lastIndexOf(')'));
            str = str.split(',');
            _.coord[name]['trX'] = parseInt(str[0]);
            _.coord[name]['trY'] = parseInt(str[1]);
        }
    }
    drag(clickData){
        const _ = this;
        let e = clickData['event'],
            item = clickData['item'];

        let name = item.className;

        _.gsap.to(item,0,{x:_.coord[name]['trX'] + (e.pageX - _.coord[name]['x']),y:_.coord[name]['trY'] + (e.pageY - _.coord[name]['y'])})
    }
}

export const Modaler = new _Modaler();

let _Ctrl = new Ctrl(null,null,{
    container:document.body
});


/*document.querySelector('body').addEventListener('click',function(e){
    //e.preventDefault();
    let target = e.target;
  /!*  while(!target.getAttribute('data-click-action')){
        target = target.parentElement;
    }*!/
    if(target.hasAttribute('data-click-action')){
        let rAction = target.getAttribute('data-click-action'),
            rawAction = rAction.split(':'),
            component = rawAction[0],
            action = rawAction[1],
            data = target.getAttribute('data-object');
        //MainEventBus.trigger(`${component}`,`log`);
        MainEventBus.trigger(`${component}`,`${action}`,{'item':target,'event':e, 'data': data ? data : ''})
    }
});*/


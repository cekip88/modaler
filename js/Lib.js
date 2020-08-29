export class Lib{
    constructor(){
        const _ = this;
    }

    /*-------------- Методы очистки ---------------------*/
    clearCont(cont){
        if(!cont) return;
        while (cont.firstElementChild) {
            cont.firstElementChild.remove();
        }
    }
    /*-------------- Методы очистки ---------------------*/


    /*-------------- Методы выборки ---------------------*/
    getDataAttr(elem,dataName){
        if(!elem) return;
        return (dataName in elem.dataset) ? elem.dataset['dataName'] : null;
    }
    /*-------------- Методы выборки ---------------------*/


    /*-------------- Методы создания ---------------------*/
    makeid(){
        var text = "";
        var possible = "abcdefghijklmnopqrstuvwxyz"+Math.random();

        for( var i=0; i < 5; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
    createTpl(tpl,tplName='') {
        const _ = this;
        if (tplName && _[tplName]){
           return  _[tplName];// = elem;
        }
        try{
            let elem = (function cr(tpl){
                if (!tpl['childes']) return tpl['el'];

                let parent = tpl['el'];
                for (let child of tpl['childes']) {
                    parent.append(cr(child));
                }
                return  parent;
            })(tpl);
            if (tplName){
                _[tplName] = elem;
            }
            return elem;
        } catch (e) {
            _.log( `Ошибка создания шаблона в модуле ${_.componentName}--------${e}`,'error');
        }
    }
    /*createEl(elemName,className,params){
        if(!elemName) return null;
        let element = document.createElement(elemName);
        if(className) element.className = className;
        if(params){
            for(let param in params){
                if(param === 'text'){
                    if(element.tagName === 'INPUT'){
                        element.value = params[param];
                    }else{
                        element.textContent = params[param];
                    }
                }else{
                    element.setAttribute(param,params[param]);
                }
            }
        }
        return element;
    }*/

    // Создает HTML элементы
    createEl(tag,className,data = {},childs = []){
        let temp = document.createElement(`${tag}`);
        if(className) temp.className = className;
        if(data){
            for(let key in data){
                if(key === 'text') {
                    if(tag === 'INPUT' || tag === 'TEXTAREA') temp.value = data[key];
                    else temp.textContent = data[key];
                } else if(key === 'innerHTML') temp.innerHTML = data[key];
                else temp.setAttribute(`${key}`,`${data[key]}`);
            }
        }
        if(childs) {
            if(typeof childs === 'object'){
                childs.forEach(function (el) {
                    temp.append(el)
                });
            }
        }
        return temp;
    }

    log(msg,type='',params){
        const _ = this;
        //console.count('Глубина вызовов');
        //console.log(params);
        switch (type) {
            case 'error':{
                console.log(`%c%s`,
                    `font-family:"Helvetica";text-transform:uppercase;background-color:#F79141;color:#222;font-weight:700;padding:5px;margin-bottom:2px;`,
                   msg);
            }break;
            default:{
                let
                    componentNameStyle = `margin-right:5px;color:#fff;padding:10px 10px 5px 35px;border-radius:2px;background:url("http://grammla.kz/gengine/${_.modulePage}.svg") #88a3ff20 10px center no-repeat;background-size:20px;${params}`,
                    nameStyle =  `color:tomato;font-weight:700;padding:3px;margin-bottom:2px;${params}`,
                    propStyle =  `color:#88a3ffe8;font-weight:700;padding:3px;margin-bottom:2px;${params}`,
                    valueStyle =  `color:#a6e22e;font-weight:700;padding:3px;margin-bottom:2px;${params}`;
                if (( msg instanceof  Element)  || ( msg instanceof  Window) || ( msg instanceof  Location) || ( msg instanceof  Document)  || ( msg instanceof  DocumentFragment) ){
                    console.log(msg);
                    return;
                }
                if (typeof msg  == 'object'){
                    for (let prop in msg){
                        let propTypeName = 'Свойство:';

                        if((typeof msg[prop] == 'function')  ){
                            propTypeName = 'Функция:';
                            console.log(`%c:%c${propTypeName}%c${prop}%c||%c${msg[prop]}`,componentNameStyle,nameStyle, propStyle,'',valueStyle);
                        }else if(typeof msg[prop] == 'object'){
                            let propTypeName = 'Объект:';
                            if(msg[prop] instanceof  Array){
                                propTypeName = 'Массив:';
                            }
                            console.log(`%c:%c${propTypeName}%c${prop}%c||%c${msg[prop]}`,componentNameStyle,nameStyle, propStyle,'',valueStyle);
                            let outParams = '';
                            if(params) outParams = params;
                            outParams+= 'margin-left:10px;';
                            console.groupCollapsed(prop);
                            _.log(msg[prop],type='',outParams);
                            console.groupEnd(prop);
                        }else{
                            console.log(`%c:%c${propTypeName}%c${prop}%c||%c${msg[prop]}`,componentNameStyle,nameStyle, propStyle,'',valueStyle);
                        }
                    }

                }else{
                    console.log(`%c%s`,
                        `text-transform:uppercase;color:#a6e22e;font-weight:700;padding:10px;margin-bottom:2px;${params}`,
                        msg)
                }



            }
        }
    }

    /*-------------- Методы создания ---------------------*/


    /*-------------- Методы обновления ---------------------*/
    setDataAttr(elem,dataName,dataValue=""){
        if(!elem) return;
        elem.setAttribute(dataName,dataValue);
    }
    updateEl(elem,className,params){
        if(!elem) return null;
        if(className) {
            if (elem.className != className) elem.className = className;
        }
        if(params){
            for(let param in params){
                if(param === 'text'){
                    if(elem.tagName === 'INPUT'){
                        elem.value = params[param];
                    }else{
                        elem.textContent = params[param];
                    }
                }else{
                    elem.removeAttribute(param);
                    elem.removeAttribute('data-lang');
                    elem.setAttribute(param,params[param]);
                }
            }
        }

        //console.log(elem,className,params)
        return elem;
    }
    /*-------------- Методы обновления ---------------------*/


    /*-------------- Методы заполнения контента ---------------------*/

    /*-------------- Методы заполнения контента ---------------------*/


    /*-------------- Шаблоны ---------------------*/



    /*-------------- Шаблоны ---------------------*/


}
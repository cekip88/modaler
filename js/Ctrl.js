import {MainEventBus} from "./MainEventBus.lib.js";
let triggerWithEvent = function(data,currentAction){
    if (!data['item'])  return;
        let
        rawActions = data['item'].dataset[currentAction].split(';');
    for (let rAction of rawActions){
        let rawAction = rAction.split(':'),
            component = rawAction[0],
            action = rawAction[1];
        MainEventBus.trigger(component,action,data);
    }
};
export class Ctrl{
    constructor(model,view,params={}){
        const _ = this;
        _.container = params.container ?  params.container : '';
        _.fill(model, 'model');
        _.fill(view, 'view');
        _.actions = [];
        _.handle();
    }
    clearLoop(){
        const _ = this;
        clearInterval(_[`${_.componentName}notifies`]);
    }
    fill(elem,elemVal){
        const _ = this;
        if (typeof elem ==  'object'){
            if((elem instanceof Array) || (elem instanceof Map)){
                _[elemVal] = new Map();
                elem.forEach(function (p) {
                    _[elemVal].set(p['name'],p['value'])
                })
            }else{
                _[elemVal] = elem;
            }
        }
    }
    triggerWithEvent(data,currentAction){
        let
            rawAction = data['item'].dataset[currentAction].split(':'),
            component = rawAction[0],
            action = rawAction[1];
        MainEventBus.trigger(component,action,data);
    }
    clickHandler(e){
        const _ = this;
        let item = e.target;
        if(!item) return;
        while(item != _) {
            if( ('clickAction' in item.dataset) ){
                triggerWithEvent({'item':item,'event':e},'clickAction');
                return;
            }
            item = item.parentNode;
        }
    }
    contextHandler(e){
        const _ = this;
        e.preventDefault();
        let item = e.target;
        if(!item) return;
        if(e.which == 3){
            while(item != _) {
                if( ('contextAction' in item.dataset) ){
                    triggerWithEvent({'item':item,'event':e},'contextAction');
                    return;
                }
                item = item.parentNode;
            }
        }
    }
    focusOutHandler(e){
        let item = e.target;
        if( ('outfocusAction' in item.dataset) ){

            triggerWithEvent({item:item,event:e},'outfocusAction');
            return;
        }
    }
    changeHandler(e){
        let item = e.target;
        if( ('changeAction' in item.dataset) ){
            triggerWithEvent({'item':item,'event':e},'changeAction');
            return;
        }
    }
    inputHandler(e){
        let item = e.target;
        if( ('inputAction' in item.dataset) ){
            triggerWithEvent({'item':item,'event':e},'inputAction');
            return;
        }
    }
    keyUpHandler(e){
        let item = e.target;
        if( ('keyupAction' in item.dataset) ){
            triggerWithEvent({'item':item,'event':e},'keyupAction');
            return;
        }
    }
    submitHandler(e){
        e.preventDefault();
        let item = e.target;
        if( ('submitAction' in item.dataset) ){
            triggerWithEvent({'item':item,'event':e},'submitAction');
            return;
        }
    }
    scrollHandler(e){
        let item = e.target;
        if( ('scrollAction' in item.dataset) ){
            triggerWithEvent({'item':item,'event':e},'scrollAction');
            return;
        }
    }
    overHandler(e){
        let item = e.target;
        if( ('overAction' in item.dataset) ){
            triggerWithEvent({'item':item,'event':e},'overAction');
            return;
        }
    }
    dragStartHandler(e){
        let item = e.target;
        if( ('dragStartAction' in item.dataset) ){
            triggerWithEvent({'item':item,'event':e},'dragStartAction');
            return;
        }
    }
    dragEndHandler(e){
        let item = e.target;
        if( ('dragEndAction' in item.dataset) ){
            triggerWithEvent({'item':item,'event':e},'dragEndAction');
            return;
        }
    }
    dragOverHandler(e){
        let item = e.target;
        if( ('dragOverAction' in item.dataset) ){
            triggerWithEvent({'item':item,'event':e},'dragOverAction');
            return;
        }
    }
    dragEnterHandler(e){
        let item = e.target;
        if( ('dragEnterAction' in item.dataset) ){
            triggerWithEvent({'item':item,'event':e},'dragEnterAction');
            return;
        }
    }
    dragLeaveHandler(e){
        let item = e.target;
        if( ('dragLeaveAction' in item.dataset) ){
            triggerWithEvent({'item':item,'event':e},'dragLeaveAction');
            return;
        }
    }
    dropHandler(e){
        let item = e.target;
        if( ('dropAction' in item.dataset) ){
            triggerWithEvent({'item':item,'event':e},'dropAction');
            return;
        }
    }
    dragHandler(e){
        let item = e.target;
        if( ('dragAction' in item.dataset) ){
            triggerWithEvent({'item':item,'event':e},'dragAction');
            return;
        }
    }
    outHandler(e){
        let item = e.target;
        if( ('outAction' in item.dataset) ){
            triggerWithEvent({'item':item,'event':e},'outAction');
            return;
        }
    }

    handle(){
        const _  = this;
        _.container.addEventListener('focusout',_.focusOutHandler);
        _.container.addEventListener('submit',_.submitHandler);
        _.container.addEventListener('click', _.clickHandler);
        _.container.addEventListener('contextmenu', _.contextHandler);
        _.container.addEventListener('change',_.changeHandler);
        _.container.addEventListener('input',_.inputHandler);
        _.container.addEventListener('keyup',_.keyUpHandler);
        _.container.addEventListener('mouseover',_.overHandler);
        _.container.addEventListener('mouseout',_.outHandler);
        _.container.addEventListener('drag',_.dragHandler);
        _.container.addEventListener('dragstart',_.dragStartHandler);
        _.container.addEventListener('dragend',_.dragEndHandler);
        _.container.addEventListener('dragenter',_.dragEnterHandler);
        _.container.addEventListener('dragleave',_.dragLeaveHandler);
        _.container.addEventListener('dragover',_.dragOverHandler);
        _.container.addEventListener('drop',_.dropHandler);
        if(_.container.querySelector('core-content')){
            _.container.querySelector('.page-body').addEventListener('scroll',_.scrollHandler);
        }else{
            _.container.addEventListener('scroll',_.scrollHandler);
        }
    }

    /**/
    createFullFormData(form){
        let formData = {};
        for(let element of  form.elements){
            if(!element.name) continue;
            let property =  {
                    'elem'  : element,
                    'name' : element.name,
                    'required'  : element.required,
                    'value': element.value},
                list = element['list'];
            if(list) {
                if (list.options[0]) {
                    property['value'] = list.options[0].textContent;
                }
            }
            formData[element.name] = property;
        }
        return formData;
    }


    createFormData(form){
        let formData = {};
        for(let element of  form.elements){
            if(!element.name) continue;
            formData[element.name] = element.value;
            let list = element['list'];
            if(list) {
                if(list.options[0]) data[element.name] =list.options[0].textContent;
            }
        }
        return formData;
    }

    // Работа с поиском
    async inputSearchQuery(inputData){
        const _ = this;
        let input = inputData['item'];
        _.model.searchQuery = input.value;
    }
    async btnSearch(clickData){
        const _ = this;
        let item = clickData['item'];
        _.searchPrepare(item);
    }
    async keyUpSearch(keyUpData){
        const _ = this;
        let item = keyUpData['item'], event = keyUpData['event'];
        if ( (event['key'] === 'Enter') || (event['key'] === 'Backspace')) {
            _.searchPrepare(item);
            return;
        }
        if((event['key'] === 'Escape')){
            item.value = '';
            _.view[template]({page:1});
        }
    }
    async searchPrepare(item){
        const _ = this;
        let searchMethod = item.dataset.searchMethod ? item.dataset.searchMethod : 'search',
            template = item.dataset.template ? item.dataset.template : 'tableRowsTpl';
        _.model.searchMethod = searchMethod;
        _.search(searchMethod,template);
    }
    async search(searchMethod,template,page= 1){
        const _ = this;
        let searched = await _.model.search(page);
        let tBody = await _.view[template]({
            items: searched,
            type: 'search',
            query:  _.model.searchQuery
        });
        MainEventBus.trigger('languager','loadTranslate',tBody);
    }

    // Работа с пагинацией
    async calcItemsCount(calcData = {type:'main'}){
        const _ = this;
        return new Promise( async function (resolve) {
            calcData['type'] = calcData['type'] ? calcData['type'] : 'main';
            let cnt = 0;
            cnt = await _.model.getItemsCnt(calcData);
            resolve(parseInt(cnt));
        })
    }
    async nextPage(){
        const _ = this;
        let currentPageInpt = systemConts['content'].querySelector('.pagination-page'),
            template = currentPageInpt.dataset.template,
            searchMethod = currentPageInpt.dataset.searchMethod,
            currentPageValue = parseInt(currentPageInpt.value);
        if(currentPageValue < _.view.pages) currentPageInpt.value = ++currentPageValue;
        await _.loadPageItems(currentPageValue,template,searchMethod);

    }
    async prevPage(){
        const _ = this;
        let currentPageInpt = systemConts['content'].querySelector('.pagination-page'),
            template = currentPageInpt.dataset.template,
            searchMethod = currentPageInpt.dataset.searchMethod,
            currentPageValue = parseInt(currentPageInpt.value);
        if(currentPageValue >  1) currentPageInpt.value = --currentPageValue;
        await _.loadPageItems(currentPageValue,template,searchMethod);
    }
    async goPage(inputData){
        const _ = this;
        let
            input = inputData['item'],
            currentPageInpt = systemConts['content'].querySelector('.pagination-page'),
            currentPageValue = input.value * 1,
            template = currentPageInpt.dataset.template,
            searchMethod = currentPageInpt.dataset.searchMethod;
        if(_.currentPageValue){
            if(_.currentPageValue === currentPageValue) return;
        }else{
            _.currentPageValue = 1;
        }
        if(!isNaN(currentPageValue) && (currentPageValue) ){
            if(currentPageValue <  1) {
                input.value = 1;
                currentPageValue = 1;
            }
            if(currentPageValue >  _.view.pages){
                input.value = _.view.pages;
                currentPageValue = _.view.pages;
            }
            _.currentPageValue = currentPageValue;
        }else{
            currentPageValue = _.currentPageValue;
            input.value =  _.currentPageValue;
        }
        await _.loadPageItems(currentPageValue,template,searchMethod);
    }
    async loadPageItems(page=1,template,searchMethod){
        const _ = this;
        let type = _.model.getCurrentType(),
            tBody = '';
        if(type == 'main'){
            tBody = await _.view[template](
                {
                    page:page,
                    type: type
                }
            );
            MainEventBus.trigger('languager','loadTranslate',tBody);
        }else{
            tBody = _.search(searchMethod,template,page);
        }

    }
}
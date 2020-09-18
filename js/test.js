function isPrime(num) {
    //TODO
    function isOdd(num){
        if( (num % 2) === 0 ) return true;
    }
    function getCost(str){
        return str[str.length - 1] * 1;
    }
    function getSum(str){
        let sum = 0;
        for(let i = 0; i < str.length; i++){
            sum += str[i] * 1;
        }
        return sum;
    }

    if(num < 2) return false;
    if(num === 2 || num === 3 || num === 5) return true;

    let str = num + '';
    let cost = getCost(str);
    let sum = getSum(str);

    if(cost === 5) return false;
    if(isOdd(cost)) return false;
    if(sum % 3 === 0) return false;


    let i = 7;
    while(i < num){

        let str = i + '';
        let last = getCost(str);
        let sum = getSum(str);

        if(last === 5){
            i++;
        } else if(isOdd(last)){
            i++;
        } else if(sum % 3 === 0){
            i++;
        }
        console.log(i);
        if(num % i === 0) return false;
        i++;
    }
    return true;
}

console.log(isPrime(73));
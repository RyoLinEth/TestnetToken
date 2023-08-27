// worker.js
console.log("Init Worker");

onmessage = function (event) {
    const number = event.data;
    // 執行數字運算
    const result = calculate(5);

    // 將結果發送回主線程
    postMessage(result);
};

function calculate(number) {
    // 執行數字運算邏輯
    let sum = 0;
    for (let i = 1; i <= number; i++) {
        sum += i;
    }
    return sum;
}


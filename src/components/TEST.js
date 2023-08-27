import React, { useState, useEffect } from 'react';

function App() {
  const [randomNumber, setRandomNumber] = useState(0);
  const [sum, setSum] = useState(0);
  const [output, setOutput] = useState('');
  const [number, setNumber] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Submitting")
  }

  const handleNumberChange = (event) => {
    const number = event.target.value;
    setNumber(number);
  };

  useEffect(() => {
    generateRandomNumber();
  }, []); // 在组件加载时调用一次生成随机数

  const generateRandomNumber = () => {
    const newRandomNumber = Math.floor(Math.random() * 10) + 1;
    setRandomNumber(newRandomNumber);
    setSum(sum + newRandomNumber);
  };

  const checkSumEndsWithZero = () => {
    return sum % 10 === 0;
  };

  const handleButtonClick = () => {
    if (!checkSumEndsWithZero()) {
      generateRandomNumber();
    }
  };

  useEffect(() => {
    if (checkSumEndsWithZero()) {
      setOutput((prevOutput) => prevOutput + '\nSum ends with zero. Calculation finished.');
    } else {
      setOutput((prevOutput) => prevOutput + `\nRandom number: ${randomNumber} / Sum: ${sum}`);
    }
  }, [randomNumber, sum]);

  return (
    <div>
      <button onClick={handleButtonClick} disabled={checkSumEndsWithZero()}>
        {checkSumEndsWithZero() ? 'Calculation finished' : 'Generate Random Number'}
      </button>
      <br />
      <pre>{output}</pre>
      <div>
        <h1>數字計算</h1>
        <form onSubmit={handleSubmit}>
          <input type="number" value={number} onChange={handleNumberChange} />
          <button type="submit">計算</button>
        </form>
        {result && <p>計算結果: {result}</p>}
      </div>
    </div>
  );
}

export default App;

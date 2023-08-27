import WalletConnect from './components/WallectConnector';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Pools from './components/Pools';
import Wizard from './components/Steps/Wizard';
import TokenFaucet from './components/TokenFaucet';
import './App.css'
import NFTContent from './components/NFTContent';
import MyNFTs from './components/MyNFTs';
import PoolsControl from './components/PoolsControl';
import Robot from './components/Robot';
import FunctionBot from './components/FunctionBot'
import TransferBot from './components/TransferBot';
import TEST from './components/TEST';
// Import your worker 
import worker from 'workerize-loader!./TESTWORKER'; // eslint-disable-line import/no-webpack-loader-syntax
const workerInstance = new worker()

function App() {
  const [defaultAccount, setDefaultAccount] = useState(null);

  const [menuOpenNumber, setMenuOpenNumber] = useState(0);

  const handleDefaultAccount = (value) => {
    setDefaultAccount(value);
    console.log("Account Change to " + value)
  }
  const togglePoolMenu = () => {
    if (menuOpenNumber === 1) setMenuOpenNumber(0)
    else
      setMenuOpenNumber(1);
  };

  const toggleNftMenu = () => {
    if (menuOpenNumber === 2) setMenuOpenNumber(0)
    else
      setMenuOpenNumber(2);
  };
  const toggleTestMenu = () => {
    if (menuOpenNumber === 3) setMenuOpenNumber(0)
    else
      setMenuOpenNumber(3);
  };



  return (
    <Router>
      <div>
        <h1 style={{ position: 'fixed', top: '10px', left: '10vw' }}>TEST App</h1>
        <div style={{ position: 'fixed', top: '10px', right: '10vw' }}>
          <WalletConnect defaultAccountChange={handleDefaultAccount} />
        </div>
        <nav className="navigation" style={{ marginTop: '100px' }}>
          <ul className="navigation__links">
            <li><Link to="/">Home</Link></li>
            <li>
              <span onClick={toggleNftMenu}>Robot</span>
              <ul>
                <li><Link to="/bot">Trading Bot</Link></li>
                <li><Link to="/functionBot">Function Bot</Link></li>
                <li><Link to="/transferBot">TransferBot</Link></li>
              </ul>
            </li>
            <li>
              <span onClick={togglePoolMenu}>Pool</span>
              {/* {menuOpenNumber === 1 && ( */}
              <ul>
                <li><Link to="/viewPool">View Pools</Link></li>
                <li><Link to="/createPool">Create Pool</Link></li>
                <li><Link to="/tokenFaucet">Token Faucet</Link></li>
                <li><Link to="/poolsControl">Pool Control</Link></li>
              </ul>
              {/* )} */}
            </li>
            <li>
              <span onClick={toggleNftMenu}>NFT</span>
              <ul>
                <li><Link to="/nftContent">NFT Content</Link></li>
                <li><Link to="/myNFTs">My NFT</Link></li>
              </ul>
            </li>
            <li>
              <span onClick={toggleTestMenu}>TEST</span>
              <ul>
                <li><Link to="/test">TEST</Link></li>
              </ul>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/viewPool"
            element={
              <Pools defaultAccount={defaultAccount}
              // isFiltered={isFiltered} setIsFiltered={setIsFiltered} 
              />} />
          <Route path="/createPool" element={<Wizard defaultAccount={defaultAccount} />} />
          <Route path="/tokenFaucet" element={<TokenFaucet />} />
          <Route path="/nftContent" element={<NFTContent />} />
          <Route path="/myNFTs" element={<MyNFTs defaultAccount={defaultAccount} />} />
          <Route path="/poolsControl" element={<PoolsControl defaultAccount={defaultAccount} />} />
          <Route path="/bot" element={<Robot />} />
          <Route path="/functionBot" element={<FunctionBot />} />
          <Route path="/transferBot" element={<TransferBot />} />
          <Route path="/test" element={<TEST />} />
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
  const initMessage = "Init Message";
  const [reply, setReply] = useState(initMessage);
  const [listenerStarted, setListenerStarted] = useState(false);

  const sendMessage = () => {
    if (!listenerStarted) return console.log("Not Started");
    console.log("Message Sent")
    workerInstance.calculatePrimes(1, 2)
  }

  const isObject = (value) => {
    return typeof value === 'object' && value !== null ? true : false;
  }

  const startReceive = () => {
    console.log("Start To Receive Message");
    setListenerStarted(true);

    workerInstance.addEventListener('message', (message) => {
      console.log('New Message: ', message.data)
      if (!isObject(message.data))
        setReply((prevOutput) => prevOutput + '\n' + `${message.data}`)
    })
  }

  const endReceive = () => {
    setListenerStarted(false);
    console.log("End Receiving Message");
    workerInstance.terminate()
  }

  return (
    <>
      <h2
        style={{ marginTop: '20vh' }}
      >
        Welcome to the homepage
      </h2>
      <button onClick={sendMessage}>
        Send Message
      </button>
      <button onClick={() => startReceive()}>
        Receive Message
      </button>
      <button onClick={endReceive}>
        End Message
      </button>
      <button onClick={() => setReply(initMessage)}>
        Reinit
      </button>
      <div>
        The Reply : <br />
        <pre>
          {reply}
        </pre>
      </div>
    </>
  )
}

export default App;

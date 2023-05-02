import WalletConnect from './components/WallectConnector';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Pools from './components/Pools';
import Wizard from './components/Steps/Wizard';
import TokenFaucet from './components/TokenFaucet';
import './App.css'
import NFTContent from './components/NFTContent';
import MyNFTs from './components/MyNFTs';
import PoolsControl from './components/PoolsControl';

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
              {/* {menuOpenNumber === 2 && ( */}
                <ul>
                  <li><Link to="/nftContent">NFT Content</Link></li>
                  <li><Link to="/myNFTs">My NFT</Link></li>
                </ul>
              {/* )} */}
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
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <h2
      style={{ marginTop: '20vh' }}
    >
      Welcome to the homepage
    </h2>
  )
}

export default App;

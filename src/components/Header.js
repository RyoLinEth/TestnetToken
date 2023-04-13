import React from 'react'

const Header = () => {

    const headerStyle = {
        backgroundColor:'#ECECFF',
        height:'15vh',
        borderBottom:'1px solid white'
    }
    return (
        <div style={headerStyle}>
            <img alt="Logo" style={{
                position : 'absolute',
                top : '5vh',
                left : '5vw',
            }}/>
        </div>
    )
}

export default Header

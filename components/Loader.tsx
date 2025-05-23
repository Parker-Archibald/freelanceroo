import React from 'react'

function Loader() {
    return (
        <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center -z-10">
            <div className="loader">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    )
}

export default Loader

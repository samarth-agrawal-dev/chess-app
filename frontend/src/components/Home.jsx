import { Link } from "react-router-dom"
const Home = () => {
  return (
    <div className="bg-[#302E2B] flex gap-8">
        <div className="bg-[#262522] py-5 px-3 font-[arial] font-bold flex flex-col items-center gap-10 min-h-screen">
            <img src="../assets/logo.png" alt="logo"  width={150}/>
        </div>
        <div className="py-[40px] ml-[100px] flex gap-[60px] min-h-screen">
            <img src="../assets/chess.png" alt="board" className="w-[496px] h-[496px]"/>
            <div className="flex flex-col text-white w-[500px] items-center gap-[25px]">
                <span className="font-[arial] font-bold text-[50px] text-center">Play Chess Online on the #1 Site</span>
                <div className="flex gap-[50px]"><span><b>1,569,832</b> Games Today.</span><span><b>35,762</b> Playing Now.</span></div>
                <Link to="/game" className="bg-[#81B64C] flex items-center gap-5 w-[370px] p-6 rounded-[30px] hover:opacity-85">
                    <img src="../assets/online.svg" alt="logo" width={70}/>
                    <div className="flex flex-col">
                        <span className="text-[26px] font-bold">Play Online</span>
                        <span className="text-[14px]">Play real-time games with online players.</span>
                    </div>
                </Link>
                <Link to="/botgame" className="bg-[#454341] flex items-center gap-5 w-[370px] p-6 rounded-[30px] hover:opacity-85">
                    <img src="../assets/cute-bot.32735490.svg" alt="logo" width={70}/>
                    <div className="flex flex-col">
                        <span className="text-[26px] font-bold">Play with AI</span>
                        <span className="text-[14px]">Play vs an intelligent AI-based bot</span>
                    </div>
                </Link>
            </div>
        </div>
    </div>
  )
}

export default Home
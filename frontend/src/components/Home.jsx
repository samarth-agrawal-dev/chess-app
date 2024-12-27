import { Link } from "react-router-dom"
const Home = () => {
  return (
    <div className="bg-[#302E2B] flex flex-col xl:flex-row gap-[5px] xl:gap-8">
        <div className="bg-[#302E2B] pt-5 px-0 xl:px-3 font-[arial] font-bold flex flex-col items-center gap-10 h-[50px] xl:min-h-screen">
            <img src="../assets/logo.png" alt="logo" className="w-[150px]"/>
        </div>
        <div className="lg:py-[40px] max-w-screen m-0 xl:ml-[100px] flex flex-col xl:flex-row gap-[25px] xl:gap-[60px] min-h-[95vh] xl:min-h-screen justify-center items-center">
            <img src="../assets/chess.png" alt="board" className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] xl:w-[496px] xl:h-[496px] pb-0 mb-0"/>
            <div className="pt-0 mt-0 flex flex-col text-white w-[250px] xl:w-[500px] items-center gap-[25px]">
                <span className="font-[arial] font-bold text-[25px] xl:text-[50px] text-center">Play Chess Online on the #1 Site</span>
                <div className="hidden xl:flex gap-[50px]"><span><b>1,569,832</b> Games Today.</span><span><b>35,762</b> Playing Now.</span></div>
                <div className="flex flex-row xl:flex-col gap-[25px]">
                    <Link to="/game" className="bg-[#81B64C] flex flex-col justify-center xl:flex-row items-center gap-5 w-[150px] xl:w-[370px] p-3 xl:p-6 rounded-[20px] xl:rounded-[30px] hover:opacity-85">
                        <img src="../assets/online.svg" alt="logo" className="w-[55px] xl:w-[70px]"/>
                        <div className="flex flex-col">
                            <span className="text-[18px] xl:text-[26px] font-bold text-center xl:text-left">Play Online</span>
                            <span className="text-[14px] hidden xl:inline">Play real-time games with online players.</span>
                        </div>
                    </Link>
                    <Link to="/botgame" className="bg-[#454341] flex flex-col justify-center xl:flex-row items-center gap-5 w-[150px] xl:w-[370px] p-3 xl:p-6 rounded-[20px] xl:rounded-[30px] hover:opacity-85">
                        <img src="../assets/cute-bot.32735490.svg" alt="logo" className="w-[55px] xl:w-[70px]"/>
                        <div className="flex flex-col">
                            <span className="text-[18px] xl:text-[26px] font-bold text-center xl:text-left">Play with AI</span>
                            <span className="text-[14px] hidden xl:inline">Play vs an intelligent AI-based bot</span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Home
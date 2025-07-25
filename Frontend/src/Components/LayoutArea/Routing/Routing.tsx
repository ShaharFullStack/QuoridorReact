import { Navigate, Route, Routes } from "react-router-dom";
import { Home } from "../../PagesArea/Home/Home";
import { Login } from "../../PagesArea/Login/Login";
import { Dashboard } from "../../PagesArea/Dashboard/Dashboard";
import { GameScreen } from "../../PagesArea/GameScreen/GameScreen";
import { Shop } from "../../PagesArea/Shop/Shop";
import { Profile } from "../../PagesArea/Profile/Profile";
import { Leaderboard } from "../../PagesArea/Leaderboard/Leaderboard";
import { Page404 } from "../Page404/Page404";
import "./Routing.css";

export function Routing(): JSX.Element {

    return (
        <div className="Routing">
            <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />
                
                <Route path="/dashboard" element={<Dashboard />} />
                
                <Route path="/game" element={<GameScreen />} />
                <Route path="/game/:mode" element={<GameScreen />} />
                
                <Route path="/shop" element={<Shop />} />
                
                <Route path="/profile" element={<Profile />} />
                
                <Route path="/leaderboard" element={<Leaderboard />} />

                <Route path="*" element={<Page404 />} />
            </Routes>
        </div>
    );
}

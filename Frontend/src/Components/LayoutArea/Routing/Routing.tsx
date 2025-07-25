import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "../../Common/ErrorBoundary/ErrorBoundary";
import { LoadingSpinner } from "../../Common/LoadingSpinner/LoadingSpinner";
import "./Routing.css";

// Lazy load page components for better performance
const Home = lazy(() => import("../../PagesArea/Home/Home").then(module => ({ default: module.Home })));
const Login = lazy(() => import("../../PagesArea/Login/Login").then(module => ({ default: module.Login })));
const Dashboard = lazy(() => import("../../PagesArea/Dashboard/Dashboard").then(module => ({ default: module.Dashboard })));
const GameScreen = lazy(() => import("../../PagesArea/GameScreen/GameScreen").then(module => ({ default: module.GameScreen })));
const Shop = lazy(() => import("../../PagesArea/Shop/Shop").then(module => ({ default: module.Shop })));
const Profile = lazy(() => import("../../PagesArea/Profile/Profile").then(module => ({ default: module.Profile })));
const Leaderboard = lazy(() => import("../../PagesArea/Leaderboard/Leaderboard").then(module => ({ default: module.Leaderboard })));
const Page404 = lazy(() => import("../Page404/Page404").then(module => ({ default: module.Page404 })));

export function Routing(): JSX.Element {
    const loadingFallback = (
        <LoadingSpinner 
            fullScreen 
            size="large" 
            text="Loading page..." 
        />
    );

    return (
        <div className="Routing">
            <ErrorBoundary>
                <Suspense fallback={loadingFallback}>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/home" element={<Dashboard />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/game" element={<GameScreen />} />
                        <Route path="/game/:mode" element={<GameScreen />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="*" element={<Page404 />} />
                    </Routes>
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}

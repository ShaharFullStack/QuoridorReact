import { NavLink } from "react-router-dom";
import "./Menu.css";

export function Menu(): JSX.Element {
    return (
        <nav className="Menu" aria-label="Main Navigation">
            <NavLink to="/home" className={({ isActive }) => "menu-item" + (isActive ? " active" : "")}>
                Home
            </NavLink>
            <NavLink to="/list" className={({ isActive }) => "menu-item" + (isActive ? " active" : "")}>
                List
            </NavLink>
            <NavLink to="/new" className={({ isActive }) => "menu-item" + (isActive ? " active" : "")}>
                New
            </NavLink>
        </nav>
    );
}
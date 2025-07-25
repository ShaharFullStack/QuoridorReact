import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { AppState } from "../../../Redux/Store";
import { UserModel } from "../../../Models/UserModel";
import { userService } from "../../../Services/UserService";
import { notify } from "../../../Utils/Notify";
import "./UserMenu.css";

export function UserMenu(): JSX.Element {
    const user = useSelector<AppState, UserModel | null>(state => state.user);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Helper to get initials for the avatar
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    };

    const handleLogout = () => {
        if (user) {
            notify.success(`Bye bye, ${user.firstName}!`);
        }
        userService.logout();
        setDropdownOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (!user) {
        return (
            <div className="UserMenu-guest">
                <NavLink to="/login" className="guest-link login">Login</NavLink>
                <NavLink to="/register" className="guest-link register">Register</NavLink>
            </div>
        );
    }

    return (
        <div className="UserMenu" ref={menuRef}>
            <button className="UserMenu-trigger" onClick={() => setDropdownOpen(!isDropdownOpen)}>
                <div className="UserMenu-avatar">
                    {getInitials(user.firstName, user.lastName)}
                </div>
                <span className="UserMenu-name">
                    {user.firstName}
                </span>
                {/* Simple caret icon */}
                <svg className={`caret ${isDropdownOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            {isDropdownOpen && (
                <div className="UserMenu-dropdown">
                    <div className="dropdown-header">
                        <p className="dropdown-name">{user.firstName} {user.lastName}</p>
                        <p className="dropdown-email">{user.email}</p>
                    </div>
                    <NavLink to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        My Profile
                    </NavLink>
                    <NavLink to="/home" className="dropdown-item logout" onClick={handleLogout}>
                        Logout
                    </NavLink>
                </div>
            )}
        </div>
    );
}